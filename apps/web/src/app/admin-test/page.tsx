"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    getAdminUser,
    type AdminMeResponse,
} from "@/features/auth/services/admin.api";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AdminTestPage() {
    const { user, loading } = useAuth();

    const [response, setResponse] =
        useState<AdminMeResponse | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] =
        useState(false);

    async function handleTestAdmin() {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getAdminUser();

            setResponse(data);
        } catch (error) {
            setResponse(null);

            setError(
                error instanceof Error
                    ? error.message
                    : "Erro desconhecido.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6">
                <p>Carregando autenticação...</p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6">
                <p>Usuário não autenticado.</p>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-lg space-y-6 rounded-xl border p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Teste de acesso ADMIN
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Validação feita pelo Fastify usando o role salvo no Firestore.
                    </p>
                </div>

                <Button
                    type="button"
                    className="w-full"
                    disabled={isLoading}
                    onClick={handleTestAdmin}
                >
                    {isLoading
                        ? "Validando..."
                        : "Testar acesso ADMIN"}
                </Button>

                {error && (
                    <div className="rounded-lg border p-4 text-sm">
                        <strong>Acesso negado / erro:</strong>{" "}
                        {error}
                    </div>
                )}

                {response && (
                    <div className="space-y-2 rounded-lg border p-4">
                        <h2 className="font-semibold">
                            Acesso administrativo autorizado ✅
                        </h2>

                        <div>
                            <strong>Nome:</strong>{" "}
                            {response.user.displayName ??
                                "Não informado"}
                        </div>

                        <div>
                            <strong>E-mail:</strong>{" "}
                            {response.user.email ??
                                "Não informado"}
                        </div>

                        <div>
                            <strong>Perfil:</strong>{" "}
                            {response.user.role}
                        </div>

                        <div>
                            <strong>Salão:</strong>{" "}
                            {response.user.salonId}
                        </div>

                        <div>
                            <strong>Área:</strong>{" "}
                            {response.access.area}
                        </div>

                        <div>
                            <strong>Autorizado:</strong>{" "}
                            {response.access.authorized
                                ? "Sim"
                                : "Não"}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}