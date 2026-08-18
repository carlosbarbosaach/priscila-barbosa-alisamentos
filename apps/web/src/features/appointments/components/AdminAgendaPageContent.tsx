"use client";

import {
  APPOINTMENT_STATUS,
  type Appointment,
  type AppointmentStatus,
} from "@priscila/shared";

import {
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Scissors,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  RejectAppointmentDialog,
} from "@/features/appointments/components/RejectAppointmentDialog";

import {
  useAdminAppointments,
} from "@/features/appointments/hooks/useAdminAppointments";

import {
  useConfirmAppointment,
} from "@/features/appointments/hooks/useConfirmAppointment";

const SALON_TIME_ZONE =
  "America/Sao_Paulo";

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

type AdminAgendaPageContentProps = {
  initialDateKey?: string;
};

function getTodayDateKey() {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone:
          SALON_TIME_ZONE,
      },
    );

  const parts =
    formatter.formatToParts(
      new Date(),
    );

  const year =
    parts.find(
      (part) =>
        part.type === "year",
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value;

  if (
    !year ||
    !month ||
    !day
  ) {
    throw new Error(
      "Não foi possível determinar a data atual.",
    );
  }

  return `${year}-${month}-${day}`;
}

function isValidDateKey(
  value:
    | string
    | undefined,
): value is string {
  if (!value) {
    return false;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return false;
  }

  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return false;
  }

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  return (
    date.getUTCFullYear() ===
      year &&
    date.getUTCMonth() ===
      month - 1 &&
    date.getUTCDate() ===
      day
  );
}

function shiftDateKey(
  dateKey: string,
  amount: number,
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split("-")
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  date.setUTCDate(
    date.getUTCDate() +
      amount,
  );

  const nextYear =
    date
      .getUTCFullYear()
      .toString();

  const nextMonth =
    String(
      date.getUTCMonth() +
        1,
    ).padStart(
      2,
      "0",
    );

  const nextDay =
    String(
      date.getUTCDate(),
    ).padStart(
      2,
      "0",
    );

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function formatSelectedDate(
  dateKey: string,
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split("-")
      .map(Number);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12,
      ),
    );

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone:
        "UTC",
    },
  ).format(
    date,
  );
}

function capitalizeFirstLetter(
  value: string,
) {
  if (!value) {
    return value;
  }

  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
}

function formatTime(
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
    .format(
      date,
    );
}

function formatPrice(
  priceCents: number,
) {
  return currencyFormatter
    .format(
      priceCents /
        100,
    );
}

function getAppointmentStatusConfig(
  status:
    AppointmentStatus,
) {
  switch (status) {
    case APPOINTMENT_STATUS
      .PENDING_APPROVAL:
      return {
        label:
          "Aguardando confirmação",

        icon:
          Clock3,

        className:
          "border-[#E9D8A6] bg-[#FFF8E7] text-[#8A6A2F]",
      };

    case APPOINTMENT_STATUS
      .CONFIRMED:
      return {
        label:
          "Confirmado",

        icon:
          CheckCircle2,

        className:
          "border-[#C9D9C4] bg-[#EEF5EB] text-[#36542E]",
      };

    case APPOINTMENT_STATUS
      .IN_PROGRESS:
      return {
        label:
          "Em atendimento",

        icon:
          Sparkles,

        className:
          "border-[#C9D9C4] bg-[#EEF5EB] text-[#36542E]",
      };

    case APPOINTMENT_STATUS
      .COMPLETED:
      return {
        label:
          "Concluído",

        icon:
          CheckCircle2,

        className:
          "border-[#D7DDD3] bg-[#F4F6F2] text-[#596454]",
      };

    case APPOINTMENT_STATUS
      .REJECTED:
      return {
        label:
          "Recusado",

        icon:
          CircleX,

        className:
          "border-[#E8CEC7] bg-[#FAECE8] text-[#984B3E]",
      };

    case APPOINTMENT_STATUS
      .CANCELLED:
      return {
        label:
          "Cancelado",

        icon:
          Ban,

        className:
          "border-[#DDD8D0] bg-[#F5F3EF] text-[#69645D]",
      };

    default:
      return {
        label:
          status,

        icon:
          Clock3,

        className:
          "border-[#DDD8D0] bg-[#F5F3EF] text-[#69645D]",
      };
  }
}

