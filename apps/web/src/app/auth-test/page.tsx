"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/features/auth/services/auth.api";
import { useAuth } from "@/features/auth/hooks/useAuth";

type ApiUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
};

export default function AuthTestPage() {
  const { user, loading } = useAuth();

  const [apiUser, setApiUser] =
    useState<ApiUser | null>(null);

  const [apiError, setApiError] =
    useState<string | null>(null);

  const [apiLoading, setApiLoading] =
    useState(false);

  async function handleTestAuthenticatedApi() {
    try {
      setApiLoading(true);
      setApiError(null);

      const response =
        await getAuthenticatedUser();

      setApiUser(response);
    } catch (error) {
      setApiUser(null);

      setApiError(
        error instanceof Error
          ? error.message
          : "Erro desconhecido.",
      );
    } finally {
      setApiLoading(false);
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
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Usuário não autenticado
          </h1>

          <p className="mt-2 text-muted-foreground">
            Faça login para visualizar os dados da sessão.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 rounded-xl border p-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Autenticação funcionando ✅
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Dados lidos diretamente pelo Firebase Auth no frontend.
          </p>
        </div>

        <div className="space-y-2">
          <div>
            <strong>Nome:</strong>{" "}
            {user.displayName ?? "Não informado"}
          </div>

          <div>
            <strong>E-mail:</strong>{" "}
            {user.email ?? "Não informado"}
          </div>

          <div>
            <strong>UID:</strong>{" "}
            <span className="break-all">
              {user.uid}
            </span>
          </div>
        </div>

        <Button
          type="button"
          className="w-full"
          disabled={apiLoading}
          onClick={handleTestAuthenticatedApi}
        >
          {apiLoading
            ? "Validando..."
            : "Testar API autenticada"}
        </Button>

        {apiError && (
          <div className="rounded-lg border p-4 text-sm">
            <strong>Erro da API:</strong>{" "}
            {apiError}
          </div>
        )}

        {apiUser && (
          <div className="space-y-2 rounded-lg border p-4">
            <h2 className="font-semibold">
              Resposta do Fastify ✅
            </h2>

            <div>
              <strong>UID:</strong>{" "}
              <span className="break-all">
                {apiUser.uid}
              </span>
            </div>

            <div>
              <strong>E-mail:</strong>{" "}
              {apiUser.email ?? "Não informado"}
            </div>

            <div>
              <strong>E-mail verificado:</strong>{" "}
              {apiUser.emailVerified
                ? "Sim"
                : "Não"}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}