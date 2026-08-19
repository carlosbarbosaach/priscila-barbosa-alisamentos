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
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  LoaderCircle,
  Phone,
  Play,
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
  CompleteAppointmentDialog,
} from "@/features/appointments/components/CompleteAppointmentDialog";

import {
  RejectAppointmentDialog,
} from "@/features/appointments/components/RejectAppointmentDialog";

import {
  useAdminAppointments,
} from "@/features/appointments/hooks/useAdminAppointments";

import {
  useCompleteAppointment,
} from "@/features/appointments/hooks/useCompleteAppointment";

import {
  useConfirmAppointment,
} from "@/features/appointments/hooks/useConfirmAppointment";

import {
  useStartAppointment,
} from "@/features/appointments/hooks/useStartAppointment";

import {
  useServices,
} from "@/features/services/hooks/useServices";

const SALON_TIME_ZONE =
  "America/Sao_Paulo";

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

type AdminAgendaPageContentProps = {
  initialDateKey?:
    string;
};

/*
 * =================================
 * TELEFONE
 * =================================
 *
 * Exemplos aceitos:
 *
 * 5548996825149
 * 48996825149
 * +55 (48) 99682-5149
 *
 * Resultado:
 *
 * +55 (48) 99682-5149
 */
function formatBrazilPhone(
  phone:
    string,
) {
  const digits =
    phone.replace(
      /\D/g,
      "",
    );

  /*
   * Celular com +55.
   *
   * 5548996825149
   */
  if (
    digits.length ===
      13 &&
    digits.startsWith(
      "55",
    )
  ) {
    const countryCode =
      digits.slice(
        0,
        2,
      );

    const areaCode =
      digits.slice(
        2,
        4,
      );

    const firstPart =
      digits.slice(
        4,
        9,
      );

    const secondPart =
      digits.slice(
        9,
        13,
      );

    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  }

  /*
   * Celular sem +55.
   *
   * 48996825149
   */
  if (
    digits.length ===
    11
  ) {
    const areaCode =
      digits.slice(
        0,
        2,
      );

    const firstPart =
      digits.slice(
        2,
        7,
      );

    const secondPart =
      digits.slice(
        7,
        11,
      );

    return `+55 (${areaCode}) ${firstPart}-${secondPart}`;
  }

  /*
   * Telefone fixo com +55.
   */
  if (
    digits.length ===
      12 &&
    digits.startsWith(
      "55",
    )
  ) {
    const countryCode =
      digits.slice(
        0,
        2,
      );

    const areaCode =
      digits.slice(
        2,
        4,
      );

    const firstPart =
      digits.slice(
        4,
        8,
      );

    const secondPart =
      digits.slice(
        8,
        12,
      );

    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  }

  /*
   * Telefone fixo sem +55.
   */
  if (
    digits.length ===
    10
  ) {
    const areaCode =
      digits.slice(
        0,
        2,
      );

    const firstPart =
      digits.slice(
        2,
        6,
      );

    const secondPart =
      digits.slice(
        6,
        10,
      );

    return `+55 (${areaCode}) ${firstPart}-${secondPart}`;
  }

  /*
   * Não alteramos números antigos
   * que estejam fora do padrão.
   */
  return phone;
}

function getTodayDateKey() {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        timeZone:
          SALON_TIME_ZONE,
      },
    );

  const parts =
    formatter
      .formatToParts(
        new Date(),
      );

  const year =
    parts.find(
      (
        part,
      ) =>
        part.type ===
        "year",
    )?.value;

  const month =
    parts.find(
      (
        part,
      ) =>
        part.type ===
        "month",
    )?.value;

  const day =
    parts.find(
      (
        part,
      ) =>
        part.type ===
        "day",
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
      .split(
        "-",
      )
      .map(
        Number,
      );

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
        month -
          1,
        day,
      ),
    );

  return (
    date.getUTCFullYear() ===
      year &&
    date.getUTCMonth() ===
      month -
        1 &&
    date.getUTCDate() ===
      day
  );
}

