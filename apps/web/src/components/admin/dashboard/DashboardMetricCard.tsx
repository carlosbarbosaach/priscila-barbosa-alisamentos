import type { LucideIcon } from "lucide-react";

type DashboardMetricCardProps = {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
};

export function DashboardMetricCard({
    title,
    value,
    description,
    icon: Icon,
}: DashboardMetricCardProps) {
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-[#E5DED1] bg-[#FFFDF8] p-5 shadow-[0_1px_2px_rgba(32,36,29,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(32,36,29,0.07)] sm:p-6">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[60px] bg-[#F1EBDD]/60" />

            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-[#73776D]">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-[#20241D] sm:text-4xl">
                        {value}
                    </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl bg-[#304229] text-white shadow-sm">
                    <Icon className="size-[18px]" />
                </div>
            </div>

            <p className="relative mt-4 text-xs leading-5 text-[#73776D]">
                {description}
            </p>

            <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#B69A65] transition-all duration-300 group-hover:w-full" />
        </article>
    );
}