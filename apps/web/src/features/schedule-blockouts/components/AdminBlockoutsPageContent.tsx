"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    LockKeyhole,
    Plus,
    RefreshCw,
    ShieldCheck,
    TriangleAlert,
    UnlockKeyhole,
} from "lucide-react";

import {
    AdminPageHeader,
} from "@/components/admin/AdminPageHeader";

import {
    Button,
} from "@/components/ui/button";

import {
    useAdminScheduleBlockouts,
} from "../hooks/useAdminScheduleBlockouts";

import {
    useCreateScheduleBlockout,
} from "../hooks/useCreateScheduleBlockout";

import {
    useReleaseScheduleBlockout,
} from "../hooks/useReleaseScheduleBlockout";

const SALON_TIME_ZONE =
    "America/Sao_Paulo";

/*
 * =================================
 * HORÁRIOS OFICIAIS
 * =================================
 *
 * O backend continua sendo
 * a fonte oficial.
 *
 * Aqui usamos os horários somente
 * para montar a experiência do ADMIN.
 *
 * 0 = domingo
 * 1 = segunda
 * ...
 * 6 = sábado
 */
const START_TIMES_BY_WEEK_DAY:
    readonly (
        readonly string[]
    )[] = [
        [],

        [
            "08:00",
            "13:00",
            "17:00",
        ],

        [
            "08:00",
            "13:00",
            "17:00",
        ],

        [
            "08:00",
            "13:00",
            "17:00",
        ],

        [
            "08:00",
            "13:00",
            "17:00",
        ],

        [
            "08:00",
            "13:00",
            "17:00",
        ],

        [
            "07:00",
            "08:00",
            "13:00",
            "17:00",
        ],
    ];

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
        formatter.formatToParts(
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

function parseDateKey(
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
        return null;
    }

    return new Date(
        Date.UTC(
            year,
            month - 1,
            day,
            12,
            0,
            0,
        ),
    );
}

function formatDateKey(
    dateKey:
        string,
) {
    const date =
        parseDateKey(
            dateKey,
        );

    if (!date) {
        return dateKey;
    }

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
        formatted.slice(
            1,
        )
    );
}

function getConfiguredStartTimes(
    dateKey:
        string,
): readonly string[] {
    const date =
        parseDateKey(
            dateKey,
        );

    if (!date) {
        return [];
    }

    const weekDay =
        date.getUTCDay();

    return (
        START_TIMES_BY_WEEK_DAY[
        weekDay
        ] ??
        []
    );
}

