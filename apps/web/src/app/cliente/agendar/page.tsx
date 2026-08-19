"use client";

import {
  APPOINTMENT_PRICE_SOURCE,
  SERVICE_PRICE_TYPES,
  type Appointment,
  type ClientBookableService,
} from "@priscila/shared";

import {
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Scissors,
  Sparkles,
  Tag,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  useAppointmentAvailability,
} from "@/features/appointments/hooks/useAppointmentAvailability";

import {
  useClientBookableServices,
} from "@/features/appointments/hooks/useClientBookableServices";

import {
  useCreateAppointment,
} from "@/features/appointments/hooks/useCreateAppointment";

const SALON_TIME_ZONE =
  "America/Sao_Paulo";

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

/*
 * =================================
 * PREÇOS
 * =================================
 */

function isClientSpecialPrice(
  service:
    ClientBookableService,
) {
  return (
    service.priceSource ===
    APPOINTMENT_PRICE_SOURCE
      .CLIENT_SPECIAL
  );
}

function isStartingFromPrice(
  service:
    ClientBookableService,
) {
  return (
    service.priceType ===
    SERVICE_PRICE_TYPES
      .STARTING_FROM
  );
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

function formatDateKey(
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

  if (
    !year ||
    !month ||
    !day
  ) {
    return dateKey;
  }

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

  const formatted =
    new Intl.DateTimeFormat(
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

  return (
    formatted
      .charAt(
        0,
      )
      .toUpperCase() +
    formatted
      .slice(
        1,
      )
  );
}

function formatDuration(
  minutes:
    number,
) {
  if (
    minutes <
    60
  ) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes /
        60,
    );

  const remainingMinutes =
    minutes %
    60;

  if (
    remainingMinutes ===
    0
  ) {
    return hours ===
      1
      ? "1 hora"
      : `${hours} horas`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

export default function ClientBookingPage() {
  const today =
    getTodayDateKey();

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    selectedStartTime,
    setSelectedStartTime,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    submitError,
    setSubmitError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    createdAppointment,
    setCreatedAppointment,
  ] =
    useState<
      Appointment | null
    >(
      null,
    );

  /*
   * ==============================
   * SERVIÇOS
   * ==============================
   */

  const {
    data:
      services = [],

    isLoading:
      servicesLoading,

    isError:
      servicesError,

    refetch:
      refetchServices,

    isFetching:
      servicesFetching,
  } =
    useClientBookableServices();

  const selectedService =
    services.find(
      (
        service,
      ) =>
        service.id ===
        selectedServiceId,
    ) ??
    null;

  /*
   * ==============================
   * DISPONIBILIDADE
   * ==============================
   */

  const {
    data:
      availability,

    isLoading:
      availabilityLoading,

    isFetching:
      availabilityFetching,

    isError:
      availabilityError,

    refetch:
      refetchAvailability,
  } =
    useAppointmentAvailability({
      serviceId:
        selectedServiceId,

      dateKey:
        selectedDate,
    });

  const slots =
    availability
      ?.slots ??
    [];

  const selectedSlot =
    slots.find(
      (
        slot,
      ) =>
        slot.startTime ===
        selectedStartTime,
    ) ??
    null;

  /*
   * ==============================
   * CRIAÇÃO
   * ==============================
   */

  const createMutation =
    useCreateAppointment();

  function handleSelectService(
    serviceId:
      string,
  ) {
    setSelectedServiceId(
      serviceId,
    );

    /*
     * Mantemos a data caso já
     * tenha sido escolhida,
     * mas limpamos o horário porque
     * outro serviço pode possuir
     * disponibilidade diferente.
     */
    setSelectedStartTime(
      null,
    );

    setSubmitError(
      null,
    );

    setCreatedAppointment(
      null,
    );
  }

  function handleSelectDate(
    dateKey:
      string,
  ) {
    setSelectedDate(
      dateKey ||
      null,
    );

    /*
     * Ao trocar a data o horário
     * anterior deixa de ser válido.
     */
    setSelectedStartTime(
      null,
    );

    setSubmitError(
      null,
    );

    setCreatedAppointment(
      null,
    );
  }

  function handleSelectTime(
    startTime:
      string,
  ) {
    setSelectedStartTime(
      startTime,
    );

    setSubmitError(
      null,
    );

    setCreatedAppointment(
      null,
    );
  }

  async function handleSubmitAppointment() {
    if (
      !selectedServiceId ||
      !selectedDate ||
      !selectedStartTime
    ) {
      return;
    }

    if (
      createMutation
        .isPending
    ) {
      return;
    }

    setSubmitError(
      null,
    );

    try {
      const appointment =
        await createMutation
          .mutateAsync({
            /*
             * Importante:
             *
             * só enviamos os dados
             * permitidos pelo backend.
             *
             * Não enviamos:
             *
             * clientId
             * salonId
             * price
             * status
             * duration
             */
            serviceId:
              selectedServiceId,

            dateKey:
              selectedDate,

            startTime:
              selectedStartTime,
          });

      setCreatedAppointment(
        appointment,
      );
    } catch (
      error
    ) {
      const message =
        error instanceof
          Error
          ? error.message
          : "Não foi possível enviar sua solicitação.";

      setSubmitError(
        message,
      );
    }
  }

  /*
   * ==============================
   * SUCESSO
   * ==============================
   */

  if (
    createdAppointment
  ) {
    const createdServiceHasSpecialPrice =
      selectedService
        ? isClientSpecialPrice(
            selectedService,
          )
        : false;

    const createdServiceIsStartingFrom =
      selectedService
        ? isStartingFromPrice(
            selectedService,
          )
        : false;

    return (
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-3xl border border-[#DDE3D9] bg-white shadow-sm">
          <div className="bg-[#304229] px-6 py-8 text-white sm:px-8 sm:py-10">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10">
              <CheckCircle2 className="size-7" />
            </div>

            <p className="mt-6 text-sm font-medium text-white/70">
              Solicitação enviada
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Seu horário foi solicitado!
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              O salão recebeu sua
              solicitação. Agora basta
              aguardar a confirmação.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-[#E5E0D5] bg-[#FBFAF7] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#92978E]">
                Resumo
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-[#92978E]">
                    Serviço
                  </p>

                  <p className="mt-1 font-semibold text-[#263620]">
                    {
                      createdAppointment
                        .serviceNameSnapshot
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#92978E]">
                    Status
                  </p>

                  <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-[#E9D8A6] bg-[#FFF8E7] px-3 py-1.5 text-xs font-semibold text-[#8A6A2F]">
                    <Clock3 className="size-3.5" />

                    Aguardando confirmação
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#92978E]">
                    Data
                  </p>

                  <p className="mt-1 font-semibold text-[#263620]">
                    {selectedDate
                      ? formatDateKey(
                          selectedDate,
                        )
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#92978E]">
                    Horário
                  </p>

                  <p className="mt-1 font-semibold text-[#263620]">
                    {
                      selectedStartTime
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#92978E]">
                    {createdServiceIsStartingFrom &&
                    !createdServiceHasSpecialPrice
                      ? "Valor inicial"
                      : "Valor"}
                  </p>

                  {createdServiceIsStartingFrom &&
                  !createdServiceHasSpecialPrice ? (
                    <div className="mt-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#788273]">
                        A partir de
                      </p>

                      <p className="mt-0.5 text-lg font-bold text-[#304229]">
                        {formatPrice(
                          createdAppointment
                            .chargedPriceCents,
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-lg font-bold text-[#304229]">
                      {formatPrice(
                        createdAppointment
                          .chargedPriceCents,
                      )}
                    </p>
                  )}

                  {createdServiceHasSpecialPrice && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F5EBD2] px-2.5 py-1 text-[11px] font-semibold text-[#8A6A2F]">
                      <Tag className="size-3" />

                      Seu preço
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E9D8A6] bg-[#FFF9EA] p-4">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-5 shrink-0 text-[#8A6A2F]" />

                <div>
                  <p className="text-sm font-semibold text-[#6F5728]">
                    Ainda não está
                    confirmado
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#806C42]">
                    A solicitação será
                    analisada pelo
                    salão. Quando for
                    confirmada ou
                    recusada, o status
                    aparecerá em seus
                    agendamentos.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cliente/agendamentos"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#304229] px-5 text-sm font-semibold text-white transition hover:bg-[#24351F]"
              >
                <CalendarCheck2 className="size-4" />

                Meus agendamentos
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSelectedServiceId(
                    null,
                  );

                  setSelectedDate(
                    null,
                  );

                  setSelectedStartTime(
                    null,
                  );

                  setSubmitError(
                    null,
                  );

                  setCreatedAppointment(
                    null,
                  );
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#D8D3C8] bg-white px-5 text-sm font-semibold text-[#304229] transition hover:bg-[#F6F4EE]"
              >
                <CalendarDays className="size-4" />

                Fazer outro agendamento
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* CABEÇALHO */}
      <section>
        <p className="text-sm font-medium text-[#7A8075]">
          Agendamento
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#263620] sm:text-3xl">
          Agendar horário
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71776D] sm:text-base">
          Escolha o serviço, a data
          e um horário disponível.
          Depois é só enviar sua
          solicitação para o salão.
        </p>
      </section>

      {/* PASSOS */}
      <section className="grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
        <div
          className={[
            "rounded-2xl border px-3 py-3",

            selectedServiceId
              ? "border-[#C8D5C3] bg-[#EEF5EB]"
              : "border-[#E5E0D5] bg-white",
          ].join(
            " ",
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8E84]">
            Passo 1
          </p>

          <p className="mt-1 text-xs font-semibold text-[#304229] sm:text-sm">
            Serviço
          </p>
        </div>

        <div
          className={[
            "rounded-2xl border px-3 py-3",

            selectedDate
              ? "border-[#C8D5C3] bg-[#EEF5EB]"
              : "border-[#E5E0D5] bg-white",
          ].join(
            " ",
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8E84]">
            Passo 2
          </p>

          <p className="mt-1 text-xs font-semibold text-[#304229] sm:text-sm">
            Data
          </p>
        </div>

        <div
          className={[
            "rounded-2xl border px-3 py-3",

            selectedStartTime
              ? "border-[#C8D5C3] bg-[#EEF5EB]"
              : "border-[#E5E0D5] bg-white",
          ].join(
            " ",
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8E84]">
            Passo 3
          </p>

          <p className="mt-1 text-xs font-semibold text-[#304229] sm:text-sm">
            Horário
          </p>
        </div>
      </section>

      {/* SERVIÇO */}
      <section>
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#304229]">
              <Scissors className="size-[18px]" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#92978E]">
                Passo 1
              </p>

              <h2 className="font-bold text-[#263620]">
                Escolha o serviço
              </h2>
            </div>
          </div>
        </div>

        {servicesLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              1,
              2,
              3,
            ].map(
              (
                item,
              ) => (
                <div
                  key={
                    item
                  }
                  className="h-[190px] animate-pulse rounded-3xl border border-[#E5E0D5] bg-white"
                />
              ),
            )}
          </div>
        )}

        {!servicesLoading &&
          servicesError && (
            <div className="rounded-3xl border border-[#E8D4CF] bg-white p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FAECE8] text-[#984B3E]">
                  <TriangleAlert className="size-5" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-[#263620]">
                    Não foi possível
                    carregar os serviços
                  </h3>

                  <p className="mt-1 text-sm text-[#71776D]">
                    Tente novamente em
                    alguns instantes.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    servicesFetching
                  }
                  onClick={() =>
                    void refetchServices()
                  }
                >
                  {servicesFetching && (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  )}

                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

        {!servicesLoading &&
          !servicesError &&
          services.length ===
            0 && (
            <div className="rounded-3xl border border-dashed border-[#D8D3C8] bg-white/60 p-8 text-center">
              <Scissors className="mx-auto size-8 text-[#8A8E84]" />

              <h3 className="mt-4 font-semibold text-[#263620]">
                Nenhum serviço disponível
              </h3>

              <p className="mt-2 text-sm text-[#71776D]">
                No momento não há
                serviços disponíveis
                para agendamento.
              </p>
            </div>
          )}

        {!servicesLoading &&
          !servicesError &&
          services.length >
            0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {services.map(
                (
                  service,
                ) => {
                  const selected =
                    selectedServiceId ===
                    service.id;

                  const specialPrice =
                    isClientSpecialPrice(
                      service,
                    );

                  const startingFrom =
                    isStartingFromPrice(
                      service,
                    );

                  const hasSpecialPrice =
                    specialPrice &&
                    service.priceCents !==
                      service
                        .defaultPriceCents;

                  return (
                    <button
                      key={
                        service.id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectService(
                          service.id,
                        )
                      }
                      className={[
                        "relative overflow-hidden rounded-3xl border p-5 text-left shadow-sm transition",

                        selected
                          ? "border-[#607456] bg-[#F8FBF6] ring-2 ring-[#607456]/15"
                          : "border-[#E5E0D5] bg-white hover:-translate-y-0.5 hover:border-[#C8D0C3] hover:shadow-md",
                      ].join(
                        " ",
                      )}
                    >
                      {selected && (
                        <div className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-[#304229] text-white">
                          <Check className="size-4" />
                        </div>
                      )}

                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#304229]">
                        <Sparkles className="size-5" />
                      </div>

                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#92978E]">
                        Serviço
                      </p>

                      <h3 className="mt-1 pr-9 text-lg font-bold text-[#263620]">
                        {
                          service.name
                        }
                      </h3>

                      {service.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#71776D]">
                          {
                            service.description
                          }
                        </p>
                      )}

                      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#EEEAE1] pt-4">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#7A8075]">
                            <Clock3 className="size-3.5" />

                            {formatDuration(
                              service
                                .durationMinutes,
                            )}
                          </div>

                          {hasSpecialPrice && (
                            <p className="mt-2 text-xs text-[#92978E] line-through">
                              {startingFrom
                                ? `A partir de ${formatPrice(
                                    service
                                      .defaultPriceCents,
                                  )}`
                                : formatPrice(
                                    service
                                      .defaultPriceCents,
                                  )}
                            </p>
                          )}

                          {!specialPrice &&
                          startingFrom ? (
                            <div className="mt-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#788273]">
                                A partir de
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-[#304229]">
                                {formatPrice(
                                  service
                                    .priceCents,
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="mt-1 text-xl font-bold text-[#304229]">
                              {formatPrice(
                                service
                                  .priceCents,
                              )}
                            </p>
                          )}
                        </div>

                        {hasSpecialPrice && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5EBD2] px-2.5 py-1 text-[11px] font-semibold text-[#8A6A2F]">
                            <Tag className="size-3" />

                            Seu preço
                          </span>
                        )}
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
      </section>

      {/* DATA */}
      {selectedService && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#304229]">
              <CalendarDays className="size-[18px]" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#92978E]">
                Passo 2
              </p>

              <h2 className="font-bold text-[#263620]">
                Escolha a data
              </h2>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-sm sm:p-6">
            <label
              htmlFor="bookingDate"
              className="text-sm font-semibold text-[#263620]"
            >
              Data do atendimento
            </label>

            <p className="mt-1 text-sm leading-6 text-[#71776D]">
              Depois de selecionar a
              data, mostraremos somente
              os horários disponíveis
              para solicitação.
            </p>

            <input
              id="bookingDate"
              type="date"
              min={
                today
              }
              value={
                selectedDate ??
                ""
              }
              onChange={(
                event,
              ) =>
                handleSelectDate(
                  event
                    .target
                    .value,
                )
              }
              className="mt-4 h-12 w-full rounded-xl border border-[#D9D2C5] bg-white px-4 text-sm font-semibold text-[#263620] outline-none transition focus:border-[#607456] focus:ring-2 focus:ring-[#607456]/10 sm:max-w-sm"
            />

            {selectedDate && (
              <p className="mt-3 text-sm font-medium text-[#304229]">
                {formatDateKey(
                  selectedDate,
                )}
              </p>
            )}
          </div>
        </section>
      )}

      {/* HORÁRIOS */}
      {selectedService &&
        selectedDate && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#304229]">
                <Clock3 className="size-[18px]" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#92978E]">
                  Passo 3
                </p>

                <h2 className="font-bold text-[#263620]">
                  Escolha o horário
                </h2>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E0D5] bg-white p-5 shadow-sm sm:p-6">
              {(availabilityLoading ||
                availabilityFetching) && (
                  <div className="flex min-h-32 items-center justify-center">
                    <div className="text-center">
                      <LoaderCircle className="mx-auto size-6 animate-spin text-[#304229]" />

                      <p className="mt-3 text-sm text-[#71776D]">
                        Buscando horários
                        disponíveis...
                      </p>
                    </div>
                  </div>
                )}

              {!availabilityLoading &&
                !availabilityFetching &&
                availabilityError && (
                  <div className="rounded-2xl border border-[#E8D4CF] bg-[#FFF9F7] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <TriangleAlert className="size-5 shrink-0 text-[#984B3E]" />

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#263620]">
                          Não foi possível
                          consultar os
                          horários.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          void refetchAvailability()
                        }
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  </div>
                )}

              {!availabilityLoading &&
                !availabilityFetching &&
                !availabilityError &&
                slots.length ===
                  0 && (
                  <div className="py-8 text-center">
                    <CalendarDays className="mx-auto size-8 text-[#9A9F95]" />

                    <h3 className="mt-4 font-semibold text-[#263620]">
                      Nenhum horário
                      disponível
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#71776D]">
                      Não encontramos
                      horários disponíveis
                      para essa data.
                      Escolha outro dia
                      para continuar.
                    </p>
                  </div>
                )}

              {!availabilityLoading &&
                !availabilityFetching &&
                !availabilityError &&
                slots.length >
                  0 && (
                  <>
                    <p className="text-sm text-[#71776D]">
                      Toque em um horário
                      para selecionar:
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                      {slots.map(
                        (
                          slot,
                        ) => {
                          const selected =
                            selectedStartTime ===
                            slot.startTime;

                          return (
                            <button
                              key={
                                slot.startTime
                              }
                              type="button"
                              onClick={() =>
                                handleSelectTime(
                                  slot.startTime,
                                )
                              }
                              className={[
                                "min-h-12 rounded-xl border px-3 py-2 text-sm font-semibold transition",

                                selected
                                  ? "border-[#304229] bg-[#304229] text-white shadow-sm"
                                  : "border-[#DDD6C9] bg-[#FFFDF8] text-[#394035] hover:border-[#607456] hover:bg-[#F5F7F2]",
                              ].join(
                                " ",
                              )}
                            >
                              {
                                slot.startTime
                              }
                            </button>
                          );
                        },
                      )}
                    </div>
                  </>
                )}
            </div>
          </section>
        )}

      {/* CONFIRMAÇÃO */}
      {selectedService &&
        selectedDate &&
        selectedSlot && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5EBD2] text-[#8A6A2F]">
                <CalendarCheck2 className="size-[18px]" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#92978E]">
                  Confirmação
                </p>

                <h2 className="font-bold text-[#263620]">
                  Confira sua solicitação
                </h2>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[#DDE3D9] bg-white shadow-sm">
              <div className="grid gap-0 md:grid-cols-[1fr_260px]">
                <div className="p-5 sm:p-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Scissors className="mt-0.5 size-4 text-[#7A8075]" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
                          Serviço
                        </p>

                        <p className="mt-1 font-semibold text-[#263620]">
                          {
                            selectedService
                              .name
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4 text-[#7A8075]" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
                          Duração estimada
                        </p>

                        <p className="mt-1 font-semibold text-[#263620]">
                          {formatDuration(
                            selectedService
                              .durationMinutes,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 size-4 text-[#7A8075]" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
                          Data
                        </p>

                        <p className="mt-1 font-semibold text-[#263620]">
                          {formatDateKey(
                            selectedDate,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4 text-[#7A8075]" />

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#92978E]">
                          Horário
                        </p>

                        <p className="mt-1 font-semibold text-[#263620]">
                          {
                            selectedSlot
                              .startTime
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#EEEAE1] bg-[#FBFCF9] p-5 sm:p-6 md:border-l md:border-t-0">
                  <div className="flex items-center gap-2 text-[#304229]">
                    <WalletCards className="size-4" />

                    <p className="text-xs font-semibold uppercase tracking-wide">
                      {isStartingFromPrice(
                        selectedService,
                      ) &&
                      !isClientSpecialPrice(
                        selectedService,
                      )
                        ? "Valor inicial"
                        : "Valor"}
                    </p>
                  </div>

                  {isClientSpecialPrice(
                    selectedService,
                  ) &&
                    selectedService
                      .priceCents !==
                      selectedService
                        .defaultPriceCents && (
                      <p className="mt-3 text-sm text-[#92978E] line-through">
                        {isStartingFromPrice(
                          selectedService,
                        )
                          ? `A partir de ${formatPrice(
                              selectedService
                                .defaultPriceCents,
                            )}`
                          : formatPrice(
                              selectedService
                                .defaultPriceCents,
                            )}
                      </p>
                    )}

                  {!isClientSpecialPrice(
                    selectedService,
                  ) &&
                  isStartingFromPrice(
                    selectedService,
                  ) ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#788273]">
                        A partir de
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#304229]">
                        {formatPrice(
                          selectedService
                            .priceCents,
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-2xl font-bold text-[#304229]">
                      {formatPrice(
                        selectedService
                          .priceCents,
                      )}
                    </p>
                  )}

                  {isClientSpecialPrice(
                    selectedService,
                  ) && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F5EBD2] px-2.5 py-1 text-xs font-semibold text-[#8A6A2F]">
                      <Tag className="size-3" />

                      Preço especial
                    </span>
                  )}

                  {!isClientSpecialPrice(
                    selectedService,
                  ) &&
                    isStartingFromPrice(
                      selectedService,
                    ) && (
                      <p className="mt-3 text-xs leading-5 text-[#71776D]">
                        O valor final pode variar conforme
                        a avaliação do serviço.
                      </p>
                    )}
                </div>
              </div>

              {submitError && (
                <div className="mx-5 mb-5 flex items-start gap-3 rounded-2xl border border-[#E8D4CF] bg-[#FFF8F6] p-4 text-[#984B3E] sm:mx-6 sm:mb-6">
                  <TriangleAlert className="mt-0.5 size-5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold">
                      Não foi possível
                      solicitar o horário
                    </p>

                    <p className="mt-1 text-sm leading-6">
                      {
                        submitError
                      }
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-[#EEEAE1] bg-[#FBF9F4] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-xs leading-5 text-[#71776D]">
                    Ao enviar, o horário
                    ficará como{" "}
                    <strong className="text-[#8A6A2F]">
                      aguardando confirmação
                    </strong>
                    . O salão ainda
                    precisará aprovar a
                    solicitação.
                  </p>

                  <Button
                    type="button"
                    disabled={
                      createMutation
                        .isPending
                    }
                    onClick={() =>
                      void handleSubmitAppointment()
                    }
                    className="min-h-11 shrink-0 bg-[#304229] px-6 text-white hover:bg-[#24351F]"
                  >
                    {createMutation
                      .isPending ? (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    ) : (
                      <CalendarCheck2 className="mr-2 size-4" />
                    )}

                    {createMutation
                      .isPending
                      ? "Enviando..."
                      : "Solicitar horário"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* AJUDA */}
      <section className="rounded-3xl border border-[#E5E0D5] bg-[#FBFAF7] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-[#8A6A2F]" />

          <div>
            <h3 className="text-sm font-semibold text-[#394035]">
              Como funciona?
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#71776D]">
              Depois que você solicitar,
              o salão receberá o
              agendamento para análise.
              Você poderá acompanhar a
              confirmação na área{" "}
              <Link
                href="/cliente/agendamentos"
                className="font-semibold text-[#304229] hover:underline"
              >
                Meus agendamentos

                <ArrowRight className="ml-1 inline size-3.5" />
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}