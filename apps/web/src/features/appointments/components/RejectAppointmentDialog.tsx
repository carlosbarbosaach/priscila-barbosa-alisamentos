"use client";

import type {
  Appointment,
} from "@priscila/shared";

import {
  CircleX,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  Scissors,
  TriangleAlert,
  UnlockKeyhole,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  useRejectAppointment,
} from "@/features/appointments/hooks/useRejectAppointment";

type RejectAppointmentDialogProps = {
  appointment:
    Appointment | null;

  onOpenChange: (
    open: boolean,
  ) => void;
};

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

export function RejectAppointmentDialog({
  appointment,
  onOpenChange,
}: RejectAppointmentDialogProps) {
  const [
    rejectionReason,
    setRejectionReason,
  ] =
    useState(
      "",
    );

  /*
   * IMPORTANTE:
   *
   * Por padrão o horário NÃO será
   * bloqueado.
   *
   * Recusar um Appointment continua
   * significando apenas:
   *
   * PENDING_APPROVAL
   * ↓
   * REJECTED
   *
   * e o horário volta a ficar disponível.
   */
  const [
    blockSlot,
    setBlockSlot,
  ] =
    useState(
      false,
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const rejectMutation =
    useRejectAppointment();

  /*
   * Sempre que abrirmos outro
   * Appointment, começamos o formulário
   * limpo e com:
   *
   * "Não, deixar disponível"
   *
   * selecionado novamente.
   */
  useEffect(() => {
    setRejectionReason(
      "",
    );

    setBlockSlot(
      false,
    );

    setErrorMessage(
      null,
    );
  }, [
    appointment?.id,
  ]);

  useEffect(() => {
    function handleKeyDown(
      event:
        KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
        !rejectMutation
          .isPending
      ) {
        onOpenChange(
          false,
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    onOpenChange,
    rejectMutation.isPending,
  ]);

  /*
   * Proteção extra.
   *
   * Mesmo que o componente seja
   * renderizado sem Appointment,
   * não tentamos acessar os dados.
   */
  if (!appointment) {
    return null;
  }

  const normalizedReason =
    rejectionReason.trim();

  const reasonIsValid =
    normalizedReason.length >=
      3 &&
    normalizedReason.length <=
      500;

  async function handleReject() {
    if (
      !appointment ||
      !reasonIsValid ||
      rejectMutation
        .isPending
    ) {
      return;
    }

    setErrorMessage(
      null,
    );

    try {
      await rejectMutation
        .mutateAsync({
          appointmentId:
            appointment.id,

          rejectionReason:
            normalizedReason,

          /*
           * false:
           * recusa e libera.
           *
           * true:
           * recusa e cria
           * ScheduleBlockout.
           */
          blockSlot,
        });

      onOpenChange(
        false,
      );
    } catch (
      error
    ) {
      const message =
        error instanceof
        Error
          ? error.message
          : "Não foi possível recusar o agendamento.";

      setErrorMessage(
        message,
      );
    }
  }

  function handleClose() {
    if (
      rejectMutation
        .isPending
    ) {
      return;
    }

    onOpenChange(
      false,
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-appointment-title"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#E5DED1] bg-[#FFFDF8] shadow-2xl">
        {/* CABEÇALHO */}
        <div className="flex items-start justify-between gap-4 border-b border-[#EAE4D8] px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FAECE8] text-[#984B3E]">
              <CircleX className="size-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#984B3E]">
                Atenção
              </p>

              <h2
                id="reject-appointment-title"
                className="mt-1 text-xl font-semibold text-[#20241D]"
              >
                Recusar agendamento
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#73776D]">
                Informe o motivo da recusa
                e defina o que acontecerá
                com este horário.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={
              rejectMutation
                .isPending
            }
            onClick={
              handleClose
            }
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[#73776D] transition hover:bg-[#F1EDE4] hover:text-[#20241D] disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="px-5 py-5 sm:px-6">
          {/* DADOS DO AGENDAMENTO */}
          <div className="rounded-2xl border border-[#E5DED1] bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-4 shrink-0 text-[#73776D]" />

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E84]">
                    Cliente
                  </p>

                  <p className="mt-1 break-words text-sm font-semibold text-[#20241D]">
                    {
                      appointment
                        .clientNameSnapshot
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-[#73776D]" />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E84]">
                    Horário
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#20241D]">
                    {formatTime(
                      appointment
                        .startsAt,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <Scissors className="mt-0.5 size-4 shrink-0 text-[#73776D]" />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#8A8E84]">
                    Serviço
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#20241D]">
                    {
                      appointment
                        .serviceNameSnapshot
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MOTIVO */}
          <div className="mt-5">
            <label
              htmlFor="rejectionReason"
              className="text-sm font-semibold text-[#20241D]"
            >
              Motivo da recusa
            </label>

            <p className="mt-1 text-xs leading-5 text-[#73776D]">
              A cliente verá esta
              mensagem em seus
              agendamentos.
            </p>

            <textarea
              id="rejectionReason"
              value={
                rejectionReason
              }
              maxLength={
                500
              }
              rows={
                4
              }
              disabled={
                rejectMutation
                  .isPending
              }
              onChange={(
                event,
              ) => {
                setRejectionReason(
                  event.target
                    .value,
                );

                if (
                  errorMessage
                ) {
                  setErrorMessage(
                    null,
                  );
                }
              }}
              placeholder="Ex.: Não teremos disponibilidade para este horário. Por favor, escolha uma nova data."
              className="mt-3 w-full resize-none rounded-xl border border-[#D9D2C5] bg-white px-4 py-3 text-sm leading-6 text-[#20241D] outline-none transition placeholder:text-[#A3A69F] focus:border-[#8A6A2F] focus:ring-2 focus:ring-[#8A6A2F]/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-2 flex items-center justify-between gap-4">
              <p
                className={[
                  "text-xs",
                  rejectionReason
                    .length >
                      0 &&
                  normalizedReason
                    .length <
                      3
                    ? "text-[#984B3E]"
                    : "text-[#8A8E84]",
                ].join(
                  " ",
                )}
              >
                Mínimo de 3 caracteres.
              </p>

              <span className="text-xs tabular-nums text-[#8A8E84]">
                {
                  rejectionReason
                    .length
                }
                /500
              </span>
            </div>
          </div>

          {/* BLOQUEIO DO HORÁRIO */}
          <div className="mt-6">
            <div>
              <p className="text-sm font-semibold text-[#20241D]">
                Bloquear este horário?
              </p>

              <p className="mt-1 text-xs leading-5 text-[#73776D]">
                Escolha se outras clientes
                poderão solicitar este mesmo
                horário depois da recusa.
              </p>
            </div>

            <div className="mt-3 grid gap-3">
              {/* NÃO BLOQUEAR */}
              <label
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                  !blockSlot
                    ? "border-[#718166] bg-[#F2F5EF] shadow-sm"
                    : "border-[#E2DDD3] bg-white hover:border-[#CBC4B8]",
                  rejectMutation
                    .isPending
                    ? "cursor-not-allowed opacity-60"
                    : "",
                ].join(
                  " ",
                )}
              >
                <input
                  type="radio"
                  name="blockSlot"
                  value="false"
                  checked={
                    !blockSlot
                  }
                  disabled={
                    rejectMutation
                      .isPending
                  }
                  onChange={() => {
                    setBlockSlot(
                      false,
                    );

                    if (
                      errorMessage
                    ) {
                      setErrorMessage(
                        null,
                      );
                    }
                  }}
                  className="mt-1 size-4 accent-[#304229]"
                />

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div
                    className={[
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      !blockSlot
                        ? "bg-white text-[#304229]"
                        : "bg-[#F5F3EE] text-[#73776D]",
                    ].join(
                      " ",
                    )}
                  >
                    <UnlockKeyhole className="size-4" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[#20241D]">
                        Não, deixar disponível
                      </p>

                      {!blockSlot && (
                        <span className="rounded-full bg-[#DDE7D7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#304229]">
                          Padrão
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#73776D]">
                      O agendamento será
                      recusado e este horário
                      poderá ser escolhido
                      novamente por outra
                      cliente.
                    </p>
                  </div>
                </div>
              </label>

              {/* BLOQUEAR */}
              <label
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                  blockSlot
                    ? "border-[#B6864D] bg-[#FFF8ED] shadow-sm"
                    : "border-[#E2DDD3] bg-white hover:border-[#CBC4B8]",
                  rejectMutation
                    .isPending
                    ? "cursor-not-allowed opacity-60"
                    : "",
                ].join(
                  " ",
                )}
              >
                <input
                  type="radio"
                  name="blockSlot"
                  value="true"
                  checked={
                    blockSlot
                  }
                  disabled={
                    rejectMutation
                      .isPending
                  }
                  onChange={() => {
                    setBlockSlot(
                      true,
                    );

                    if (
                      errorMessage
                    ) {
                      setErrorMessage(
                        null,
                      );
                    }
                  }}
                  className="mt-1 size-4 accent-[#8A6A2F]"
                />

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div
                    className={[
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      blockSlot
                        ? "bg-white text-[#8A6A2F]"
                        : "bg-[#F5F3EE] text-[#73776D]",
                    ].join(
                      " ",
                    )}
                  >
                    <LockKeyhole className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#20241D]">
                      Sim, bloquear horário
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#73776D]">
                      O agendamento será
                      recusado e este horário
                      ficará indisponível para
                      novas solicitações.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {blockSlot && (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#E8D5B9] bg-[#FFF9EF] p-3.5 text-[#795A2A]">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />

                <p className="text-xs leading-5">
                  A cliente não verá que o
                  horário foi bloqueado
                  administrativamente. Para
                  ela, aparecerá somente a
                  recusa e o motivo informado.
                </p>
              </div>
            )}
          </div>

          {/* ERRO */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#E8D4CF] bg-[#FFF8F6] p-4 text-[#984B3E]">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />

              <p className="text-sm leading-6">
                {
                  errorMessage
                }
              </p>
            </div>
          )}
        </div>

        {/* BOTÕES */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#EAE4D8] bg-[#FBF9F4] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            disabled={
              rejectMutation
                .isPending
            }
            onClick={
              handleClose
            }
          >
            Voltar
          </Button>

          <Button
            type="button"
            disabled={
              !reasonIsValid ||
              rejectMutation
                .isPending
            }
            onClick={() =>
              void handleReject()
            }
            className="bg-[#984B3E] text-white hover:bg-[#813E34]"
          >
            {rejectMutation
              .isPending ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <CircleX className="mr-2 size-4" />
            )}

            {rejectMutation
              .isPending
              ? "Recusando..."
              : blockSlot
                ? "Recusar e bloquear"
                : "Confirmar recusa"}
          </Button>
        </div>
      </div>
    </div>
  );
}