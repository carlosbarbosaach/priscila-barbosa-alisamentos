import {
    CalendarDays,
    type LucideIcon,
} from "lucide-react";

import type {
    ReactNode,
} from "react";

type AdminPageHeaderProps = {
    eyebrow?: string;

    title: string;

    description: string;

    badgeLabel?: string;

    badgeIcon?: LucideIcon;

    rightContent?: ReactNode;
};

export function AdminPageHeader({
    eyebrow = "Administração",
    title,
    description,
    badgeLabel,
    badgeIcon: BadgeIcon = CalendarDays,
    rightContent,
}: AdminPageHeaderProps) {
    return (
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <span className="h-px w-6 bg-[#B69A65]" />

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#73776D]">
                        {eyebrow}
                    </p>
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#20241D] sm:text-3xl">
                    {title}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#73776D]">
                    {description}
                </p>
            </div>

            {rightContent ? (
                rightContent
            ) : badgeLabel ? (
                <div className="flex w-fit items-center gap-2 rounded-xl border border-[#E5DED1] bg-[#FFFDF8] px-3 py-2 text-xs text-[#73776D] shadow-sm">
                    <BadgeIcon className="size-4 text-[#465B36]" />

                    {badgeLabel}
                </div>
            ) : null}
        </header>
    );
}