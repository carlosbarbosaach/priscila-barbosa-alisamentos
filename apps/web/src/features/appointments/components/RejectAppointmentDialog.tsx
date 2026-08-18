"use client";

import type {
    Appointment,
} from "@priscila/shared";

import {
    CircleX,
    Clock3,
    LoaderCircle,
    Scissors,
    TriangleAlert,
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
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone:
                SALON_TIME_ZONE,
        },
    );

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
        useState("");

    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState<string | null>(
            null,
        );

    const rejectMutation =
        useRejectAppointment();

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
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
            rejectMutation.isPending
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
                });

            onOpenChange(
                false,
            );
        } catch (error) {
            const message =
                error instanceof Error
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
                                Informe para a cliente
                                o motivo da recusa.
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

                {/* DADOS */}
                <div className="px-5 py-5 sm:px-6">
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
                                5
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

                    {errorMessage && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#E8D4CF] bg-[#FFF8F6] p-4 text-[#984B3E]">
                            <TriangleAlert className="mt-0.5 size-4 shrink-0" />

                            <p className="text-sm leading-6">
                                {errorMessage}
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
                            : "Confirmar recusa"}
                    </Button>
                </div>
            </div>
        </div>
    );
}