function shiftDateKey(
  dateKey:
    string,

  amount:
    number,
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split(
        "-",
      )
      .map(
        Number,
      );

  const date =
    new Date(
      Date.UTC(
        year,
        month -
          1,
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
  dateKey:
    string,
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split(
        "-",
      )
      .map(
        Number,
      );

  const date =
    new Date(
      Date.UTC(
        year,
        month -
          1,
        day,
        12,
      ),
    );

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday:
        "long",

      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",

      timeZone:
        "UTC",
    },
  ).format(
    date,
  );
}

function capitalizeFirstLetter(
  value:
    string,
) {
  if (!value) {
    return value;
  }

  return (
    value
      .charAt(
        0,
      )
      .toUpperCase() +
    value.slice(
      1,
    )
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

function getAppointmentStatusConfig(
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
          "border-[#E8D4A7] bg-[#FFF6DF] text-[#8A6525]",
      };

    case APPOINTMENT_STATUS
      .COMPLETED:
      return {
        label:
          "Concluído",

        icon:
          CheckCircle2,

        className:
          "border-[#C9D9C4] bg-[#EDF5EA] text-[#36542E]",
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

  const [
    confirmingAppointmentId,
    setConfirmingAppointmentId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    startingAppointmentId,
    setStartingAppointmentId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    completingAppointmentId,
    setCompletingAppointmentId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    appointmentToReject,
    setAppointmentToReject,
  ] =
    useState<
      Appointment | null
    >(
      null,
    );

  const [
    appointmentToComplete,
    setAppointmentToComplete,
  ] =
    useState<
      Appointment | null
    >(
      null,
    );

  const [
    actionError,
    setActionError,
  ] =
    useState<
      string | null
    >(
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

  /*
   * Fallback para agendamentos
   * antigos sem snapshot do
   * tipo de preço.
   */
  const {
    data:
      services = [],
  } =
    useServices();

  const confirmMutation =
    useConfirmAppointment();

  const startMutation =
    useStartAppointment();

  const completeMutation =
    useCompleteAppointment();

  const isToday =
    dateKey ===
    today;

  const formattedDate =
    capitalizeFirstLetter(
      formatSelectedDate(
        dateKey,
      ),
    );

  const isActionPending =
    confirmMutation
      .isPending ||
    startMutation
      .isPending ||
    completeMutation
      .isPending;

  function resolveAppointmentPriceType(
    appointment:
      Appointment,
  ): ServicePriceType | null {
    if (
      appointment
        .servicePriceTypeSnapshot
    ) {
      return appointment
        .servicePriceTypeSnapshot;
    }

    const service =
      services.find(
        (
          currentService,
        ) =>
          currentService.id ===
          appointment.serviceId,
      );

    return (
      service
        ?.priceType ??
      null
    );
  }

  function isVariablePriceAppointment(
    appointment:
      Appointment,
  ) {
    if (
      appointment.priceSource ===
      APPOINTMENT_PRICE_SOURCE
        .CLIENT_SPECIAL
    ) {
      return false;
    }

    const priceType =
      resolveAppointmentPriceType(
        appointment,
      );

    return (
      priceType ===
        SERVICE_PRICE_TYPES
          .STARTING_FROM ||
      priceType ===
        null
    );
  }

  function clearActionState() {
    setActionError(
      null,
    );

    setAppointmentToReject(
      null,
    );

    setAppointmentToComplete(
      null,
    );
  }

  function handlePreviousDay() {
    clearActionState();

    setDateKey(
      (
        currentDate,
      ) =>
        shiftDateKey(
          currentDate,
          -1,
        ),
    );
  }

  function handleNextDay() {
    clearActionState();

    setDateKey(
      (
        currentDate,
      ) =>
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
    value:
      string,
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
    appointmentId:
      string,
  ) {
    if (
      isActionPending
    ) {
      return;
    }

    setActionError(
      null,
    );

    setAppointmentToReject(
      null,
    );

    setAppointmentToComplete(
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
    } catch (
      error
    ) {
      setActionError(
        error instanceof
          Error
          ? error.message
          : "Não foi possível confirmar o agendamento.",
      );
    } finally {
      setConfirmingAppointmentId(
        null,
      );
    }
  }

  async function handleStartAppointment(
    appointmentId:
      string,
  ) {
    if (
      isActionPending
    ) {
      return;
    }

    setActionError(
      null,
    );

    setStartingAppointmentId(
      appointmentId,
    );

    try {
      await startMutation
        .mutateAsync(
          appointmentId,
        );
    } catch (
      error
    ) {
      setActionError(
        error instanceof
          Error
          ? error.message
          : "Não foi possível iniciar o atendimento.",
      );
    } finally {
      setStartingAppointmentId(
        null,
      );
    }
  }

  async function handleCompleteAppointment(
    appointment:
      Appointment,
  ) {
    if (
      isActionPending
    ) {
      return;
    }

    setActionError(
      null,
    );

    if (
      isVariablePriceAppointment(
        appointment,
      )
    ) {
      setAppointmentToComplete(
        appointment,
      );

      return;
    }

    setCompletingAppointmentId(
      appointment.id,
    );

    try {
      await completeMutation
        .mutateAsync({
          appointmentId:
            appointment.id,
        });
    } catch (
      error
    ) {
      setActionError(
        error instanceof
          Error
          ? error.message
          : "Não foi possível concluir o atendimento.",
      );
    } finally {
      setCompletingAppointmentId(
        null,
      );
    }
  }

  function handleOpenRejectDialog(
    appointment:
      Appointment,
  ) {
    if (
      isActionPending
    ) {
      return;
    }

    setActionError(
      null,
    );

    setAppointmentToComplete(
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
                  event
                    .target
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

      {/* ERRO */}
      {actionError && (
        <section className="mt-5">
          <div className="flex items-start gap-3 rounded-2xl border border-[#E8D4CF] bg-[#FFF9F7] px-4 py-4 text-[#984B3E]">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" />

            <div>
              <p className="text-sm font-semibold">
                Não foi possível atualizar o agendamento
              </p>

              <p className="mt-1 text-sm leading-6">
                {
                  actionError
                }
              </p>
            </div>
          </div>
        </section>
      )}

      {/* AGENDA */}
      <section className="mt-6">
        <div className="overflow-hidden rounded-2xl border border-[#E5DED1] bg-[#FFFDF8] shadow-sm">
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
                  Agendamentos e solicitações desta data.
                </p>
              </div>
            </div>
          </div>

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
                        Não foi possível carregar a agenda
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#73776D]">
                        Verifique a conexão com a API e tente novamente.
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
                      Nenhum agendamento neste dia
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#73776D]">
                      Não existem solicitações ou atendimentos cadastrados para esta data.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                        appointment.status,
                      );

                    const StatusIcon =
                      status.icon;

                    const isPending =
                      appointment.status ===
                      APPOINTMENT_STATUS
                        .PENDING_APPROVAL;

                    const isConfirmed =
                      appointment.status ===
                      APPOINTMENT_STATUS
                        .CONFIRMED;

                    const isInProgress =
                      appointment.status ===
                      APPOINTMENT_STATUS
                        .IN_PROGRESS;

                    const isCompleted =
                      appointment.status ===
                      APPOINTMENT_STATUS
                        .COMPLETED;

                    const isConfirming =
                      confirmingAppointmentId ===
                      appointment.id;

                    const isStarting =
                      startingAppointmentId ===
                      appointment.id;

                    const isCompleting =
                      completingAppointmentId ===
                      appointment.id;

                    const variablePrice =
                      isVariablePriceAppointment(
                        appointment,
                      );

                    const formattedPhone =
                      formatBrazilPhone(
                        appointment
                          .clientPhoneSnapshot,
                      );

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
                              Requer ação da equipe
                            </span>
                          )}

                          {isInProgress && (
                            <span className="text-xs font-semibold text-[#8A6525]">
                              Atendimento em andamento
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-xs font-semibold text-[#36542E]">
                              Atendimento finalizado
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

                                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#73776D]">
                                  <Phone className="size-3.5 shrink-0 text-[#8A8E84]" />

                                  <span className="whitespace-nowrap font-medium">
                                    {
                                      formattedPhone
                                    }
                                  </span>
                                </div>
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
                          <div className="shrink-0 lg:min-w-[145px] lg:text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E84]">
                              {variablePrice
                                ? isCompleted
                                  ? "Valor final"
                                  : "Valor inicial"
                                : "Valor"}
                            </p>

                            {variablePrice &&
                              !isCompleted && (
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#788273]">
                                  A partir de
                                </p>
                              )}

                            <p className="mt-1 text-lg font-semibold text-[#304229]">
                              {formatPrice(
                                appointment
                                  .chargedPriceCents,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* MOTIVO RECUSA */}
                        {appointment.status ===
                          APPOINTMENT_STATUS
                            .REJECTED &&
                          appointment
                            .rejectionReason && (
                            <div className="mt-5 rounded-xl border border-[#E8CEC7] bg-[#FFF8F6] px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#984B3E]">
                                Motivo da recusa
                              </p>

                              <p className="mt-1 text-sm leading-6 text-[#6E554F]">
                                {
                                  appointment
                                    .rejectionReason
                                }
                              </p>
                            </div>
                          )}

                        {/* PENDENTE */}
                        {isPending && (
                          <div className="mt-5 flex flex-col gap-3 border-t border-[#EAE4D8] pt-5 sm:flex-row sm:items-center sm:justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={
                                isActionPending
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

                            <Button
                              type="button"
                              disabled={
                                isActionPending
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

                        {/* CONFIRMADO */}
                        {isConfirmed && (
                          <div className="mt-5 flex justify-end border-t border-[#EAE4D8] pt-5">
                            <Button
                              type="button"
                              disabled={
                                isActionPending
                              }
                              onClick={() =>
                                void handleStartAppointment(
                                  appointment.id,
                                )
                              }
                              className="bg-[#304229] text-white hover:bg-[#24351F]"
                            >
                              {isStarting ? (
                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                              ) : (
                                <Play className="mr-2 size-4 fill-current" />
                              )}

                              {isStarting
                                ? "Iniciando..."
                                : "Iniciar atendimento"}
                            </Button>
                          </div>
                        )}

                        {/* EM ATENDIMENTO */}
                        {isInProgress && (
                          <div className="mt-5 flex justify-end border-t border-[#EAE4D8] pt-5">
                            <Button
                              type="button"
                              disabled={
                                isActionPending
                              }
                              onClick={() =>
                                void handleCompleteAppointment(
                                  appointment,
                                )
                              }
                              className="bg-[#465B36] text-white hover:bg-[#304229]"
                            >
                              {isCompleting ? (
                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 size-4" />
                              )}

                              {isCompleting
                                ? "Concluindo..."
                                : variablePrice
                                  ? "Informar valor e concluir"
                                  : "Concluir atendimento"}
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

      {/* MODAL RECUSA */}
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

      {/* MODAL VALOR FINAL */}
      {appointmentToComplete && (
        <CompleteAppointmentDialog
          key={
            appointmentToComplete.id
          }
          appointment={
            appointmentToComplete
          }
          onOpenChange={(
            open,
          ) => {
            if (!open) {
              setAppointmentToComplete(
                null,
              );
            }
          }}
        />
      )}
    </main>
  );
}