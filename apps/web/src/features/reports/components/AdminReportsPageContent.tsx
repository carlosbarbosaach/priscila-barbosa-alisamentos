"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    RefreshCw,
    Scissors,
    TrendingUp,
    WalletCards,
    XCircle,
} from "lucide-react";

import {
    AdminPageHeader,
} from "@/components/admin/AdminPageHeader";

import {
    Button,
} from "@/components/ui/button";

import {
    useAdminReport,
} from "../hooks/useAdminReport";

function formatPrice(
    priceInCents: number,
) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL",
        },
    ).format(
        priceInCents / 100,
    );
}

function toDateKey(
    date: Date,
) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const day =
        String(
            date.getDate(),
        ).padStart(
            2,
            "0",
        );

    return `${year}-${month}-${day}`;
}

function getToday() {
    return toDateKey(
        new Date(),
    );
}

function getDaysAgo(
    days: number,
) {
    const date =
        new Date();

    date.setDate(
        date.getDate() -
        days,
    );

    return toDateKey(
        date,
    );
}

type PeriodPreset =
    | "today"
    | "7days"
    | "30days";

export function AdminReportsPageContent() {
    const [
        startDate,
        setStartDate,
    ] = useState(
        () =>
            getDaysAgo(
                29,
            ),
    );

    const [
        endDate,
        setEndDate,
    ] = useState(
        () =>
            getToday(),
    );

    const [
        activePreset,
        setActivePreset,
    ] =
        useState<PeriodPreset>(
            "30days",
        );

    const {
        data,
        isLoading,
        isError,
        refetch,
    } =
        useAdminReport({
            startDate,

            endDate,
        });

    function setPeriod(
        preset:
            PeriodPreset,
    ) {
        setActivePreset(
            preset,
        );

        if (
            preset ===
            "today"
        ) {
            const today =
                getToday();

            setStartDate(
                today,
            );

            setEndDate(
                today,
            );

            return;
        }

        if (
            preset ===
            "7days"
        ) {
            setStartDate(
                getDaysAgo(
                    6,
                ),
            );

            setEndDate(
                getToday(),
            );

            return;
        }

        setStartDate(
            getDaysAgo(
                29,
            ),
        );

        setEndDate(
            getToday(),
        );
    }

    const cancelledOrRejected =
        useMemo(
            () =>
                (data?.metrics
                    .cancelled ??
                    0) +
                (data?.metrics
                    .rejected ??
                    0),
            [
                data,
            ],
        );

    const statusItems =
        data
            ? [
                {
                    label:
                        "Concluídos",

                    value:
                        data.metrics
                            .completed,

                    icon:
                        CheckCircle2,
                },

                {
                    label:
                        "Confirmados",

                    value:
                        data.metrics
                            .confirmed,

                    icon:
                        CalendarDays,
                },

                {
                    label:
                        "Em andamento",

                    value:
                        data.metrics
                            .inProgress,

                    icon:
                        Scissors,
                },

                {
                    label:
                        "Aguardando confirmação",

                    value:
                        data.metrics
                            .pendingApproval,

                    icon:
                        Clock3,
                },

                {
                    label:
                        "Cancelados",

                    value:
                        data.metrics
                            .cancelled,

                    icon:
                        XCircle,
                },

                {
                    label:
                        "Recusados",

                    value:
                        data.metrics
                            .rejected,

                    icon:
                        XCircle,
                },
            ]
            : [];

    const maxStatusValue =
        Math.max(
            1,
            ...statusItems.map(
                (item) =>
                    item.value,
            ),
        );

    return (
        <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
            {/* CABEÇALHO */}
            <AdminPageHeader
                eyebrow="Administração"
                title="Relatórios"
                description="Acompanhe os agendamentos, atendimentos e a receita realizada pelo salão."
                badgeLabel="Desempenho do salão"
                badgeIcon={TrendingUp}
            />

            {/* PERÍODO */}
            <section className="mt-7 rounded-2xl border border-[#E3E7E0] bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[#2D352A]">
                            Período
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    activePreset ===
                                        "today"
                                        ? "default"
                                        : "outline"
                                }
                                className={
                                    activePreset ===
                                        "today"
                                        ? "bg-[#304229] hover:bg-[#263620]"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriod(
                                        "today",
                                    )
                                }
                            >
                                Hoje
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    activePreset ===
                                        "7days"
                                        ? "default"
                                        : "outline"
                                }
                                className={
                                    activePreset ===
                                        "7days"
                                        ? "bg-[#304229] hover:bg-[#263620]"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriod(
                                        "7days",
                                    )
                                }
                            >
                                7 dias
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    activePreset ===
                                        "30days"
                                        ? "default"
                                        : "outline"
                                }
                                className={
                                    activePreset ===
                                        "30days"
                                        ? "bg-[#304229] hover:bg-[#263620]"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriod(
                                        "30days",
                                    )
                                }
                            >
                                30 dias
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Data inicial
                            </span>

                            <input
                                type="date"
                                value={
                                    startDate
                                }
                                max={
                                    endDate
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setStartDate(
                                        event
                                            .target
                                            .value,
                                    );

                                    setActivePreset(
                                        "30days",
                                    );
                                }}
                                className="h-10 rounded-xl border border-[#DDE2DA] bg-white px-3 text-sm outline-none transition focus:border-[#304229]"
                            />
                        </label>

                        <label className="grid gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Data final
                            </span>

                            <input
                                type="date"
                                value={
                                    endDate
                                }
                                min={
                                    startDate
                                }
                                onChange={(
                                    event,
                                ) => {
                                    setEndDate(
                                        event
                                            .target
                                            .value,
                                    );

                                    setActivePreset(
                                        "30days",
                                    );
                                }}
                                className="h-10 rounded-xl border border-[#DDE2DA] bg-white px-3 text-sm outline-none transition focus:border-[#304229]"
                            />
                        </label>
                    </div>
                </div>
            </section>

            {/* LOADING */}
            {isLoading && (
                <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map(
                        (item) => (
                            <div
                                key={item}
                                className="h-[125px] animate-pulse rounded-2xl border bg-white"
                            />
                        ),
                    )}
                </section>
            )}

            {/* ERRO */}
            {isError && (
                <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        Não foi possível
                        carregar o
                        relatório.
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

            {data &&
                !isLoading &&
                !isError && (
                    <>
                        {/* MÉTRICAS */}
                        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard
                                label="Agendamentos"
                                value={
                                    data.metrics
                                        .totalAppointments
                                }
                                description="No período selecionado"
                                icon={
                                    CalendarDays
                                }
                            />

                            <MetricCard
                                label="Concluídos"
                                value={
                                    data.metrics
                                        .completed
                                }
                                description="Atendimentos finalizados"
                                icon={
                                    CheckCircle2
                                }
                            />

                            <MetricCard
                                label="Cancelados / recusados"
                                value={
                                    cancelledOrRejected
                                }
                                description={`${data.metrics.cancelled} cancelados • ${data.metrics.rejected} recusados`}
                                icon={
                                    XCircle
                                }
                            />

                            <MetricCard
                                label="Receita realizada"
                                value={formatPrice(
                                    data.metrics
                                        .revenueCents,
                                )}
                                description="Somente atendimentos concluídos"
                                icon={
                                    WalletCards
                                }
                                highlighted
                            />
                        </section>

                        {/* DETALHES */}
                        <section className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                            {/* SERVIÇOS */}
                            <div className="rounded-2xl border border-[#E3E7E0] bg-white p-5 shadow-sm">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#90968C]">
                                        Desempenho
                                    </p>

                                    <h2 className="mt-1 text-lg font-semibold text-[#293027]">
                                        Serviços mais
                                        agendados
                                    </h2>
                                </div>

                                {data.services
                                    .length ===
                                    0 ? (
                                    <div className="py-10 text-center">
                                        <Scissors className="mx-auto size-7 text-[#A4AAA0]" />

                                        <p className="mt-3 text-sm text-muted-foreground">
                                            Nenhum
                                            agendamento
                                            encontrado neste
                                            período.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-5 space-y-2">
                                        {data.services.map(
                                            (
                                                service,
                                                index,
                                            ) => (
                                                <div
                                                    key={
                                                        service.serviceId
                                                    }
                                                    className="flex flex-col gap-3 rounded-xl border border-[#EBEEE8] bg-[#FBFCFA] p-4 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF2EB] text-xs font-bold text-[#53644A]">
                                                            {index +
                                                                1}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-[#293027]">
                                                                {
                                                                    service.serviceName
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {
                                                                    service.completed
                                                                }{" "}
                                                                concluídos
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-5 sm:text-right">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">
                                                                Agendamentos
                                                            </p>

                                                            <p className="text-sm font-semibold">
                                                                {
                                                                    service.appointments
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="min-w-[90px]">
                                                            <p className="text-xs text-muted-foreground">
                                                                Receita
                                                            </p>

                                                            <p className="text-sm font-semibold text-[#304229]">
                                                                {formatPrice(
                                                                    service.revenueCents,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* STATUS */}
                            <div className="rounded-2xl border border-[#E3E7E0] bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#90968C]">
                                    Visão geral
                                </p>

                                <h2 className="mt-1 text-lg font-semibold text-[#293027]">
                                    Status dos
                                    agendamentos
                                </h2>

                                <div className="mt-5 space-y-5">
                                    {statusItems.map(
                                        (item) => {
                                            const Icon =
                                                item.icon;

                                            const percentage =
                                                Math.round(
                                                    (item.value /
                                                        maxStatusValue) *
                                                    100,
                                                );

                                            return (
                                                <div
                                                    key={
                                                        item.label
                                                    }
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="size-4 text-[#667260]" />

                                                            <span className="text-sm text-[#4C5348]">
                                                                {
                                                                    item.label
                                                                }
                                                            </span>
                                                        </div>

                                                        <span className="text-sm font-bold text-[#293027]">
                                                            {
                                                                item.value
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EDF0EB]">
                                                        <div
                                                            className="h-full rounded-full bg-[#667A59] transition-all"
                                                            style={{
                                                                width:
                                                                    `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </section>
                    </>
                )}
        </main>
    );
}

type MetricCardProps = {
    label: string;

    value:
    string | number;

    description: string;

    icon:
    typeof CalendarDays;

    highlighted?:
    boolean;
};

function MetricCard({
    label,
    value,
    description,
    icon: Icon,
    highlighted = false,
}: MetricCardProps) {
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
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-[#293027]">
                        {value}
                    </p>
                </div>

                <div className="flex size-9 items-center justify-center rounded-xl bg-[#EEF2EB] text-[#53644A]">
                    <Icon className="size-4" />
                </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
                {description}
            </p>
        </article>
    );
}