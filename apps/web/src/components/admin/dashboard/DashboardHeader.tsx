import { CalendarDays } from "lucide-react";

type DashboardHeaderProps = {
    title?: string;
    description?: string;
};

export function DashboardHeader({
    title = "Visão geral",
    description = "Acompanhe os agendamentos e a rotina do salão.",
}: DashboardHeaderProps) {
    return (
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <span className="h-px w-6 bg-[#B69A65]" />

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#73776D]">
                        Dashboard
                    </p>
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#20241D] sm:text-3xl">
                    {title}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#73776D]">
                    {description}
                </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-xl border border-[#E5DED1] bg-[#FFFDF8] px-3 py-2 text-xs text-[#73776D] shadow-sm">
                <CalendarDays className="size-4 text-[#465B36]" />

                Agenda do salão
            </div>
        </header>
    );
}