export function AdminBlockoutsPageContent() {
    const today =
        getTodayDateKey();

    const [
        selectedDate,
        setSelectedDate,
    ] =
        useState(
            today,
        );

    const [
        showCreateForm,
        setShowCreateForm,
    ] =
        useState(
            false,
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
        reason,
        setReason,
    ] =
        useState(
            "",
        );

    const [
        createError,
        setCreateError,
    ] =
        useState<
            string | null
        >(
            null,
        );

    const [
        releaseError,
        setReleaseError,
    ] =
        useState<
            string | null
        >(
            null,
        );

    const {
        data:
        blockouts = [],

        isLoading,

        isFetching,

        isError,

        refetch,
    } =
        useAdminScheduleBlockouts({
            dateKey:
                selectedDate,
        });

    const createMutation =
        useCreateScheduleBlockout();

    const releaseMutation =
        useReleaseScheduleBlockout();

    /*
     * =================================
     * HORÁRIOS
     * =================================
     */

    const configuredStartTimes =
        useMemo(
            () =>
                getConfiguredStartTimes(
                    selectedDate,
                ),
            [
                selectedDate,
            ],
        );

    const blockedStartTimes =
        useMemo(
            () =>
                new Set(
                    blockouts.map(
                        (
                            blockout,
                        ) =>
                            blockout.startTime,
                    ),
                ),
            [
                blockouts,
            ],
        );

    const selectableStartTimes =
        configuredStartTimes.filter(
            (
                startTime,
            ) =>
                !blockedStartTimes.has(
                    startTime,
                ),
        );

    const availableStartTimesCount =
        Math.max(
            0,
            configuredStartTimes.length -
            blockouts.length,
        );

    /*
     * =================================
     * FORMULÁRIO
     * =================================
     */

    const normalizedReason =
        reason.trim();

    const reasonIsValid =
        normalizedReason.length >=
        3 &&
        normalizedReason.length <=
        500;

    const canCreate =
        Boolean(
            selectedStartTime,
        ) &&
        reasonIsValid &&
        !createMutation.isPending;

    function resetCreateForm() {
        setSelectedStartTime(
            null,
        );

        setReason(
            "",
        );

        setCreateError(
            null,
        );

        setShowCreateForm(
            false,
        );
    }

    function handleDateChange(
        dateKey:
            string,
    ) {
        setSelectedDate(
            dateKey,
        );

        setSelectedStartTime(
            null,
        );

        setReason(
            "",
        );

        setCreateError(
            null,
        );

        setReleaseError(
            null,
        );
    }

    async function handleCreate() {
        if (
            !selectedStartTime ||
            !reasonIsValid ||
            createMutation.isPending
        ) {
            return;
        }

        setCreateError(
            null,
        );

        try {
            await createMutation
                .mutateAsync({
                    dateKey:
                        selectedDate,

                    startTime:
                        selectedStartTime,

                    reason:
                        normalizedReason,
                });

            resetCreateForm();
        } catch (
        error
        ) {
            setCreateError(
                error instanceof
                    Error
                    ? error.message
                    : "Não foi possível bloquear este horário.",
            );
        }
    }

    async function handleRelease(
        startTime:
            string,
    ) {
        if (
            releaseMutation
                .isPending
        ) {
            return;
        }

        setReleaseError(
            null,
        );

        try {
            await releaseMutation
                .mutateAsync({
                    dateKey:
                        selectedDate,

                    startTime,
                });
        } catch (
        error
        ) {
            setReleaseError(
                error instanceof
                    Error
                    ? error.message
                    : "Não foi possível liberar este horário.",
            );
        }
    }

    return (
        <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
            {/* ================================= */}
            {/* CABEÇALHO */}
            {/* ================================= */}

            <AdminPageHeader
                eyebrow="Administração"
                title="Bloqueios"
                description="Gerencie horários que não devem ficar disponíveis para novas solicitações das clientes."
                badgeLabel="Controle de horários"
                badgeIcon={LockKeyhole}
            />

            {/* ================================= */}
            {/* CONTROLE DA AGENDA */}
            {/* ================================= */}

            <section className="mt-7 rounded-2xl border border-[#E3E7E0] bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[#2D352A]">
                            Data da agenda
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Escolha uma
                            data para
                            consultar ou
                            criar bloqueios.
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[#53644A]">
                            <CalendarDays className="size-4" />

                            {formatDateKey(
                                selectedDate,
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <label className="grid gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Data
                            </span>

                            <input
                                type="date"
                                value={
                                    selectedDate
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
                                className="h-10 min-w-[190px] rounded-xl border border-[#DDE2DA] bg-white px-3 text-sm outline-none transition focus:border-[#304229]"
                            />
                        </label>

                        <Button
                            type="button"
                            className="h-10 bg-[#304229] hover:bg-[#263620]"
                            onClick={() => {
                                setShowCreateForm(
                                    (
                                        current,
                                    ) =>
                                        !current,
                                );

                                setCreateError(
                                    null,
                                );
                            }}
                        >
                            <Plus className="mr-2 size-4" />

                            Bloquear horário
                        </Button>
                    </div>
                </div>
            </section>

            {/* ================================= */}
            {/* MÉTRICAS */}
            {/* ================================= */}

            <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <BlockoutMetricCard
                    label="Bloqueados"
                    value={
                        blockouts.length
                    }
                    description="Horários bloqueados nesta data"
                    icon={
                        LockKeyhole
                    }
                    highlighted
                />

                <BlockoutMetricCard
                    label="Disponíveis"
                    value={
                        availableStartTimesCount
                    }
                    description="Horários sem bloqueio administrativo"
                    icon={
                        CheckCircle2
                    }
                />

                <BlockoutMetricCard
                    label="Horários configurados"
                    value={
                        configuredStartTimes.length
                    }
                    description="Quantidade total de horários no dia"
                    icon={
                        Clock3
                    }
                />
            </section>

            {/* ================================= */}
            {/* NOVO BLOQUEIO */}
            {/* ================================= */}

            {showCreateForm && (
                <section className="mt-5 overflow-hidden rounded-2xl border border-[#E3E7E0] bg-white shadow-sm">
                    <div className="border-b border-[#EBEEE8] p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#EEF2EB] text-[#53644A]">
                                <LockKeyhole className="size-4" />
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#90968C]">
                                    Novo bloqueio
                                </p>

                                <h2 className="mt-1 text-lg font-semibold text-[#293027]">
                                    Bloquear horário
                                </h2>
                            </div>
                        </div>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                            O horário
                            selecionado
                            deixará de
                            aparecer para
                            novas
                            solicitações
                            das clientes.
                        </p>
                    </div>

                    <div className="p-5">
                        {/* HORÁRIO */}

                        <div>
                            <p className="text-sm font-semibold text-[#2D352A]">
                                Horário
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Escolha um
                                dos horários
                                configurados
                                para esta
                                data.
                            </p>

                            {configuredStartTimes.length ===
                                0 ? (
                                <div className="mt-4 rounded-xl border border-[#EBEEE8] bg-[#FBFCFA] p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Não existem
                                        horários
                                        configurados
                                        para esta
                                        data.
                                    </p>
                                </div>
                            ) : selectableStartTimes.length ===
                                0 ? (
                                <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#DCE5D7] bg-[#F4F7F1] p-4">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#53644A]" />

                                    <div>
                                        <p className="text-sm font-semibold text-[#293027]">
                                            Todos os
                                            horários
                                            estão
                                            bloqueados
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Libere
                                            algum
                                            horário
                                            para
                                            utilizá-lo
                                            novamente.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {selectableStartTimes.map(
                                        (
                                            startTime,
                                        ) => {
                                            const selected =
                                                selectedStartTime ===
                                                startTime;

                                            return (
                                                <button
                                                    key={
                                                        startTime
                                                    }
                                                    type="button"
                                                    disabled={
                                                        createMutation
                                                            .isPending
                                                    }
                                                    onClick={() => {
                                                        setSelectedStartTime(
                                                            startTime,
                                                        );

                                                        setCreateError(
                                                            null,
                                                        );
                                                    }}
                                                    className={[
                                                        "h-11 rounded-xl border px-4 text-sm font-semibold transition",

                                                        selected
                                                            ? "border-[#304229] bg-[#304229] text-white"
                                                            : "border-[#DDE2DA] bg-white text-[#4C5348] hover:border-[#304229] hover:bg-[#F7F9F5]",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {
                                                        startTime
                                                    }
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>

                        {/* MOTIVO */}

                        <div className="mt-6">
                            <label
                                htmlFor="blockoutReason"
                                className="text-sm font-semibold text-[#2D352A]"
                            >
                                Motivo do
                                bloqueio
                            </label>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Informação
                                interna do
                                salão. A
                                cliente não
                                verá este
                                motivo.
                            </p>

                            <textarea
                                id="blockoutReason"
                                value={
                                    reason
                                }
                                rows={
                                    4
                                }
                                maxLength={
                                    500
                                }
                                disabled={
                                    createMutation
                                        .isPending
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setReason(
                                        event
                                            .target
                                            .value,
                                    );

                                    setCreateError(
                                        null,
                                    );
                                }}
                                placeholder="Ex.: Compromisso pessoal."
                                className="mt-3 w-full resize-none rounded-xl border border-[#DDE2DA] bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-[#304229]"
                            />

                            <div className="mt-2 flex items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground">
                                    Mínimo de
                                    3 caracteres.
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {
                                        reason.length
                                    }
                                    /500
                                </p>
                            </div>
                        </div>

                        {createError && (
                            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />

                                <p className="text-sm text-red-700">
                                    {
                                        createError
                                    }
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    createMutation
                                        .isPending
                                }
                                onClick={
                                    resetCreateForm
                                }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="button"
                                disabled={
                                    !canCreate
                                }
                                className="bg-[#304229] hover:bg-[#263620]"
                                onClick={() =>
                                    void handleCreate()
                                }
                            >
                                {createMutation
                                    .isPending ? (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <LockKeyhole className="mr-2 size-4" />
                                )}

                                {createMutation
                                    .isPending
                                    ? "Bloqueando..."
                                    : "Bloquear horário"}
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* ================================= */}
            {/* LOADING */}
            {/* ================================= */}

            {isLoading && (
                <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map(
                        (
                            item,
                        ) => (
                            <div
                                key={
                                    item
                                }
                                className="h-[210px] animate-pulse rounded-2xl border bg-white"
                            />
                        ),
                    )}
                </section>
            )}

            {/* ================================= */}
            {/* ERRO */}
            {/* ================================= */}

            {isError && (
                <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        Não foi possível
                        carregar os
                        horários
                        bloqueados.
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() =>
                            void refetch()
                        }
                    >
                        <RefreshCw className="mr-2 size-4" />

                        Tentar novamente
                    </Button>
                </section>
            )}

            {/* ================================= */}
            {/* LISTA */}
            {/* ================================= */}

            {!isLoading &&
                !isError && (
                    <section className="mt-5 rounded-2xl border border-[#E3E7E0] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#90968C]">
                                    Agenda
                                </p>

                                <h2 className="mt-1 text-lg font-semibold text-[#293027]">
                                    Horários
                                    bloqueados
                                </h2>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {formatDateKey(
                                        selectedDate,
                                    )}
                                </p>
                            </div>

                            <Button
                                type="button"
                                size="sm"
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

                                Atualizar
                            </Button>
                        </div>

                        {blockouts.length ===
                            0 ? (
                            <div className="py-12 text-center">
                                <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[#EEF2EB] text-[#53644A]">
                                    <ShieldCheck className="size-5" />
                                </div>

                                <p className="mt-4 text-sm font-semibold text-[#293027]">
                                    Nenhum
                                    horário
                                    bloqueado
                                </p>

                                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                                    Todos os
                                    horários
                                    configurados
                                    desta data
                                    estão livres
                                    de bloqueios
                                    administrativos.
                                </p>

                                <Button
                                    type="button"
                                    size="sm"
                                    className="mt-4 bg-[#304229] hover:bg-[#263620]"
                                    onClick={() =>
                                        setShowCreateForm(
                                            true,
                                        )
                                    }
                                >
                                    <Plus className="mr-2 size-4" />

                                    Bloquear horário
                                </Button>
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-3 xl:grid-cols-2">
                                {blockouts.map(
                                    (
                                        blockout,
                                    ) => {
                                        const releasing =
                                            releaseMutation
                                                .isPending &&
                                            releaseMutation
                                                .variables
                                                ?.dateKey ===
                                            blockout.dateKey &&
                                            releaseMutation
                                                .variables
                                                ?.startTime ===
                                            blockout.startTime;

                                        return (
                                            <article
                                                key={
                                                    blockout.id
                                                }
                                                className="rounded-xl border border-[#EBEEE8] bg-[#FBFCFA] p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2EB] text-[#53644A]">
                                                            <LockKeyhole className="size-4" />
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Horário
                                                                bloqueado
                                                            </p>

                                                            <p className="mt-1 text-xl font-bold text-[#293027]">
                                                                {
                                                                    blockout.startTime
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span className="rounded-full border border-[#DCE5D7] bg-[#F4F7F1] px-2.5 py-1 text-[10px] font-semibold text-[#53644A]">
                                                        Bloqueado
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                    <div className="rounded-xl border border-[#EBEEE8] bg-white p-3">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="size-3.5 text-[#667260]" />

                                                            <p className="text-xs text-muted-foreground">
                                                                Data
                                                            </p>
                                                        </div>

                                                        <p className="mt-2 text-sm font-medium text-[#4C5348]">
                                                            {formatDateKey(
                                                                blockout.dateKey,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-xl border border-[#EBEEE8] bg-white p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Clock3 className="size-3.5 text-[#667260]" />

                                                            <p className="text-xs text-muted-foreground">
                                                                Horário
                                                            </p>
                                                        </div>

                                                        <p className="mt-2 text-sm font-medium text-[#4C5348]">
                                                            {
                                                                blockout.startTime
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 rounded-xl border border-[#EBEEE8] bg-white p-3">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Motivo
                                                    </p>

                                                    <p className="mt-2 text-sm leading-6 text-[#4C5348]">
                                                        {blockout.reason ??
                                                            "Nenhum motivo informado."}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <ShieldCheck className="size-4 text-[#667260]" />

                                                        Indisponível
                                                        para novas
                                                        solicitações
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={
                                                            releaseMutation
                                                                .isPending
                                                        }
                                                        onClick={() =>
                                                            void handleRelease(
                                                                blockout.startTime,
                                                            )
                                                        }
                                                    >
                                                        {releasing ? (
                                                            <LoaderCircle className="mr-2 size-4 animate-spin" />
                                                        ) : (
                                                            <UnlockKeyhole className="mr-2 size-4" />
                                                        )}

                                                        {releasing
                                                            ? "Liberando..."
                                                            : "Liberar horário"}
                                                    </Button>
                                                </div>
                                            </article>
                                        );
                                    },
                                )}
                            </div>
                        )}

                        {releaseError && (
                            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-700" />

                                <p className="text-sm text-red-700">
                                    {
                                        releaseError
                                    }
                                </p>
                            </div>
                        )}
                    </section>
                )}
        </main>
    );
}

type BlockoutMetricCardProps = {
    label:
    string;

    value:
    string | number;

    description:
    string;

    icon:
    typeof LockKeyhole;

    highlighted?:
    boolean;
};

function BlockoutMetricCard({
    label,
    value,
    description,
    icon:
    Icon,
    highlighted = false,
}: BlockoutMetricCardProps) {
    return (
        <article
            className={
                highlighted
                    ? "rounded-2xl border border-[#DCE5D7] bg-[#F4F7F1] p-4 shadow-sm"
                    : "rounded-2xl border border-[#E3E7E0] bg-white p-4 shadow-sm"
            }
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        {
                            label
                        }
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-[#293027]">
                        {
                            value
                        }
                    </p>
                </div>

                <div className="flex size-9 items-center justify-center rounded-xl bg-[#EEF2EB] text-[#53644A]">
                    <Icon className="size-4" />
                </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
                {
                    description
                }
            </p>
        </article>
    );
}