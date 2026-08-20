"use client";

import {
  BellRing,
  CalendarDays,
  CircleCheckBig,
  CircleX,
  Clock3,
  RefreshCw,
} from "lucide-react";

import {
  DashboardHeader,
} from "@/components/admin/dashboard/DashboardHeader";

import {
  DashboardMetricCard,
} from "@/components/admin/dashboard/DashboardMetricCard";

import {
  PendingAppointments,
} from "@/components/admin/dashboard/PendingAppointments";

import {
  Button,
} from "@/components/ui/button";

import {
  useDashboard,
} from "../hooks/useDashboard";

export function DashboardContent() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } =
    useDashboard();

  const pendingApproval =
    data?.metrics
      .pendingApproval ??
    0;

  const hasPendingAppointments =
    pendingApproval > 0;

  return (
    <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
      {/* CABEÇALHO */}
      <DashboardHeader />

      {/* LOADING */}
      {isLoading && (
        <>
          <section className="mt-8">
            <div className="h-[120px] animate-pulse rounded-2xl border border-[#E5DED1] bg-[#FFFDF8]" />
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 4,
            }).map(
              (
                _,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-[168px] animate-pulse rounded-2xl border border-[#E5DED1] bg-[#FFFDF8]"
                />
              ),
            )}
          </section>
        </>
      )}

      {/* ERRO */}
      {isError && (
        <section className="mt-8">
          <div className="rounded-2xl border border-[#E5DED1] bg-[#FFFDF8] p-6 shadow-sm sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#F1EBDD]">
              <RefreshCw className="size-5 text-[#465B36]" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#20241D]">
              Não foi possível carregar
              o dashboard
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#73776D]">
              Verifique a conexão com a
              API ou tente carregar os
              dados novamente.
            </p>

            <Button
              type="button"
              disabled={
                isFetching
              }
              className="mt-5 bg-[#304229] text-white hover:bg-[#24351F]"
              onClick={() =>
                void refetch()
              }
            >
              <RefreshCw
                className={[
                  "mr-2 size-4",
                  isFetching
                    ? "animate-spin"
                    : "",
                ].join(
                  " ",
                )}
              />

              {isFetching
                ? "Atualizando..."
                : "Tentar novamente"}
            </Button>
          </div>
        </section>
      )}

      {/* DASHBOARD */}
      {data &&
        !isLoading &&
        !isError && (
          <>
            {/* ALERTA DE PENDÊNCIAS */}
            {hasPendingAppointments && (
              <section className="mt-8">
                <div className="relative overflow-hidden rounded-2xl border border-[#E5CF92] bg-[#FFF8E7] shadow-sm">
                  {/* DETALHE DECORATIVO */}
                  <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-[#D9B96E]/15" />

                  <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                    {/* ÍCONE */}
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#8A6A2F] text-white shadow-sm">
                      <BellRing className="size-5" />
                    </div>

                    {/* TEXTO */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A6A2F]">
                        Atenção da equipe
                      </p>

                      <h2 className="mt-1 text-lg font-bold text-[#3B321F] sm:text-xl">
                        {pendingApproval ===
                          1
                          ? "1 solicitação aguardando confirmação"
                          : `${pendingApproval} solicitações aguardando confirmação`}
                      </h2>

                      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#77643B]">
                        Existem clientes
                        aguardando uma
                        resposta do salão.
                        Confira as
                        solicitações
                        pendentes abaixo.
                      </p>
                    </div>

                    {/* CONTADOR */}
                    <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                      <div className="flex min-w-14 items-center justify-center rounded-2xl bg-[#8A6A2F] px-4 py-3 text-2xl font-bold tabular-nums text-white shadow-sm">
                        {pendingApproval >
                          99
                          ? "99+"
                          : pendingApproval}
                      </div>

                      <span className="text-xs font-semibold text-[#8A6A2F]">
                        {pendingApproval ===
                          1
                          ? "pendente"
                          : "pendentes"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* MÉTRICAS */}
            <section
              className={[
                "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
                hasPendingAppointments
                  ? "mt-5"
                  : "mt-8",
              ].join(
                " ",
              )}
            >
              <DashboardMetricCard
                title="Agendamentos hoje"
                value={
                  data.metrics
                    .appointmentsToday
                }
                description="Atendimentos previstos para hoje."
                icon={
                  CalendarDays
                }
              />

              <DashboardMetricCard
                title="Aguardando confirmação"
                value={
                  data.metrics
                    .pendingApproval
                }
                description={
                  hasPendingAppointments
                    ? "Existem solicitações que precisam de atenção."
                    : "Nenhuma solicitação aguardando aprovação."
                }
                icon={
                  Clock3
                }
              />

              <DashboardMetricCard
                title="Confirmados"
                value={
                  data.metrics
                    .confirmedToday
                }
                description="Agendamentos confirmados para hoje."
                icon={
                  CircleCheckBig
                }
              />

              <DashboardMetricCard
                title="Cancelados"
                value={
                  data.metrics
                    .cancelledToday
                }
                description="Agendamentos cancelados durante o dia."
                icon={
                  CircleX
                }
              />
            </section>

            {/* SOLICITAÇÕES PENDENTES */}
            <section className="mt-6 sm:mt-8">
              <PendingAppointments
                appointments={
                  data
                    .pendingAppointments
                }
                timezone={
                  data.timezone
                }
              />
            </section>
          </>
        )}
    </main>
  );
}