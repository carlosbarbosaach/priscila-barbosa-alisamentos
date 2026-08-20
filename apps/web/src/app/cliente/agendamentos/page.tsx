"use client";

import {
  APPOINTMENT_PRICE_SOURCE,
  APPOINTMENT_STATUS,
  SERVICE_PRICE_TYPES,
  type Appointment,
  type AppointmentStatus,
  type ServicePriceType,
} from "@priscila/shared";

import {
  Ban,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  CircleX,
  Clock3,
  History,
  LoaderCircle,
  Sparkles,
  Tag,
  TriangleAlert,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useClientAppointments,
} from "@/features/appointments/hooks/useClientAppointments";

import {
  useClientBookableServices,
} from "@/features/appointments/hooks/useClientBookableServices";
import { AppointmentPromotionBadge } from "@/features/appointments/components/AppointmentPromotionBadge";

const SALON_TIME_ZONE =
  "America/Sao_Paulo";

type AppointmentFilter =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

const dateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday:
        "short",

      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",

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

function formatDate(
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
    return "Data indisponível";
  }

  return dateFormatter.format(
    date,
  );
}

function formatTime(
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

        shortLabel:
          "Aguardando",

        badgeClassName:
          "border-[#E9D8A6] bg-[#FFF8E7] text-[#8A6A2F]",

        messageClassName:
          "border-[#EEE0B9] bg-[#FFF9EA] text-[#745B25]",

        message:
          "Sua solicitação foi enviada e está aguardando confirmação do salão.",

        icon:
          Clock3,
      };

    case APPOINTMENT_STATUS
      .CONFIRMED:
      return {
        label:
          "Agendamento confirmado",

        shortLabel:
          "Confirmado",

        badgeClassName:
          "border-[#C9D9C4] bg-[#EEF5EB] text-[#36542E]",

        messageClassName:
          "border-[#D3E0CF] bg-[#F4F8F2] text-[#36542E]",

        message:
          "Seu horário está confirmado. Esperamos você!",

        icon:
          CheckCircle2,
      };

    case APPOINTMENT_STATUS
      .IN_PROGRESS:
      return {
        label:
          "Em atendimento",

        shortLabel:
          "Em atendimento",

        badgeClassName:
          "border-[#C9D9C4] bg-[#EEF5EB] text-[#36542E]",

        messageClassName:
          "border-[#D3E0CF] bg-[#F4F8F2] text-[#36542E]",

        message:
          "Seu atendimento está em andamento.",

        icon:
          Sparkles,
      };

    case APPOINTMENT_STATUS
      .COMPLETED:
      return {
        label:
          "Atendimento concluído",

        shortLabel:
          "Concluído",

        badgeClassName:
          "border-[#D7DDD3] bg-[#F4F6F2] text-[#596454]",

        messageClassName:
          "border-[#E1E5DE] bg-[#F7F8F6] text-[#596454]",

        message:
          "Este atendimento foi concluído.",

        icon:
          CheckCircle2,
      };

    case APPOINTMENT_STATUS
      .REJECTED:
      return {
        label:
          "Solicitação recusada",

        shortLabel:
          "Recusado",

        badgeClassName:
          "border-[#E8CEC7] bg-[#FAECE8] text-[#984B3E]",

        messageClassName:
          "border-[#E8CEC7] bg-[#FFF7F5] text-[#984B3E]",

        message:
          "Esta solicitação não foi confirmada pelo salão.",

        icon:
          CircleX,
      };

    case APPOINTMENT_STATUS
      .CANCELLED:
      return {
        label:
          "Agendamento cancelado",

        shortLabel:
          "Cancelado",

        badgeClassName:
          "border-[#DDD8D0] bg-[#F5F3EF] text-[#69645D]",

        messageClassName:
          "border-[#E2DED7] bg-[#F8F6F2] text-[#69645D]",

        message:
          "Este agendamento foi cancelado.",

        icon:
          Ban,
      };

    default:
      return {
        label:
          status,

        shortLabel:
          status,

        badgeClassName:
          "border-[#DDD8D0] bg-[#F5F3EF] text-[#69645D]",

        messageClassName:
          "border-[#E2DED7] bg-[#F8F6F2] text-[#69645D]",

        message:
          "",

        icon:
          Clock3,
      };
  }
}

