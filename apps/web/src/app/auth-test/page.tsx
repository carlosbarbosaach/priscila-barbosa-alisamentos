"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getAuthenticatedUser,
  type AuthMeResponse,
} from "@/features/auth/services/auth.api";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AuthTestPage() {
  const { user, loading } = useAuth();

  const [apiResponse, setApiResponse] =
    useState<AuthMeResponse | null>(null);

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

      setApiResponse(response);
    } catch (error) {
      setApiResponse(null);

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
            Firebase Auth + Fastify + Firestore.
          </p>
        </div>

        <div className="space-y-2">
          <div>
            <strong>Nome Firebase:</strong>{" "}
            {user.displayName ?? "Não informado"}
          </div>

          <div>
            <strong>E-mail Firebase:</strong>{" "}
            {user.email ?? "Não informado"}
          </div>

          <div>
            <strong>UID Firebase:</strong>{" "}
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
            <strong>Erro:</strong>{" "}
            {apiError}
          </div>
        )}

        {apiResponse && (
          <div className="space-y-2 rounded-lg border p-4">
            <h2 className="font-semibold">
              Resposta do Fastify ✅
            </h2>

            <div>
              <strong>ID:</strong>{" "}
              <span className="break-all">
                {apiResponse.user.id}
              </span>
            </div>

            <div>
              <strong>Nome:</strong>{" "}
              {apiResponse.user.displayName ??
                "Não informado"}
            </div>

            <div>
              <strong>E-mail:</strong>{" "}
              {apiResponse.user.email ??
                "Não informado"}
            </div>

            <div>
              <strong>Perfil:</strong>{" "}
              {apiResponse.user.role}
            </div>

            <div>
              <strong>Salão:</strong>{" "}
              {apiResponse.user.salonId}
            </div>

            <div>
              <strong>Ativo:</strong>{" "}
              {apiResponse.user.active
                ? "Sim"
                : "Não"}
            </div>

            <div>
              <strong>E-mail verificado:</strong>{" "}
              {apiResponse.firebase.emailVerified
                ? "Sim"
                : "Não"}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}