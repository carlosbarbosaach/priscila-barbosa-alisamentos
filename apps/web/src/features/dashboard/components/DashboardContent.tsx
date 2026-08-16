"use client";

import {
    CalendarDays,
    CircleCheckBig,
    CircleX,
    Clock3,
    RefreshCw,
} from "lucide-react";

import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { DashboardMetricCard } from "@/components/admin/dashboard/DashboardMetricCard";
import { PendingAppointments } from "@/components/admin/dashboard/PendingAppointments";
import { Button } from "@/components/ui/button";

import { useDashboard } from "../hooks/useDashboard";

export function DashboardContent() {
    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useDashboard();

    return (
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
            <DashboardHeader />

            {isLoading && (
                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[168px] animate-pulse rounded-2xl border border-[#E5DED1] bg-[#FFFDF8]"
                        />
                    ))}
                </section>
            )}

            {isError && (
                <section className="mt-8">
                    <div className="rounded-2xl border border-[#E5DED1] bg-[#FFFDF8] p-6 shadow-sm sm:p-8">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#F1EBDD]">
                            <RefreshCw className="size-5 text-[#465B36]" />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-[#20241D]">
                            Não foi possível carregar o dashboard
                        </h2>

                        <p className="mt-2 max-w-md text-sm leading-6 text-[#73776D]">
                            Verifique a conexão com a API ou tente carregar os dados novamente.
                        </p>

                        <Button
                            type="button"
                            className="mt-5 bg-[#304229] text-white hover:bg-[#24351F]"
                            onClick={() => void refetch()}
                        >
                            <RefreshCw className="mr-2 size-4" />
                            Tentar novamente
                        </Button>
                    </div>
                </section>
            )}

            {data && !isLoading && !isError && (
                <>
                    <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <DashboardMetricCard
                            title="Agendamentos hoje"
                            value={data.metrics.appointmentsToday}
                            description="Atendimentos previstos para hoje."
                            icon={CalendarDays}
                        />

                        <DashboardMetricCard
                            title="Aguardando confirmação"
                            value={data.metrics.pendingApproval}
                            description="Solicitações aguardando aprovação da equipe."
                            icon={Clock3}
                        />

                        <DashboardMetricCard
                            title="Confirmados"
                            value={data.metrics.confirmedToday}
                            description="Agendamentos confirmados para hoje."
                            icon={CircleCheckBig}
                        />

                        <DashboardMetricCard
                            title="Cancelados"
                            value={data.metrics.cancelledToday}
                            description="Agendamentos cancelados durante o dia."
                            icon={CircleX}
                        />
                    </section>

                    <section className="mt-6 sm:mt-8">
                        <PendingAppointments appointments={[]} />
                    </section>
                </>
            )}
        </main>
    );
}