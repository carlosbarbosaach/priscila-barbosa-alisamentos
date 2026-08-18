import type {
  DashboardPendingAppointment,
} from "@priscila/shared";

import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Scissors,
  UserRound,
  WalletCards,
} from "lucide-react";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PendingAppointmentsProps = {
  appointments:
  DashboardPendingAppointment[];

  timezone: string;
};

const currencyFormatter =
  new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );

function formatPrice(
  priceCents: number,
) {
  return currencyFormatter.format(
    priceCents / 100,
  );
}

function formatAppointmentDate(
  startsAt: string,
  timezone: string,
) {
  const date =
    new Date(
      startsAt,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone:
        timezone,
    },
  ).format(
    date,
  );
}

function formatAppointmentTime(
  startsAt: string,
  timezone: string,
) {
  const date =
    new Date(
      startsAt,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "--:--";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone:
        timezone,
    },
  ).format(
    date,
  );
}

function getDateKeyInTimeZone(
  date: Date,
  timezone: string,
) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone:
          timezone,
      },
    );

  const parts =
    formatter.formatToParts(
      date,
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
    return null;
  }

  return `${year}-${month}-${day}`;
}

function dateKeyToUtcTimestamp(
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

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return Date.UTC(
    year,
    month - 1,
    day,
  );
}

function getDaysUntilAppointment(
  startsAt: string,
  timezone: string,
) {
  const appointmentDate =
    new Date(
      startsAt,
    );

  if (
    Number.isNaN(
      appointmentDate.getTime(),
    )
  ) {
    return null;
  }

  const todayDateKey =
    getDateKeyInTimeZone(
      new Date(),
      timezone,
    );

  const appointmentDateKey =
    getDateKeyInTimeZone(
      appointmentDate,
      timezone,
    );

  if (
    !todayDateKey ||
    !appointmentDateKey
  ) {
    return null;
  }

  const todayTimestamp =
    dateKeyToUtcTimestamp(
      todayDateKey,
    );

  const appointmentTimestamp =
    dateKeyToUtcTimestamp(
      appointmentDateKey,
    );

  if (
    todayTimestamp === null ||
    appointmentTimestamp ===
    null
  ) {
    return null;
  }

  return Math.round(
    (
      appointmentTimestamp -
      todayTimestamp
    ) /
    86_400_000,
  );
}

function getUrgencyConfig(
  startsAt: string,
  timezone: string,
) {
  const days =
    getDaysUntilAppointment(
      startsAt,
      timezone,
    );

  if (
    days === null
  ) {
    return {
      label: "Pendente",

      className:
        "border-[#E9D8A6] bg-[#FFF8E7] text-[#8A6A2F]",
    };
  }

  if (days < 0) {
    return {
      label: "Atrasada",

      className:
        "border-[#E8CEC7] bg-[#FAECE8] text-[#984B3E]",
    };
  }

  if (days === 0) {
    return {
      label: "Hoje",

      className:
        "border-[#E7C879] bg-[#FFF4D8] text-[#7A5A1E]",
    };
  }

  if (days === 1) {
    return {
      label: "Amanhã",

      className:
        "border-[#E9D8A6] bg-[#FFF8E7] text-[#8A6A2F]",
    };
  }

  if (days <= 3) {
    return {
      label:
        `Em ${days} dias`,

      className:
        "border-[#D9DFC9] bg-[#F3F6ED] text-[#526543]",
    };
  }

  return {
    label: "Agendada",

    className:
      "border-[#DDD8D0] bg-[#F7F5F1] text-[#6D716A]",
  };
}

function getAgendaHref(
  startsAt: string,
  timezone: string,
) {
  const date =
    new Date(
      startsAt,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "/admin/agenda";
  }

  const dateKey =
    getDateKeyInTimeZone(
      date,
      timezone,
    );

  if (!dateKey) {
    return "/admin/agenda";
  }

  return `/admin/agenda?date=${encodeURIComponent(
    dateKey,
  )}`;
}

