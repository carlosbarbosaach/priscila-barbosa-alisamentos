"use client";

import {
  APPOINTMENT_PRICE_SOURCE,
  APPOINTMENT_STATUS,
  SERVICE_PRICE_TYPES,
  type Appointment,
  type AppointmentStatus,
} from "@priscila/shared";

import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  CircleX,
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
 * Fuso horário oficial do salão.
 */
const SALON_TIME_ZONE =
  "America/Sao_Paulo";

const dateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday:
        "long",

      day:
        "2-digit",

      month:
        "long",

      timeZone:
        SALON_TIME_ZONE,
    },
  );

const shortDateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      day:
        "2-digit",

      month:
        "short",

      timeZone:
        SALON_TIME_ZONE,
    },
  );

const timeFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        false,

      timeZone:
        SALON_TIME_ZONE,
    },
  );

const currencyFormatter =
  new Intl.NumberFormat(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL",
    },
  );

function formatAppointmentDate(
  value:
    string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Data não disponível";
  }

  return dateFormatter.format(
    date,
  );
}

function formatShortDate(
  value:
    string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "--";
  }

  return shortDateFormatter.format(
    date,
  );
}

function formatAppointmentTime(
  value:
    string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "--:--";
  }

  return timeFormatter.format(
    date,
  );
}

function formatPrice(
  priceCents:
    number,
) {
  return currencyFormatter.format(
    priceCents /
      100,
  );
}

