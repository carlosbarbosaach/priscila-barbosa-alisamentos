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
  ChevronDown,
  ChevronUp,
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

const SALON_TIME_ZONE =
  "America/Sao_Paulo";

const HISTORY_PREVIEW_LIMIT =
  3;

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

  return dateFormatter
    .format(
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

  return timeFormatter
    .format(
      date,
    );
}

function formatPrice(
  priceCents:
    number,
) {
  return currencyFormatter
    .format(
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
      .COMPLETED:
      return {
        label:
          "Concluído",

        className:
          "border-[#D7DDD3] bg-[#F4F6F2] text-[#596454]",

        icon:
          CheckCircle2,
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

    case APPOINTMENT_STATUS
      .CANCELLED:
      return {
        label:
          "Cancelado",

        className:
          "border-[#DDD8D0] bg-[#F5F3EF] text-[#69645D]",

        icon:
          Ban,
      };

    default:
      return {
        label:
          status,

        className:
          "border-[#DDD8D0] bg-[#F5F3EF] text-[#69645D]",

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

  /*
   * Agendamentos novos:
   * usa o snapshot.
   *
   * Agendamentos antigos:
   * utiliza temporariamente o tipo
   * atual do serviço.
   *
   * Se nem isso estiver disponível,
   * considera FIXED.
   */
  const priceType =
    appointment
      .servicePriceTypeSnapshot ??
    fallbackPriceType ??
    SERVICE_PRICE_TYPES
      .FIXED;

  const hasSpecialPrice =
    appointment.priceSource ===
    APPOINTMENT_PRICE_SOURCE
      .CLIENT_SPECIAL;

  const isStartingFrom =
    priceType ===
    SERVICE_PRICE_TYPES
      .STARTING_FROM &&
    !hasSpecialPrice;

  /*
   * Enquanto o atendimento ainda
   * não foi concluído, mostramos
   * "A partir de".
   *
   * Depois da conclusão,
   * chargedPriceCents representa
   * o valor final efetivamente
   * cobrado.
   */
  const showStartingFrom =
    isStartingFrom &&
    appointment.status !==
    APPOINTMENT_STATUS.COMPLETED;

  return (
    <article className="overflow-hidden rounded-3xl border border-[#E5E0D5] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEEAE1] bg-[#FCFBF8] px-5 py-4 sm:px-6">
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",

            status.className,
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

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229]">
            <Sparkles className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#92978E]">
              Serviço
            </p>

            <h3 className="mt-1 text-lg font-bold text-[#263620]">
              {
                appointment
                  .serviceNameSnapshot
              }
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-[#5F675C]">
                <CalendarDays className="size-4 shrink-0 text-[#7A8075]" />

                <span className="capitalize">
                  {formatDate(
                    appointment
                      .startsAt,
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#5F675C]">
                <Clock3 className="size-4 shrink-0 text-[#7A8075]" />

                <span>
                  {formatTime(
                    appointment
                      .startsAt,
                  )}
                </span>
              </div>
            </div>

            {showRejectionReason && (
              <div className="mt-5 rounded-2xl border border-[#E8CEC7] bg-[#FFF8F6] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#984B3E]">
                  Motivo da recusa
                </p>

                <p className="mt-2 text-sm leading-6 text-[#6E554F]">
                  {
                    appointment
                      .rejectionReason
                  }
                </p>
              </div>
            )}

            {showCancellationReason && (
              <div className="mt-5 rounded-2xl border border-[#DDD8D0] bg-[#F8F6F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#69645D]">
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
          </div>

          <div className="border-t border-[#EEEAE1] pt-4 sm:min-w-40 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
              {showStartingFrom
                ? "Valor inicial"
                : appointment.status ===
                  APPOINTMENT_STATUS.COMPLETED
                  ? "Valor final"
                  : "Valor"}
            </p>

            {showStartingFrom && (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#788273]">
                A partir de
              </p>
            )}

            <p className="mt-1 text-lg font-bold text-[#304229]">
              {formatPrice(
                appointment
                  .chargedPriceCents,
              )}
            </p>

            {hasSpecialPrice && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F5EBD2] px-2.5 py-1 text-[11px] font-semibold text-[#8A6A2F]">
                <Tag className="size-3" />

                Seu preço
              </span>
            )}

            {showStartingFrom && (
              <p className="mt-2 max-w-40 text-[11px] leading-4 text-[#7A8075]">
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
    showAllHistory,
    setShowAllHistory,
  ] =
    useState(
      false,
    );

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } =
    useClientAppointments();

  /*
   * Utilizamos o catálogo também
   * como fallback para agendamentos
   * antigos que ainda não possuem
   * servicePriceTypeSnapshot.
   *
   * Agendamentos novos não dependem
   * desse fallback.
   */
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

  /*
   * Por padrão mostramos somente
   * os três registros mais recentes.
   *
   * Isso evita que a tela da cliente
   * fique enorme depois de vários
   * atendimentos.
   */
  const visibleHistory =
    showAllHistory
      ? history
      : history.slice(
        0,
        HISTORY_PREVIEW_LIMIT,
      );

  const hiddenHistoryCount =
    Math.max(
      history.length -
      HISTORY_PREVIEW_LIMIT,
      0,
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

  return (
    <div className="space-y-8">
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
            Acompanhe seus próximos
            horários, confirmações,
            recusas e atendimentos
            anteriores.
          </p>
        </div>

        <Link
          href="/cliente/agendar"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#304229] px-5 text-sm font-semibold text-white transition hover:bg-[#25351F]"
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
              Carregando seus
              agendamentos...
            </p>
          </div>
        </section>
      )}

      {/* ERRO */}
      {!isLoading &&
        isError && (
          <section className="rounded-3xl border border-[#E8D4CF] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAECE8] text-[#9A4B3E]">
                <TriangleAlert className="size-5" />
              </div>

              <div className="flex-1">
                <h2 className="font-semibold text-[#263620]">
                  Não foi possível
                  carregar seus
                  agendamentos
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#71776D]">
                  Verifique sua conexão
                  e tente novamente.
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
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#D8D3C8] px-4 text-sm font-semibold text-[#304229] transition hover:bg-[#F6F4EE] disabled:cursor-not-allowed disabled:opacity-50"
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
            {/* PRÓXIMOS */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#7A8075]">
                    Agenda
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#263620]">
                    Próximos
                  </h2>
                </div>

                {upcoming.length >
                  0 && (
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#EEF1EA] text-sm font-bold text-[#304229]">
                      {
                        upcoming.length
                      }
                    </div>
                  )}
              </div>

              {upcoming.length ===
                0 ? (
                <div className="rounded-3xl border border-[#E5E0D5] bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229]">
                      <CalendarDays className="size-5" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#263620]">
                        Nenhum agendamento próximo
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#71776D]">
                        Quando você solicitar um novo
                        horário, ele aparecerá aqui.
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
              ) : (
                <div className="space-y-4">
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
              {/* CABEÇALHO DO HISTÓRICO */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="size-4 text-[#7A8075]" />

                    <p className="text-sm font-medium text-[#7A8075]">
                      Histórico
                    </p>
                  </div>

                  <h2 className="mt-1 text-xl font-bold text-[#263620]">
                    Histórico de agendamentos
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-[#7A8075]">
                    Consulte seus atendimentos
                    concluídos, recusados ou
                    cancelados.
                  </p>
                </div>

                {history.length >
                  0 && (
                    <span className="inline-flex w-fit items-center justify-center rounded-full border border-[#E2DDD3] bg-[#FBFAF7] px-3 py-1.5 text-xs font-semibold text-[#62685E]">
                      {history.length}{" "}
                      {history.length ===
                        1
                        ? "registro"
                        : "registros"}
                    </span>
                  )}
              </div>

              {/* HISTÓRICO VAZIO */}
              {history.length ===
                0 ? (
                <div className="rounded-3xl border border-dashed border-[#D8D3C8] bg-[#FBFAF7] p-6 sm:p-7">
                  <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#607456]">
                      <History className="size-5" />
                    </div>

                    <div className="mt-4 sm:ml-4 sm:mt-0">
                      <h3 className="font-semibold text-[#394035]">
                        Você ainda não possui histórico
                      </h3>

                      <p className="mt-1 max-w-lg text-sm leading-6 text-[#7A8075]">
                        Depois que um agendamento
                        for concluído, recusado ou
                        cancelado, ele ficará
                        disponível aqui para consulta.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-[#E5E0D5] bg-[#F9F8F4]">
                  {/* REGISTROS */}
                  <div className="space-y-4 p-3 sm:p-4">
                    {visibleHistory.map(
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

                  {/* VER MAIS */}
                  {history.length >
                    HISTORY_PREVIEW_LIMIT && (
                      <div className="border-t border-[#E8E3D9] bg-white p-3">
                        <button
                          type="button"
                          onClick={() =>
                            setShowAllHistory(
                              (
                                current,
                              ) =>
                                !current,
                            )
                          }
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#304229] transition hover:bg-[#F4F6F1]"
                        >
                          {showAllHistory ? (
                            <>
                              <ChevronUp className="size-4" />

                              Mostrar menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="size-4" />

                              Ver mais{" "}
                              {
                                hiddenHistoryCount
                              }{" "}
                              {hiddenHistoryCount ===
                                1
                                ? "agendamento"
                                : "agendamentos"}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                </div>
              )}
            </section>
          </>
        )}
    </div>
  );
}