export function PendingAppointments({
  appointments,
  timezone,
}: PendingAppointmentsProps) {
  return (
    <Card className="overflow-hidden border-[#E5DED1] bg-[#FFFDF8] shadow-sm">
      {/* CABEÇALHO */}
      <CardHeader className="border-b border-[#EAE4D8] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-3 text-base text-[#20241D]">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#FFF4D8] text-[#8A6A2F]">
                <Clock3 className="size-[18px]" />
              </div>

              Solicitações pendentes
            </CardTitle>

            {appointments.length >
              0 && (
                <p className="mt-2 pl-[52px] text-xs leading-5 text-[#73776D]">
                  Ordenadas pela data de
                  atendimento mais próxima.
                </p>
              )}
          </div>

          {appointments.length >
            0 && (
              <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#8A6A2F] px-2.5 py-1 text-xs font-bold text-white">
                {appointments.length >
                  99
                  ? "99+"
                  : appointments.length}
              </span>
            )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {appointments.length ===
          0 ? (
          <div className="m-5 rounded-2xl border border-dashed border-[#D9D2C5] bg-[#FBF9F4] p-8 text-center sm:m-6">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#465B36]">
              <Clock3 className="size-5" />
            </div>

            <p className="mt-4 font-semibold text-[#20241D]">
              Nenhuma solicitação
              pendente
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#73776D]">
              Novos pedidos de
              agendamento que precisem
              de confirmação aparecerão
              aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE4D8]">
            {appointments.map(
              (
                appointment,
              ) => {
                const urgency =
                  getUrgencyConfig(
                    appointment
                      .startsAt,
                    timezone,
                  );

                const agendaHref =
                  getAgendaHref(
                    appointment
                      .startsAt,
                    timezone,
                  );

                return (
                  <article
                    key={
                      appointment.id
                    }
                    className="relative px-5 py-5 transition hover:bg-[#FBF9F4] sm:px-6"
                  >
                    {/* STATUS */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E9D8A6] bg-[#FFF8E7] px-3 py-1.5 text-xs font-semibold text-[#8A6A2F]">
                        <Clock3 className="size-3.5" />

                        Aguardando
                        confirmação
                      </span>

                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold",
                          urgency.className,
                        ].join(
                          " ",
                        )}
                      >
                        {
                          urgency.label
                        }
                      </span>
                    </div>

                    {/* INFORMAÇÕES */}
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-[1.4fr_1.4fr_1fr_0.7fr_0.8fr_44px] xl:items-center">
                      {/* CLIENTE */}
                      <div className="min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#465B36]">
                            <UserRound className="size-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8E84]">
                              Cliente
                            </p>

                            <p className="mt-1 truncate font-semibold text-[#20241D]">
                              {
                                appointment
                                  .clientName
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SERVIÇO */}
                      <div className="min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EFE4] text-[#8A6A2F]">
                            <Scissors className="size-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8E84]">
                              Serviço
                            </p>

                            <p className="mt-1 truncate font-semibold text-[#20241D]">
                              {
                                appointment
                                  .serviceName
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DATA */}
                      <div>
                        <div className="flex items-start gap-3">
                          <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#73776D]" />

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8E84]">
                              Data
                            </p>

                            <p className="mt-1 text-sm font-semibold capitalize text-[#20241D]">
                              {formatAppointmentDate(
                                appointment
                                  .startsAt,
                                timezone,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* HORÁRIO */}
                      <div>
                        <div className="flex items-start gap-3">
                          <Clock3 className="mt-0.5 size-4 shrink-0 text-[#73776D]" />

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8E84]">
                              Horário
                            </p>

                            <p className="mt-1 text-base font-bold text-[#304229]">
                              {formatAppointmentTime(
                                appointment
                                  .startsAt,
                                timezone,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* VALOR */}
                      <div>
                        <div className="flex items-start gap-3">
                          <WalletCards className="mt-0.5 size-4 shrink-0 text-[#73776D]" />

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8E84]">
                              Valor
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#304229]">
                              {formatPrice(
                                appointment
                                  .chargedPriceCents,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* ABRIR NA AGENDA */}
                      <div className="flex items-center justify-center sm:col-span-2 xl:col-span-1">
                        <Link
                          href={agendaHref}
                          title="Ver na agenda"
                          aria-label={`Ver ${appointment.clientName} na agenda`}
                          className="group inline-flex size-9 items-center justify-center rounded-xl border border-[#D9DED5] bg-[#F7F9F5] text-[#465B36] transition hover:border-[#304229] hover:bg-[#304229] hover:text-white"
                        >
                          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}