type AppointmentCardProps = {
  appointment:
  Appointment;

  fallbackPriceType?:
  ServicePriceType;
};

function AppointmentCard({
  appointment,
  fallbackPriceType,
}: AppointmentCardProps) {
  const status =
    getStatusConfig(
      appointment.status,
    );

  const StatusIcon =
    status.icon;

  const showRejectionReason =
    appointment.status ===
    APPOINTMENT_STATUS.REJECTED &&
    Boolean(
      appointment
        .rejectionReason,
    );

  const showCancellationReason =
    appointment.status ===
    APPOINTMENT_STATUS.CANCELLED &&
    Boolean(
      appointment
        .cancellationReason,
    );

  const priceType =
    appointment
      .servicePriceTypeSnapshot ??
    fallbackPriceType ??
    SERVICE_PRICE_TYPES
      .FIXED;

  const hasSpecialPrice =
    appointment
      .priceSource ===
    APPOINTMENT_PRICE_SOURCE
      .CLIENT_SPECIAL;

  const isStartingFrom =
    priceType ===
    SERVICE_PRICE_TYPES
      .STARTING_FROM &&
    !hasSpecialPrice;

  const showStartingFrom =
    isStartingFrom &&
    appointment.status !==
    APPOINTMENT_STATUS
      .COMPLETED;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E5E0D5] bg-white shadow-sm sm:rounded-3xl">
      {/* STATUS */}
      <div className="border-b border-[#EEEAE1] bg-[#FCFBF8] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold",

              status
                .badgeClassName,
            ].join(
              " ",
            )}
          >
            <StatusIcon className="size-3.5" />

            {
              status.label
            }
          </span>

          <span className="text-xs font-medium text-[#92978E]">
            {formatDate(
              appointment
                .startsAt,
            )}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* SERVIÇO */}
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229] sm:size-12">
            <Sparkles className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#92978E]">
              Serviço solicitado
            </p>

            <h3 className="mt-1 break-words text-lg font-bold leading-tight text-[#263620]">
              {
                appointment
                  .serviceNameSnapshot
              }
            </h3>
          </div>
        </div>

        {/* DATA E HORÁRIO */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F7F6F2] p-3.5">
            <div className="flex items-center gap-2 text-[#7A8075]">
              <CalendarDays className="size-4 shrink-0" />

              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Data
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold capitalize leading-5 text-[#30372D]">
              {formatDate(
                appointment
                  .startsAt,
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F7F6F2] p-3.5">
            <div className="flex items-center gap-2 text-[#7A8075]">
              <Clock3 className="size-4 shrink-0" />

              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Horário
              </span>
            </div>

            <p className="mt-2 text-base font-bold text-[#30372D]">
              {formatTime(
                appointment
                  .startsAt,
              )}
            </p>
          </div>
        </div>

        {/* SITUAÇÃO */}
        <div
          className={[
            "mt-4 rounded-2xl border p-4",

            status
              .messageClassName,
          ].join(
            " ",
          )}
        >
          <div className="flex items-start gap-3">
            <StatusIcon className="mt-0.5 size-4 shrink-0" />

            <div>
              <p className="text-sm font-bold">
                {
                  status.shortLabel
                }
              </p>

              {status.message && (
                <p className="mt-1 text-xs leading-5 opacity-90">
                  {
                    status.message
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* MOTIVO DA RECUSA */}
        {showRejectionReason && (
          <div className="mt-4 rounded-2xl border border-[#E8CEC7] bg-[#FFF7F5] p-4">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#984B3E]" />

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#984B3E]">
                  Motivo da recusa
                </p>

                <p className="mt-2 text-sm leading-6 text-[#6E554F]">
                  {
                    appointment
                      .rejectionReason
                  }
                </p>

                <Link
                  href="/cliente/agendar"
                  className="mt-3 inline-flex min-h-9 items-center justify-center rounded-xl bg-[#984B3E] px-3 text-xs font-semibold text-white transition hover:bg-[#813E34]"
                >
                  Escolher outro horário
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* MOTIVO DO CANCELAMENTO */}
        {showCancellationReason && (
          <div className="mt-4 rounded-2xl border border-[#DDD8D0] bg-[#F8F6F2] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#69645D]">
              Motivo do cancelamento
            </p>

            <p className="mt-2 text-sm leading-6 text-[#69645D]">
              {
                appointment
                  .cancellationReason
              }
            </p>
          </div>
        )}

        {/* VALOR */}
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#EEEAE1] pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#92978E]">
              {showStartingFrom
                ? "Valor inicial"
                : appointment.status ===
                  APPOINTMENT_STATUS
                    .COMPLETED
                  ? "Valor final"
                  : "Valor"}
            </p>

            {showStartingFrom && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#788273]">
                A partir de
              </p>
            )}

            <p className="mt-1 text-xl font-bold text-[#304229]">
              {formatPrice(
                appointment
                  .chargedPriceCents,
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <AppointmentPromotionBadge
                priceSource={
                  appointment
                    .priceSource
                }
              />
            </div>
          </div>

          <div className="text-right">
            {hasSpecialPrice && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F5EBD2] px-2.5 py-1 text-[11px] font-semibold text-[#8A6A2F]">
                <Tag className="size-3" />

                Seu preço
              </span>
            )}

            {showStartingFrom && (
              <p className="mt-2 max-w-36 text-[10px] leading-4 text-[#7A8075]">
                O valor final pode variar.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ClientAppointmentsPage() {
  const [
    filter,
    setFilter,
  ] =
    useState<AppointmentFilter>(
      "ALL",
    );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } =
    useClientAppointments();

  const {
    data:
    services = [],
  } =
    useClientBookableServices();

  const upcoming =
    data?.upcoming ??
    [];

  const history =
    data?.history ??
    [];

  const allAppointments = [
    ...upcoming,
    ...history,
  ];

  const pending =
    allAppointments.filter(
      (
        appointment,
      ) =>
        appointment.status ===
        APPOINTMENT_STATUS
          .PENDING_APPROVAL,
    );

  const confirmed =
    allAppointments.filter(
      (
        appointment,
      ) =>
        appointment.status ===
        APPOINTMENT_STATUS
          .CONFIRMED ||
        appointment.status ===
        APPOINTMENT_STATUS
          .IN_PROGRESS,
    );

  const rejected =
    allAppointments.filter(
      (
        appointment,
      ) =>
        appointment.status ===
        APPOINTMENT_STATUS
          .REJECTED,
    );

  const completed =
    allAppointments.filter(
      (
        appointment,
      ) =>
        appointment.status ===
        APPOINTMENT_STATUS
          .COMPLETED,
    );

  const cancelled =
    allAppointments.filter(
      (
        appointment,
      ) =>
        appointment.status ===
        APPOINTMENT_STATUS
          .CANCELLED,
    );

  function getFallbackPriceType(
    appointment:
      Appointment,
  ) {
    return services.find(
      (
        service,
      ) =>
        service.id ===
        appointment.serviceId,
    )?.priceType;
  }

  function getFilteredAppointments():
    Appointment[] {
    switch (
    filter
    ) {
      case "PENDING":
        return pending;

      case "CONFIRMED":
        return confirmed;

      case "REJECTED":
        return rejected;

      case "COMPLETED":
        return completed;

      case "CANCELLED":
        return cancelled;

      default:
        return allAppointments;
    }
  }

  const filteredAppointments =
    getFilteredAppointments();

  const filters: {
    id:
    AppointmentFilter;

    label:
    string;

    count:
    number;
  }[] = [
      {
        id:
          "ALL",

        label:
          "Todos",

        count:
          allAppointments
            .length,
      },

      {
        id:
          "PENDING",

        label:
          "Aguardando",

        count:
          pending.length,
      },

      {
        id:
          "CONFIRMED",

        label:
          "Confirmados",

        count:
          confirmed.length,
      },

      {
        id:
          "REJECTED",

        label:
          "Recusados",

        count:
          rejected.length,
      },

      {
        id:
          "COMPLETED",

        label:
          "Concluídos",

        count:
          completed.length,
      },

      {
        id:
          "CANCELLED",

        label:
          "Cancelados",

        count:
          cancelled.length,
      },
    ];

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* CABEÇALHO */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#7A8075]">
            Sua agenda
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#263620] sm:text-3xl">
            Meus agendamentos
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71776D]">
            Veja rapidamente o que está
            aguardando confirmação, o que
            foi confirmado e todo o seu
            histórico.
          </p>
        </div>

        <Link
          href="/cliente/agendar"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#304229] px-5 text-sm font-semibold text-white transition hover:bg-[#25351F] sm:w-auto"
        >
          <CalendarPlus className="size-4" />

          Novo agendamento
        </Link>
      </section>

      {/* LOADING */}
      {isLoading && (
        <section className="flex min-h-60 items-center justify-center rounded-3xl border border-[#E5E0D5] bg-white shadow-sm">
          <div className="text-center">
            <LoaderCircle className="mx-auto size-7 animate-spin text-[#304229]" />

            <p className="mt-3 text-sm text-[#71776D]">
              Carregando seus agendamentos...
            </p>
          </div>
        </section>
      )}

      {/* ERRO */}
      {!isLoading &&
        isError && (
          <section className="rounded-3xl border border-[#E8D4CF] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAECE8] text-[#9A4B3E]">
                <TriangleAlert className="size-5" />
              </div>

              <div className="flex-1">
                <h2 className="font-semibold text-[#263620]">
                  Não foi possível carregar seus agendamentos
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#71776D]">
                  Verifique sua conexão e tente novamente.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  isFetching
                }
                onClick={() =>
                  void refetch()
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D8D3C8] px-4 text-sm font-semibold text-[#304229] transition hover:bg-[#F6F4EE] disabled:opacity-50"
              >
                {isFetching
                  ? "Tentando..."
                  : "Tentar novamente"}
              </button>
            </div>
          </section>
        )}

      {!isLoading &&
        !isError && (
          <>
            {/* RESUMO */}
            <section>
              <div className="mb-3">
                <p className="text-sm font-medium text-[#7A8075]">
                  Visão geral
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#263620]">
                  Situação dos seus pedidos
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <button
                  type="button"
                  onClick={() =>
                    setFilter(
                      "PENDING",
                    )
                  }
                  className="rounded-2xl border border-[#E9D8A6] bg-[#FFF9EA] p-4 text-left transition active:scale-[0.98] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[#8A6A2F]">
                      <Clock3 className="size-4" />
                    </div>

                    <span className="text-2xl font-bold text-[#8A6A2F]">
                      {
                        pending.length
                      }
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-bold text-[#65501F] sm:text-sm">
                    Aguardando
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-[#8A774D]">
                    Aguardando resposta
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilter(
                      "CONFIRMED",
                    )
                  }
                  className="rounded-2xl border border-[#C9D9C4] bg-[#F2F7EF] p-4 text-left transition active:scale-[0.98] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[#36542E]">
                      <CheckCircle2 className="size-4" />
                    </div>

                    <span className="text-2xl font-bold text-[#36542E]">
                      {
                        confirmed.length
                      }
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-bold text-[#36542E] sm:text-sm">
                    Confirmados
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-[#6B7F65]">
                    Horários confirmados
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilter(
                      "REJECTED",
                    )
                  }
                  className="rounded-2xl border border-[#E8CEC7] bg-[#FFF6F4] p-4 text-left transition active:scale-[0.98] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[#984B3E]">
                      <CircleX className="size-4" />
                    </div>

                    <span className="text-2xl font-bold text-[#984B3E]">
                      {
                        rejected.length
                      }
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-bold text-[#984B3E] sm:text-sm">
                    Recusados
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-[#9B7169]">
                    Pedidos não confirmados
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilter(
                      "COMPLETED",
                    )
                  }
                  className="rounded-2xl border border-[#DDE2DA] bg-[#F6F8F5] p-4 text-left transition active:scale-[0.98] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white text-[#596454]">
                      <History className="size-4" />
                    </div>

                    <span className="text-2xl font-bold text-[#596454]">
                      {
                        completed.length
                      }
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-bold text-[#596454] sm:text-sm">
                    Concluídos
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-[#7E887A]">
                    Atendimentos realizados
                  </p>
                </button>
              </div>
            </section>

            {/* FILTROS */}
            <section>
              <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
                  {filters.map(
                    (
                      item,
                    ) => {
                      const active =
                        filter ===
                        item.id;

                      return (
                        <button
                          key={
                            item.id
                          }
                          type="button"
                          onClick={() =>
                            setFilter(
                              item.id,
                            )
                          }
                          className={[
                            "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition",

                            active
                              ? "border-[#304229] bg-[#304229] text-white"
                              : "border-[#DDD8CE] bg-white text-[#62685E] hover:border-[#BCC5B7]",
                          ].join(
                            " ",
                          )}
                        >
                          {
                            item.label
                          }

                          <span
                            className={[
                              "flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",

                              active
                                ? "bg-white/15 text-white"
                                : "bg-[#F2F1EC] text-[#73786F]",
                            ].join(
                              " ",
                            )}
                          >
                            {
                              item.count
                            }
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </section>

            {/* TODOS */}
            {filter ===
              "ALL" ? (
              <div className="space-y-8">
                {/* EM ANDAMENTO */}
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#7A8075]">
                        Agora
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-[#263620]">
                        Solicitações e próximos horários
                      </h2>
                    </div>

                    {upcoming.length >
                      0 && (
                        <span className="flex min-w-8 items-center justify-center rounded-full bg-[#EEF1EA] px-2.5 py-1 text-xs font-bold text-[#304229]">
                          {
                            upcoming.length
                          }
                        </span>
                      )}
                  </div>

                  {upcoming.length ===
                    0 ? (
                    <div className="rounded-3xl border border-[#E5E0D5] bg-white p-6 text-center shadow-sm">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229]">
                        <CalendarDays className="size-5" />
                      </div>

                      <h3 className="mt-4 font-semibold text-[#263620]">
                        Nenhum agendamento próximo
                      </h3>

                      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#71776D]">
                        Quando você solicitar um novo horário,
                        ele aparecerá aqui para acompanhamento.
                      </p>

                      <Link
                        href="/cliente/agendar"
                        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#304229] px-4 text-sm font-semibold text-white"
                      >
                        <CalendarPlus className="size-4" />

                        Agendar horário
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {upcoming.map(
                        (
                          appointment,
                        ) => (
                          <AppointmentCard
                            key={
                              appointment.id
                            }
                            appointment={
                              appointment
                            }
                            fallbackPriceType={
                              getFallbackPriceType(
                                appointment,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </section>

                {/* HISTÓRICO */}
                <section>
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <History className="size-4 text-[#7A8075]" />

                      <p className="text-sm font-medium text-[#7A8075]">
                        Histórico
                      </p>
                    </div>

                    <h2 className="mt-1 text-xl font-bold text-[#263620]">
                      Agendamentos anteriores
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[#7A8075]">
                      Recusados, concluídos e cancelados ficam registrados aqui.
                    </p>
                  </div>

                  {history.length ===
                    0 ? (
                    <div className="rounded-3xl border border-dashed border-[#D8D3C8] bg-[#FBFAF7] p-6 text-center">
                      <History className="mx-auto size-6 text-[#7A8075]" />

                      <h3 className="mt-3 font-semibold text-[#394035]">
                        Nenhum histórico ainda
                      </h3>

                      <p className="mt-1 text-sm text-[#7A8075]">
                        Seus atendimentos anteriores aparecerão aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {history.map(
                        (
                          appointment,
                        ) => (
                          <AppointmentCard
                            key={
                              appointment.id
                            }
                            appointment={
                              appointment
                            }
                            fallbackPriceType={
                              getFallbackPriceType(
                                appointment,
                              )
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </section>
              </div>
            ) : (
              /* RESULTADO DO FILTRO */
              <section>
                <div className="mb-4">
                  <p className="text-sm font-medium text-[#7A8075]">
                    Resultado
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#263620]">
                    {
                      filters.find(
                        (
                          item,
                        ) =>
                          item.id ===
                          filter,
                      )?.label
                    }
                  </h2>
                </div>

                {filteredAppointments.length ===
                  0 ? (
                  <div className="rounded-3xl border border-dashed border-[#D8D3C8] bg-[#FBFAF7] p-7 text-center">
                    <CalendarDays className="mx-auto size-6 text-[#7A8075]" />

                    <h3 className="mt-3 font-semibold text-[#394035]">
                      Nenhum agendamento nesta categoria
                    </h3>

                    <p className="mt-1 text-sm text-[#7A8075]">
                      Você não possui registros com esse status.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {filteredAppointments.map(
                      (
                        appointment,
                      ) => (
                        <AppointmentCard
                          key={
                            appointment.id
                          }
                          appointment={
                            appointment
                          }
                          fallbackPriceType={
                            getFallbackPriceType(
                              appointment,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        )}
    </div>
  );
}