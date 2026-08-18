"use client";

import {
  APPOINTMENT_STATUS,
  type AppointmentStatus,
} from "@priscila/shared";

import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import Link from "next/link";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  useClientAppointments,
} from "@/features/appointments/hooks/useClientAppointments";

/*
 * Mantemos a exibição das datas
 * no fuso horário do salão.
 */
const SALON_TIME_ZONE =
  "America/Sao_Paulo";

const dateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      timeZone:
        SALON_TIME_ZONE,
    },
  );

const timeFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone:
        SALON_TIME_ZONE,
    },
  );

const currencyFormatter =
  new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );

function formatAppointmentDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Data não disponível";
  }

  return dateFormatter
    .format(date);
}

function formatAppointmentTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "--:--";
  }

  return timeFormatter
    .format(date);
}

function formatPrice(
  priceCents: number,
) {
  return currencyFormatter
    .format(
      priceCents / 100,
    );
}

function getStatusConfig(
  status:
    AppointmentStatus,
) {
  switch (status) {
    case APPOINTMENT_STATUS
      .PENDING_APPROVAL:
      return {
        label:
          "Aguardando confirmação",

        className:
          "border-[#E9D8A6] bg-[#FFF8E7] text-[#8A6A2F]",

        icon:
          Clock3,
      };

    case APPOINTMENT_STATUS
      .CONFIRMED:
      return {
        label:
          "Confirmado",

        className:
          "border-[#C9D9C4] bg-[#EEF5EB] text-[#36542E]",

        icon:
          CheckCircle2,
      };

    case APPOINTMENT_STATUS
      .IN_PROGRESS:
      return {
        label:
          "Em atendimento",

        className:
          "border-[#C9D9C4] bg-[#EEF5EB] text-[#36542E]",

        icon:
          Sparkles,
      };

    default:
      return {
        label:
          status,

        className:
          "border-[#E5E0D5] bg-[#F6F4EE] text-[#687065]",

        icon:
          Clock3,
      };
  }
}

