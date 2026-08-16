"use client";

import {
    createContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    onAuthStateChanged,
    type User,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/auth";

import type { AuthContextValue } from "../types/auth.types";

export const AuthContext =
    createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            firebaseAuth,
            (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            },
        );

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}