export function AdminAgendaPageContent({
  initialDateKey,
}: AdminAgendaPageContentProps) {
  const today =
    getTodayDateKey();

  /*
   * Se a página recebeu:
   *
   * /admin/agenda?date=2026-08-25
   *
   * usamos 2026-08-25 como
   * data inicial.
   *
   * Se não houver data ou ela
   * for inválida, usamos hoje.
   */
  const [
    dateKey,
    setDateKey,
  ] =
    useState<string>(
      () =>
        isValidDateKey(
          initialDateKey,
        )
          ? initialDateKey
          : today,
    );

  /*
   * Appointment que está sendo
   * confirmado neste momento.
   */
  const [
    confirmingAppointmentId,
    setConfirmingAppointmentId,
  ] =
    useState<string | null>(
      null,
    );

  /*
   * Appointment selecionado para
   * abrir o modal de recusa.
   */
  const [
    appointmentToReject,
    setAppointmentToReject,
  ] =
    useState<Appointment | null>(
      null,
    );

  const [
    confirmError,
    setConfirmError,
  ] =
    useState<string | null>(
      null,
    );

  const {
    data:
      appointments = [],

    isLoading,
    isError,
    refetch,
    isFetching,
  } =
    useAdminAppointments(
      dateKey,
    );

  const confirmMutation =
    useConfirmAppointment();

  const isToday =
    dateKey ===
    today;

  const formattedDate =
    capitalizeFirstLetter(
      formatSelectedDate(
        dateKey,
      ),
    );

  function clearActionState() {
    setConfirmError(
      null,
    );

    setAppointmentToReject(
      null,
    );
  }

  function handlePreviousDay() {
    clearActionState();

    setDateKey(
      (currentDate) =>
        shiftDateKey(
          currentDate,
          -1,
        ),
    );
  }

  function handleNextDay() {
    clearActionState();

    setDateKey(
      (currentDate) =>
        shiftDateKey(
          currentDate,
          1,
        ),
    );
  }

  function handleToday() {
    clearActionState();

    setDateKey(
      today,
    );
  }

  function handleDateChange(
    value: string,
  ) {
    if (
      !isValidDateKey(
        value,
      )
    ) {
      return;
    }

    clearActionState();

    setDateKey(
      value,
    );
  }

  async function handleConfirmAppointment(
    appointmentId: string,
  ) {
    if (
      confirmMutation
        .isPending
    ) {
      return;
    }

    setConfirmError(
      null,
    );

    setAppointmentToReject(
      null,
    );

    setConfirmingAppointmentId(
      appointmentId,
    );

    try {
      await confirmMutation
        .mutateAsync(
          appointmentId,
        );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar o agendamento.";

      setConfirmError(
        message,
      );
    } finally {
      setConfirmingAppointmentId(
        null,
      );
    }
  }

  function handleOpenRejectDialog(
    appointment: Appointment,
  ) {
    if (
      confirmMutation
        .isPending
    ) {
      return;
    }

    setConfirmError(
      null,
    );

    setAppointmentToReject(
      appointment,
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
      {/* CABEÇALHO */}
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#304229] text-white shadow-sm">
              <CalendarDays className="size-5" />
            </div>

            <div>
              <p className="text-sm text-[#73776D]">
                Administração
              </p>

              <h1 className="text-2xl font-semibold text-[#20241D]">
                Agenda
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#73776D]">
            Visualize os horários do
            salão e acompanhe as
            solicitações das clientes.
          </p>
        </div>

        {/* NAVEGAÇÃO DE DATA */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            disabled={
              isToday
            }
            onClick={
              handleToday
            }
            className="border-[#DDD6C9] bg-[#FFFDF8] text-[#304229]"
          >
            Hoje
          </Button>

          <div className="flex items-center rounded-xl border border-[#DDD6C9] bg-[#FFFDF8] p-1 shadow-sm">
            <button
              type="button"
              onClick={
                handlePreviousDay
              }
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#5E645A] transition hover:bg-[#F1EDE4] hover:text-[#304229]"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="size-5" />
            </button>

            <div className="mx-1 h-6 w-px bg-[#E5DED1]" />

            <input
              type="date"
              value={
                dateKey
              }
              onChange={(
                event,
              ) =>
                handleDateChange(
                  event.target
                    .value,
                )
              }
              className="h-10 min-w-0 border-0 bg-transparent px-3 text-sm font-semibold text-[#20241D] outline-none sm:min-w-[150px]"
              aria-label="Selecionar data da agenda"
            />

            <div className="mx-1 h-6 w-px bg-[#E5DED1]" />

            <button
              type="button"
              onClick={
                handleNextDay
              }
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#5E645A] transition hover:bg-[#F1EDE4] hover:text-[#304229]"
              aria-label="Próximo dia"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* DATA */}
      <section className="mt-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-[#E5DED1] bg-[#FFFDF8] px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F1EBDD] text-[#465B36]">
              <CalendarDays className="size-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8E84]">
                Agenda do dia
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[#20241D] sm:text-xl">
                {
                  formattedDate
                }
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isToday && (
              <span className="rounded-full bg-[#EAF0E5] px-3 py-1.5 text-xs font-semibold text-[#465B36]">
                Hoje
              </span>
            )}

            {!isLoading &&
              !isError && (
                <span className="rounded-full border border-[#E5DED1] bg-white px-3 py-1.5 text-xs font-semibold text-[#62685E]">
                  {appointments.length}{" "}
                  {appointments.length ===
                  1
                    ? "agendamento"
                    : "agendamentos"}
                </span>
              )}
          </div>
        </div>
      </section>

      {/* ERRO DA CONFIRMAÇÃO */}
      {confirmError && (
        <section className="mt-5">
          <div className="flex items-start gap-3 rounded-2xl border border-[#E8D4CF] bg-[#FFF9F7] px-4 py-4 text-[#984B3E]">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">
                Não foi possível
                confirmar o agendamento
              </p>

              <p className="mt-1 text-sm leading-6">
                {confirmError}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* AGENDA */}
      <section className="mt-6">
        <div className="overflow-hidden rounded-2xl border border-[#E5DED1] bg-[#FFFDF8] shadow-sm">
          {/* TÍTULO */}
          <div className="border-b border-[#EAE4D8] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F1EBDD] text-[#465B36]">
                <Clock3 className="size-[18px]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#20241D]">
                  Horários
                </h2>

                <p className="mt-0.5 text-sm text-[#73776D]">
                  Agendamentos e
                  solicitações desta
                  data.
                </p>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="flex min-h-[320px] items-center justify-center p-6">
              <div className="text-center">
                <LoaderCircle className="mx-auto size-7 animate-spin text-[#465B36]" />

                <p className="mt-3 text-sm text-[#73776D]">
                  Carregando agenda...
                </p>
              </div>
            </div>
          )}

          {/* ERRO DA CONSULTA */}
          {!isLoading &&
            isError && (
              <div className="p-5 sm:p-6">
                <div className="rounded-2xl border border-[#E8D4CF] bg-[#FFF9F7] p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FAECE8] text-[#9A4B3E]">
                      <TriangleAlert className="size-5" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#20241D]">
                        Não foi possível
                        carregar a agenda
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#73776D]">
                        Verifique a
                        conexão com a API
                        e tente novamente.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        isFetching
                      }
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

                      Tentar novamente
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* AGENDA VAZIA */}
          {!isLoading &&
            !isError &&
            appointments.length ===
              0 && (
              <div className="p-5 sm:p-6">
                <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-[#D9D2C5] bg-[#FBF9F4] px-6 py-12 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#F1EBDD] text-[#465B36]">
                      <CalendarDays className="size-5" />
                    </div>

                    <h3 className="mt-5 font-semibold text-[#20241D]">
                      Nenhum agendamento
                      neste dia
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#73776D]">
                      Não existem
                      solicitações ou
                      atendimentos
                      cadastrados para
                      esta data.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* AGENDAMENTOS */}
          {!isLoading &&
            !isError &&
            appointments.length >
              0 && (
              <div className="divide-y divide-[#EAE4D8]">
                {appointments.map(
                  (
                    appointment,
                  ) => {
                    const status =
                      getAppointmentStatusConfig(
                        appointment
                          .status,
                      );

                    const StatusIcon =
                      status.icon;

                    const isPending =
                      appointment.status ===
                      APPOINTMENT_STATUS
                        .PENDING_APPROVAL;

                    const isConfirming =
                      confirmingAppointmentId ===
                      appointment.id;

                    return (
                      <article
                        key={
                          appointment.id
                        }
                        className="px-5 py-5 transition hover:bg-[#FBF9F4] sm:px-6"
                      >
                        {/* STATUS */}
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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

                          {isPending && (
                            <span className="text-xs font-medium text-[#8A6A2F]">
                              Requer ação da
                              equipe
                            </span>
                          )}
                        </div>

                        {/* DADOS */}
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                          {/* HORÁRIO */}
                          <div className="flex shrink-0 items-center gap-3 lg:w-[115px]">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#F1EBDD] text-[#465B36]">
                              <Clock3 className="size-[18px]" />
                            </div>

                            <div>
                              <p className="text-xs font-medium text-[#8A8E84]">
                                Horário
                              </p>

                              <p className="mt-0.5 text-lg font-bold text-[#20241D]">
                                {formatTime(
                                  appointment
                                    .startsAt,
                                )}
                              </p>
                            </div>
                          </div>

                          {/* CLIENTE */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#465B36]">
                                <UserRound className="size-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E84]">
                                  Cliente
                                </p>

                                <h3 className="mt-1 truncate font-semibold text-[#20241D]">
                                  {
                                    appointment
                                      .clientNameSnapshot
                                  }
                                </h3>

                                <p className="mt-1 text-sm text-[#73776D]">
                                  {
                                    appointment
                                      .clientPhoneSnapshot
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* SERVIÇO */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EFE4] text-[#8A6A2F]">
                                <Scissors className="size-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E84]">
                                  Serviço
                                </p>

                                <p className="mt-1 truncate font-semibold text-[#20241D]">
                                  {
                                    appointment
                                      .serviceNameSnapshot
                                  }
                                </p>

                                <p className="mt-1 text-sm text-[#73776D]">
                                  {
                                    appointment
                                      .durationMinutes
                                  }{" "}
                                  min
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* VALOR */}
                          <div className="shrink-0 lg:min-w-[130px] lg:text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E84]">
                              Valor
                            </p>

                            <p className="mt-1 text-lg font-semibold text-[#304229]">
                              {formatPrice(
                                appointment
                                  .chargedPriceCents,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* MOTIVO DE RECUSA */}
                        {appointment.status ===
                          APPOINTMENT_STATUS
                            .REJECTED &&
                          appointment
                            .rejectionReason && (
                            <div className="mt-5 rounded-xl border border-[#E8CEC7] bg-[#FFF8F6] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#984B3E]">
                                Motivo da
                                recusa
                              </p>

                              <p className="mt-1 text-sm leading-6 text-[#6E554F]">
                                {
                                  appointment
                                    .rejectionReason
                                }
                              </p>
                            </div>
                          )}

                        {/* AÇÕES */}
                        {isPending && (
                          <div className="mt-5 flex flex-col gap-3 border-t border-[#EAE4D8] pt-5 sm:flex-row sm:items-center sm:justify-end">
                            {/* RECUSAR */}
                            <Button
                              type="button"
                              variant="outline"
                              disabled={
                                confirmMutation
                                  .isPending
                              }
                              onClick={() =>
                                handleOpenRejectDialog(
                                  appointment,
                                )
                              }
                              className="border-[#D8BEB7] text-[#984B3E] hover:bg-[#FFF5F2] hover:text-[#813E34]"
                            >
                              <CircleX className="mr-2 size-4" />

                              Recusar
                            </Button>

                            {/* CONFIRMAR */}
                            <Button
                              type="button"
                              disabled={
                                confirmMutation
                                  .isPending
                              }
                              onClick={() =>
                                void handleConfirmAppointment(
                                  appointment.id,
                                )
                              }
                              className="bg-[#304229] text-white hover:bg-[#24351F]"
                            >
                              {isConfirming ? (
                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                              ) : (
                                <Check className="mr-2 size-4" />
                              )}

                              {isConfirming
                                ? "Confirmando..."
                                : "Confirmar"}
                            </Button>
                          </div>
                        )}
                      </article>
                    );
                  },
                )}
              </div>
            )}
        </div>
      </section>

      {/* MODAL DE RECUSA */}
      {appointmentToReject && (
        <RejectAppointmentDialog
          key={
            appointmentToReject.id
          }
          appointment={
            appointmentToReject
          }
          onOpenChange={(
            open,
          ) => {
            if (!open) {
              setAppointmentToReject(
                null,
              );
            }
          }}
        />
      )}
    </main>
  );
}