function getStatusConfig(
  status:
    AppointmentStatus,
) {
  switch (
    status
  ) {
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

    case APPOINTMENT_STATUS
      .REJECTED:
      return {
        label:
          "Recusado",

        className:
          "border-[#E8CEC7] bg-[#FAECE8] text-[#984B3E]",

        icon:
          CircleX,
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

function isPendingAppointment(
  appointment:
    Appointment,
) {
  return (
    appointment.status ===
    APPOINTMENT_STATUS
      .PENDING_APPROVAL
  );
}

function isConfirmedAppointment(
  appointment:
    Appointment,
) {
  return (
    appointment.status ===
      APPOINTMENT_STATUS
        .CONFIRMED ||
    appointment.status ===
      APPOINTMENT_STATUS
        .IN_PROGRESS
  );
}

function isRejectedAppointment(
  appointment:
    Appointment,
) {
  return (
    appointment.status ===
    APPOINTMENT_STATUS
      .REJECTED
  );
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
      .split(
        /\s+/,
      )[0] ??
    "Cliente";

  const upcoming =
    appointmentsData
      ?.upcoming ??
    [];

  const history =
    appointmentsData
      ?.history ??
    [];

  /*
   * =================================
   * RESUMO DA CLIENTE
   * =================================
   */

  const pendingAppointments =
    upcoming.filter(
      isPendingAppointment,
    );

  const confirmedAppointments =
    upcoming.filter(
      isConfirmedAppointment,
    );

  /*
   * upcoming já deve vir ordenado
   * cronologicamente.
   *
   * O primeiro confirmado será o
   * próximo horário efetivamente
   * confirmado pelo salão.
   */
  const nextConfirmedAppointment =
    confirmedAppointments[0] ??
    null;

  /*
   * history vem do mais recente
   * para o mais antigo.
   *
   * Procuramos a recusa mais recente
   * para avisar a cliente logo na Home.
   */
  const recentRejectedAppointment =
    history.find(
      isRejectedAppointment,
    ) ??
    null;

  const confirmedStatus =
    nextConfirmedAppointment
      ? getStatusConfig(
          nextConfirmedAppointment
            .status,
        )
      : null;

  const ConfirmedStatusIcon =
    confirmedStatus
      ?.icon;

  /*
   * Preço mostrado no próximo
   * agendamento confirmado.
   */
  const hasSpecialPrice =
    nextConfirmedAppointment
      ?.priceSource ===
    APPOINTMENT_PRICE_SOURCE
      .CLIENT_SPECIAL;

  const isStartingFromPrice =
    nextConfirmedAppointment
      ?.servicePriceTypeSnapshot ===
      SERVICE_PRICE_TYPES
        .STARTING_FROM &&
    !hasSpecialPrice;

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* ============================== */}
      {/* BOAS-VINDAS */}
      {/* ============================== */}

      <section>
        <p className="text-sm font-medium text-[#7A8075]">
          Área da cliente
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#263620] sm:text-3xl">
          Olá, {firstName}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71776D] sm:text-base">
          Acompanhe seus pedidos e
          veja rapidamente o que foi
          confirmado pelo salão.
        </p>
      </section>

      {/* ============================== */}
      {/* CTA PRINCIPAL */}
      {/* ============================== */}

      <section className="overflow-hidden rounded-3xl bg-[#304229] text-white shadow-sm">
        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/5" />

          <div className="absolute -bottom-20 right-16 size-44 rounded-full bg-white/5" />

          <div className="relative max-w-xl">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10 sm:size-11">
              <Sparkles className="size-5" />
            </div>

            <p className="mt-5 text-sm font-medium text-white/70">
              Seu momento de cuidado
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Vamos marcar seu próximo
              horário?
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
              Escolha seu serviço,
              uma data disponível e
              envie sua solicitação
              para o salão.
            </p>

            <Link
              href="/cliente/agendar"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#304229] transition hover:bg-[#F3F1EA] sm:w-auto"
            >
              <CalendarPlus className="size-4" />

              Agendar horário

              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* CARREGANDO */}
      {/* ============================== */}

      {appointmentsLoading && (
        <section className="flex min-h-52 items-center justify-center rounded-3xl border border-[#E5E0D5] bg-white p-6 shadow-sm">
          <div className="text-center">
            <LoaderCircle className="mx-auto size-6 animate-spin text-[#304229]" />

            <p className="mt-3 text-sm text-[#71776D]">
              Carregando sua agenda...
            </p>
          </div>
        </section>
      )}

      {/* ============================== */}
      {/* ERRO */}
      {/* ============================== */}

      {!appointmentsLoading &&
        appointmentsError && (
          <section className="rounded-3xl border border-[#E8D4CF] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAECE8] text-[#9A4B3E]">
                <TriangleAlert className="size-5" />
              </div>

              <div>
                <h3 className="font-semibold text-[#263620]">
                  Não foi possível carregar sua agenda
                </h3>

                <p className="mt-1 text-sm leading-6 text-[#71776D]">
                  Atualize a página e tente
                  novamente em alguns instantes.
                </p>
              </div>
            </div>
          </section>
        )}

      {!appointmentsLoading &&
        !appointmentsError && (
          <>
            {/* ============================== */}
            {/* VISÃO RÁPIDA */}
            {/* ============================== */}

            <section>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#7A8075]">
                    Sua agenda
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#263620]">
                    Visão rápida
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

              {/*
               * MOBILE:
               *
               * 2 colunas.
               *
               * TABLET/DESKTOP:
               *
               * continua compacto.
               */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* AGUARDANDO */}
                <Link
                  href="/cliente/agendamentos"
                  className="rounded-2xl border border-[#E9D8A6] bg-[#FFF9EA] p-4 transition active:scale-[0.98] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[#8A6A2F]">
                      <Clock3 className="size-4" />
                    </div>

                    <span className="text-2xl font-bold text-[#8A6A2F]">
                      {
                        pendingAppointments
                          .length
                      }
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#65501F]">
                    Aguardando
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-[#8A774D]">
                    {pendingAppointments
                      .length ===
                    1
                      ? "Pedido aguardando resposta"
                      : "Pedidos aguardando resposta"}
                  </p>
                </Link>

                {/* CONFIRMADOS */}
                <Link
                  href="/cliente/agendamentos"
                  className="rounded-2xl border border-[#C9D9C4] bg-[#F2F7EF] p-4 transition active:scale-[0.98] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[#36542E]">
                      <CheckCircle2 className="size-4" />
                    </div>

                    <span className="text-2xl font-bold text-[#36542E]">
                      {
                        confirmedAppointments
                          .length
                      }
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-[#36542E]">
                    Confirmados
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-[#6B7F65]">
                    {confirmedAppointments
                      .length ===
                    1
                      ? "Horário confirmado"
                      : "Horários confirmados"}
                  </p>
                </Link>
              </div>

              <Link
                href="/cliente/agendamentos"
                className="mt-4 flex min-h-10 items-center justify-center gap-1 text-sm font-semibold text-[#304229] sm:hidden"
              >
                Ver todos os agendamentos

                <ArrowRight className="size-4" />
              </Link>
            </section>

            {/* ============================== */}
            {/* RECUSA RECENTE */}
            {/* ============================== */}

            {recentRejectedAppointment && (
              <section>
                <div className="overflow-hidden rounded-3xl border border-[#E8CEC7] bg-white shadow-sm">
                  <div className="border-b border-[#E8CEC7] bg-[#FFF5F2] px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#984B3E]">
                        <CircleX className="size-5" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#984B3E]">
                          Solicitação recusada
                        </p>

                        <p className="mt-0.5 text-xs text-[#8B6A63]">
                          Confira os detalhes abaixo
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#92978E]">
                          Serviço
                        </p>

                        <h3 className="mt-1 break-words text-lg font-bold text-[#263620]">
                          {
                            recentRejectedAppointment
                              .serviceNameSnapshot
                          }
                        </h3>
                      </div>

                      <span className="shrink-0 rounded-full border border-[#E8CEC7] bg-[#FAECE8] px-2.5 py-1 text-[11px] font-bold text-[#984B3E]">
                        Recusado
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#F8F6F2] p-3">
                        <div className="flex items-center gap-2 text-[#7A8075]">
                          <CalendarDays className="size-4" />

                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            Data
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold capitalize text-[#30372D]">
                          {formatShortDate(
                            recentRejectedAppointment
                              .startsAt,
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#F8F6F2] p-3">
                        <div className="flex items-center gap-2 text-[#7A8075]">
                          <Clock3 className="size-4" />

                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            Horário
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-bold text-[#30372D]">
                          {formatAppointmentTime(
                            recentRejectedAppointment
                              .startsAt,
                          )}
                        </p>
                      </div>
                    </div>

                    {recentRejectedAppointment
                      .rejectionReason && (
                      <div className="mt-4 rounded-2xl border border-[#E8CEC7] bg-[#FFF8F6] p-4">
                        <div className="flex items-start gap-3">
                          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#984B3E]" />

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-[#984B3E]">
                              Motivo da recusa
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#6E554F]">
                              {
                                recentRejectedAppointment
                                  .rejectionReason
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid gap-2 sm:flex">
                      <Link
                        href="/cliente/agendar"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#304229] px-4 text-sm font-semibold text-white transition hover:bg-[#25351F]"
                      >
                        <CalendarPlus className="size-4" />

                        Escolher outro horário
                      </Link>

                      <Link
                        href="/cliente/agendamentos"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8D3C8] px-4 text-sm font-semibold text-[#304229] transition hover:bg-[#F6F4EE]"
                      >
                        Ver meus pedidos

                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ============================== */}
            {/* PRÓXIMO CONFIRMADO */}
            {/* ============================== */}

            <section>
              <div className="mb-4">
                <p className="text-sm font-medium text-[#7A8075]">
                  Próximo atendimento
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#263620]">
                  Horário confirmado
                </h2>
              </div>

              {!nextConfirmedAppointment ? (
                <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229]">
                      {pendingAppointments
                        .length >
                      0 ? (
                        <Clock3 className="size-5" />
                      ) : (
                        <CalendarDays className="size-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#263620]">
                        {pendingAppointments
                          .length >
                        0
                          ? "Sua solicitação está sendo analisada"
                          : "Nenhum horário confirmado"}
                      </h3>

                      <p className="mt-1 max-w-xl text-sm leading-6 text-[#71776D]">
                        {pendingAppointments
                          .length >
                        0
                          ? "Assim que o salão confirmar seu pedido, o horário aparecerá aqui."
                          : "Faça uma nova solicitação para reservar seu próximo atendimento."}
                      </p>
                    </div>

                    <Link
                      href={
                        pendingAppointments
                          .length >
                        0
                          ? "/cliente/agendamentos"
                          : "/cliente/agendar"
                      }
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D8D3C8] px-4 text-sm font-semibold text-[#304229] transition hover:bg-[#F6F4EE]"
                    >
                      {pendingAppointments
                        .length >
                      0
                        ? "Acompanhar pedido"
                        : "Agendar"}

                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                confirmedStatus &&
                ConfirmedStatusIcon && (
                  <div className="overflow-hidden rounded-3xl border border-[#C9D9C4] bg-white shadow-sm">
                    {/* STATUS */}
                    <div className="border-b border-[#DDE6D9] bg-[#F5F9F3] px-4 py-4 sm:px-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={[
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",

                            confirmedStatus
                              .className,
                          ].join(
                            " ",
                          )}
                        >
                          <ConfirmedStatusIcon className="size-3.5" />

                          {
                            confirmedStatus
                              .label
                          }
                        </span>

                        <span className="text-xs font-semibold text-[#698063]">
                          Seu próximo horário
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 lg:p-7">
                      <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#304229] text-white sm:size-14">
                          <Sparkles className="size-5 sm:size-6" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#92978E]">
                            Serviço confirmado
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-[#263620]">
                            {
                              nextConfirmedAppointment
                                .serviceNameSnapshot
                            }
                          </h3>

                          <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-x-6">
                            <div className="flex items-start gap-2 text-sm text-[#5F675C]">
                              <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#7A8075]" />

                              <span className="capitalize">
                                {formatAppointmentDate(
                                  nextConfirmedAppointment
                                    .startsAt,
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-[#5F675C]">
                              <Clock3 className="size-4 shrink-0 text-[#7A8075]" />

                              <span className="font-semibold">
                                {formatAppointmentTime(
                                  nextConfirmedAppointment
                                    .startsAt,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-[#EEEAE1] pt-4 md:min-w-44 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
                            {isStartingFromPrice
                              ? "Valor inicial"
                              : "Valor"}
                          </p>

                          {isStartingFromPrice && (
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#788273]">
                              A partir de
                            </p>
                          )}

                          <p className="mt-1 text-xl font-bold text-[#304229]">
                            {formatPrice(
                              nextConfirmedAppointment
                                .chargedPriceCents,
                            )}
                          </p>

                          {hasSpecialPrice && (
                            <p className="mt-1 text-[11px] font-semibold text-[#8A6A2F]">
                              Seu preço
                            </p>
                          )}

                          <Link
                            href="/cliente/agendamentos"
                            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#304229] hover:underline"
                          >
                            Ver detalhes

                            <ArrowRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </section>

            {/* ============================== */}
            {/* ACESSOS RÁPIDOS */}
            {/* ============================== */}

            <section>
              <h2 className="text-lg font-bold text-[#263620]">
                Acessos rápidos
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <Link
                  href="/cliente/agendar"
                  className="group rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C8D0C3] hover:shadow-md sm:rounded-3xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229]">
                      <CalendarPlus className="size-5" />
                    </div>

                    <ArrowRight className="size-5 text-[#A1A79D] transition group-hover:translate-x-1 group-hover:text-[#304229]" />
                  </div>

                  <h3 className="mt-4 font-semibold text-[#263620]">
                    Novo agendamento
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#71776D]">
                    Escolha um serviço,
                    data e horário disponível.
                  </p>
                </Link>

                <Link
                  href="/cliente/agendamentos"
                  className="group rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C8D0C3] hover:shadow-md sm:rounded-3xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#F5EBD2] text-[#8A6A2F]">
                      <Clock3 className="size-5" />
                    </div>

                    <ArrowRight className="size-5 text-[#A1A79D] transition group-hover:translate-x-1 group-hover:text-[#304229]" />
                  </div>

                  <h3 className="mt-4 font-semibold text-[#263620]">
                    Meus agendamentos
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#71776D]">
                    Veja pedidos aguardando,
                    confirmados, recusados
                    e seu histórico.
                  </p>
                </Link>
              </div>
            </section>
          </>
        )}
    </div>
  );
}