"use client";

import {
    USER_ROLES,
} from "@priscila/shared";

import {
    CheckCircle2,
    Loader2,
    LogOut,
    MailCheck,
    RefreshCw,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    Button,
} from "@/components/ui/button";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

import {
    logout,
    reloadAuthenticatedUser,
    resendVerificationEmail,
} from "@/features/services/auth.service";

export default function VerifyEmailPage() {
    const router =
        useRouter();

    const {
        user,
        appUser,
        emailVerified,
        loading,
        refreshSession,
    } = useAuth();

    const [
        checking,
        setChecking,
    ] = useState(false);

    const [
        resending,
        setResending,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] =
        useState<string | null>(
            null,
        );

    const [
        error,
        setError,
    ] =
        useState<string | null>(
            null,
        );

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            router.replace(
                "/entrar",
            );

            return;
        }

        if (
            appUser?.role ===
            USER_ROLES.ADMIN
        ) {
            router.replace(
                "/admin",
            );

            return;
        }

        if (
            appUser?.role ===
                USER_ROLES.CLIENT &&
            emailVerified
        ) {
            router.replace(
                "/cliente",
            );
        }
    }, [
        appUser,
        emailVerified,
        loading,
        router,
        user,
    ]);

    async function handleCheckVerification() {
        setChecking(true);
        setError(null);
        setMessage(null);

        try {
            const verified =
                await reloadAuthenticatedUser();

            if (!verified) {
                setMessage(
                    "Seu e-mail ainda não foi confirmado. Abra a mensagem enviada para sua caixa de entrada e clique no link de verificação.",
                );

                return;
            }

            /*
             * Agora que o token possui
             * email_verified = true,
             * chamamos /auth/me novamente.
             *
             * É aqui que o backend poderá
             * executar o vínculo automático
             * com clients.
             */
            await refreshSession();

            setMessage(
                "E-mail confirmado com sucesso.",
            );

            router.replace(
                "/cliente",
            );
        } catch (verificationError) {
            setError(
                verificationError instanceof
                    Error
                    ? verificationError.message
                    : "Não foi possível verificar o e-mail.",
            );
        } finally {
            setChecking(false);
        }
    }

    async function handleResend() {
        setResending(true);
        setError(null);
        setMessage(null);

        try {
            await resendVerificationEmail();

            setMessage(
                "Enviamos um novo e-mail de verificação.",
            );
        } catch (resendError) {
            setError(
                resendError instanceof
                    Error
                    ? resendError.message
                    : "Não foi possível reenviar o e-mail.",
            );
        } finally {
            setResending(false);
        }
    }

    async function handleLogout() {
        await logout();

        router.replace(
            "/entrar",
        );
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF]">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-4 py-10">
            <div className="w-full max-w-lg rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F5EBD2] text-[#8A6A2F]">
                    <MailCheck className="size-6" />
                </div>

                <p className="mt-7 text-sm font-medium tracking-wide text-[#65715F]">
                    PRISCILA BARBOSA ALISAMENTOS
                </p>

                <h1 className="mt-2 text-2xl font-semibold">
                    Confirme seu e-mail
                </h1>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Enviamos uma mensagem de confirmação para:
                </p>

                <div className="mt-3 rounded-xl bg-muted/40 px-4 py-3">
                    <p className="break-all text-sm font-medium">
                        {user?.email ??
                            "E-mail da conta"}
                    </p>
                </div>

                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    Abra o e-mail, clique no link de confirmação
                    e depois volte para esta tela.
                </p>

                {message && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                        <div className="flex gap-3">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-700" />

                            <p className="text-sm text-green-800">
                                {message}
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                <div className="mt-7 space-y-3">
                    <Button
                        type="button"
                        className="w-full bg-[#304229] text-white hover:bg-[#24351F]"
                        disabled={
                            checking ||
                            resending
                        }
                        onClick={() =>
                            void handleCheckVerification()
                        }
                    >
                        {checking ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />

                                Verificando...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 size-4" />

                                Já verifiquei meu e-mail
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={
                            checking ||
                            resending
                        }
                        onClick={() =>
                            void handleResend()
                        }
                    >
                        {resending
                            ? "Reenviando..."
                            : "Reenviar e-mail"}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        disabled={
                            checking ||
                            resending
                        }
                        onClick={() =>
                            void handleLogout()
                        }
                    >
                        <LogOut className="mr-2 size-4" />

                        Sair e usar outra conta
                    </Button>
                </div>
            </div>
        </main>
    );
}