export default function ClientPage() {
  const {
    user,
    appUser,
    clientLink,
  } =
    useAuth();

  const {
    data:
      appointmentsData,

    isLoading:
      appointmentsLoading,

    isError:
      appointmentsError,
  } =
    useClientAppointments();

  const clientName =
    clientLink?.client?.name ??
    appUser?.displayName ??
    user?.displayName ??
    "Cliente";

  const firstName =
    clientName
      .trim()
      .split(/\s+/)[0] ??
    "Cliente";

  const nextAppointment =
    appointmentsData
      ?.nextAppointment ??
    null;

  const statusConfig =
    nextAppointment
      ? getStatusConfig(
          nextAppointment.status,
        )
      : null;

  const StatusIcon =
    statusConfig?.icon;

  return (
    <div className="space-y-8">
      {/* BOAS-VINDAS */}
      <section>
        <p className="text-sm font-medium text-[#7A8075]">
          Área da cliente
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#263620] sm:text-3xl">
          Olá, {firstName}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71776D] sm:text-base">
          Agende seu próximo horário
          e acompanhe suas solicitações
          em um só lugar.
        </p>
      </section>

      {/* CTA PRINCIPAL */}
      <section className="overflow-hidden rounded-3xl bg-[#304229] text-white shadow-sm">
        <div className="relative p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/5" />

          <div className="absolute -bottom-20 right-16 size-44 rounded-full bg-white/5" />

          <div className="relative max-w-xl">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="size-5" />
            </div>

            <p className="mt-6 text-sm font-medium text-white/70">
              Seu momento de cuidado
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Vamos marcar seu próximo
              horário?
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
              Escolha o serviço, a data
              e um dos horários
              disponíveis para enviar
              sua solicitação.
            </p>

            <Link
              href="/cliente/agendar"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#304229] transition hover:bg-[#F3F1EA]"
            >
              <CalendarPlus className="size-4" />

              Agendar horário

              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRÓXIMO AGENDAMENTO */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#7A8075]">
              Sua agenda
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#263620]">
              Próximo agendamento
            </h2>
          </div>

          <Link
            href="/cliente/agendamentos"
            className="hidden items-center gap-1 text-sm font-semibold text-[#304229] hover:underline sm:flex"
          >
            Ver todos

            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* CARREGANDO */}
        {appointmentsLoading && (
          <div className="flex min-h-48 items-center justify-center rounded-3xl border border-[#E5E0D5] bg-white p-6 shadow-sm">
            <div className="text-center">
              <LoaderCircle className="mx-auto size-6 animate-spin text-[#304229]" />

              <p className="mt-3 text-sm text-[#71776D]">
                Carregando sua agenda...
              </p>
            </div>
          </div>
        )}

        {/* ERRO */}
        {!appointmentsLoading &&
          appointmentsError && (
            <div className="rounded-3xl border border-[#E8D4CF] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAECE8] text-[#9A4B3E]">
                  <TriangleAlert className="size-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-[#263620]">
                    Não foi possível
                    carregar sua agenda
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#71776D]">
                    Tente atualizar a
                    página novamente em
                    alguns instantes.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* SEM PRÓXIMO AGENDAMENTO */}
        {!appointmentsLoading &&
          !appointmentsError &&
          !nextAppointment && (
            <div className="rounded-3xl border border-[#E5E0D5] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229]">
                  <CalendarDays className="size-5" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-[#263620]">
                    Nenhum agendamento
                    próximo
                  </h3>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-[#71776D]">
                    Você ainda não possui
                    um horário futuro.
                    Escolha um serviço e
                    faça seu próximo
                    agendamento.
                  </p>
                </div>

                <Link
                  href="/cliente/agendar"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D8D3C8] px-4 text-sm font-semibold text-[#304229] transition hover:bg-[#F6F4EE]"
                >
                  <CalendarPlus className="size-4" />

                  Agendar
                </Link>
              </div>
            </div>
          )}

        {/* AGENDAMENTO REAL */}
        {!appointmentsLoading &&
          !appointmentsError &&
          nextAppointment &&
          statusConfig &&
          StatusIcon && (
            <div className="overflow-hidden rounded-3xl border border-[#DDE3D9] bg-white shadow-sm">
              <div className="border-b border-[#EEEAE1] bg-[#FBFCF9] px-6 py-4 sm:px-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                      statusConfig.className,
                    ].join(
                      " ",
                    )}
                  >
                    <StatusIcon className="size-3.5" />

                    {
                      statusConfig.label
                    }
                  </span>

                  <span className="text-xs font-medium text-[#92978E]">
                    Próximo horário
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#304229] text-white">
                    <Sparkles className="size-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#92978E]">
                      Serviço
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-[#263620]">
                      {
                        nextAppointment
                          .serviceNameSnapshot
                      }
                    </h3>

                    <div className="mt-4 flex flex-col gap-2 text-sm text-[#5F675C] sm:flex-row sm:flex-wrap sm:gap-x-6">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-[#7A8075]" />

                        <span className="capitalize">
                          {formatAppointmentDate(
                            nextAppointment
                              .startsAt,
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 className="size-4 text-[#7A8075]" />

                        <span>
                          {formatAppointmentTime(
                            nextAppointment
                              .startsAt,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#EEEAE1] pt-5 md:min-w-44 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
                      Valor
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#304229]">
                      {formatPrice(
                        nextAppointment
                          .chargedPriceCents,
                      )}
                    </p>

                    <Link
                      href="/cliente/agendamentos"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#304229] hover:underline"
                    >
                      Ver agendamento

                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        <Link
          href="/cliente/agendamentos"
          className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-[#304229] sm:hidden"
        >
          Ver todos os agendamentos

          <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* ACESSOS RÁPIDOS */}
      <section>
        <h2 className="text-lg font-bold text-[#263620]">
          Acessos rápidos
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/cliente/agendar"
            className="group rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C8D0C3] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229]">
                <CalendarPlus className="size-5" />
              </div>

              <ArrowRight className="size-5 text-[#A1A79D] transition group-hover:translate-x-1 group-hover:text-[#304229]" />
            </div>

            <h3 className="mt-5 font-semibold text-[#263620]">
              Novo agendamento
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#71776D]">
              Escolha um serviço, data
              e horário disponível.
            </p>
          </Link>

          <Link
            href="/cliente/agendamentos"
            className="group rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C8D0C3] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#F5EBD2] text-[#8A6A2F]">
                <Clock3 className="size-5" />
              </div>

              <ArrowRight className="size-5 text-[#A1A79D] transition group-hover:translate-x-1 group-hover:text-[#304229]" />
            </div>

            <h3 className="mt-5 font-semibold text-[#263620]">
              Meus agendamentos
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#71776D]">
              Acompanhe confirmações,
              recusas e seu histórico.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}