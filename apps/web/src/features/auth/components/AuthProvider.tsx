"use client";

import type {
    AppUser,
} from "@priscila/shared";

import {
    onAuthStateChanged,
    type User,
} from "firebase/auth";

import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { firebaseAuth } from "@/lib/firebase/auth";

import {
    getAuthMe,
    type ClientAuthLink,
} from "../auth.api";

import type {
    AuthContextValue,
} from "../types/auth.types";

export const AuthContext =
    createContext<
        AuthContextValue | undefined
    >(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [
        user,
        setUser,
    ] =
        useState<User | null>(
            null,
        );

    const [
        appUser,
        setAppUser,
    ] =
        useState<AppUser | null>(
            null,
        );

    const [
        clientLink,
        setClientLink,
    ] =
        useState<ClientAuthLink | null>(
            null,
        );

    const [
        emailVerified,
        setEmailVerified,
    ] =
        useState(false);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        sessionError,
        setSessionError,
    ] =
        useState<string | null>(
            null,
        );

    const clearApplicationSession =
        useCallback(() => {
            setAppUser(null);
            setClientLink(null);
            setEmailVerified(false);
            setSessionError(null);
        }, []);

    const loadApplicationSession =
        useCallback(
            async (
                currentUser: User,
            ) => {
                try {
                    setSessionError(
                        null,
                    );

                    const response =
                        await getAuthMe();

                    /*
                     * Segurança contra corrida:
                     *
                     * se durante a requisição
                     * o usuário fez logout
                     * ou outra conta entrou,
                     * não aplicamos uma sessão
                     * antiga ao contexto.
                     */
                    if (
                        firebaseAuth
                            .currentUser
                            ?.uid !==
                        currentUser.uid
                    ) {
                        return;
                    }

                    setAppUser(
                        response.user,
                    );

                    setClientLink(
                        response.clientLink,
                    );

                    setEmailVerified(
                        response.firebase
                            .emailVerified,
                    );
                } catch (error) {
                    setAppUser(null);
                    setClientLink(null);

                    setEmailVerified(
                        currentUser
                            .emailVerified,
                    );

                    setSessionError(
                        error instanceof
                            Error
                            ? error.message
                            : "Não foi possível carregar a sessão do usuário.",
                    );
                }
            },
            [],
        );

    const refreshSession =
        useCallback(
            async () => {
                const currentUser =
                    firebaseAuth.currentUser;

                if (!currentUser) {
                    clearApplicationSession();

                    return;
                }

                setLoading(true);

                try {
                    await loadApplicationSession(
                        currentUser,
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                clearApplicationSession,
                loadApplicationSession,
            ],
        );

    useEffect(() => {
        let active = true;

        const unsubscribe =
            onAuthStateChanged(
                firebaseAuth,

                (currentUser) => {
                    if (!active) {
                        return;
                    }

                    setUser(
                        currentUser,
                    );

                    /*
                     * Logout / usuário
                     * não autenticado.
                     */
                    if (!currentUser) {
                        clearApplicationSession();

                        setLoading(
                            false,
                        );

                        return;
                    }

                    /*
                     * Firebase autenticou.
                     *
                     * Agora carregamos
                     * a identidade da
                     * aplicação pelo
                     * nosso backend.
                     */
                    setLoading(true);

                    void loadApplicationSession(
                        currentUser,
                    ).finally(() => {
                        if (active) {
                            setLoading(
                                false,
                            );
                        }
                    });
                },
            );

        return () => {
            active = false;

            unsubscribe();
        };
    }, [
        clearApplicationSession,
        loadApplicationSession,
    ]);

    return (
        <AuthContext.Provider
            value={{
                user,
                appUser,
                clientLink,
                emailVerified,
                loading,
                sessionError,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}