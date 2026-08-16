"use client";

import {
    BadgeDollarSign,
    BarChart3,
    CalendarDays,
    CalendarX2,
    LayoutDashboard,
    Scissors,
    Settings,
    UserRound,
    Users,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigation = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Agenda",
        href: "/admin/agenda",
        icon: CalendarDays,
    },
    {
        label: "Clientes",
        href: "/admin/clientes",
        icon: Users,
    },
    {
        label: "Profissionais",
        href: "/admin/profissionais",
        icon: UserRound,
    },
    {
        label: "Serviços",
        href: "/admin/servicos",
        icon: Scissors,
    },
    {
        label: "Preços especiais",
        href: "/admin/precos-especiais",
        icon: BadgeDollarSign,
    },
    {
        label: "Bloqueios",
        href: "/admin/bloqueios",
        icon: CalendarX2,
    },
    {
        label: "Relatórios",
        href: "/admin/relatorios",
        icon: BarChart3,
    },
    {
        label: "Configurações",
        href: "/admin/configuracoes",
        icon: Settings,
    },
];

type AdminSidebarProps = {
    onNavigate?: () => void;
};

export function AdminSidebar({
    onNavigate,
}: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="flex h-full flex-col bg-[#24351F] text-white">
            <div className="border-b border-white/10 px-6 py-7">
                <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#B69A65] text-sm font-bold text-[#182116] shadow-sm">
                        PB
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
                            Administração
                        </p>

                        <h1 className="mt-1 truncate text-base font-semibold">
                            Priscila Barbosa
                        </h1>

                        <p className="text-xs text-white/60">
                            Alisamentos
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">
                <div className="space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        const active =
                            item.href === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-all",
                                    active
                                        ? "bg-white text-[#24351F] shadow-sm"
                                        : "text-white/70 hover:bg-white/10 hover:text-white",
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "size-[18px] shrink-0",
                                        active
                                            ? "text-[#465B36]"
                                            : "text-white/55 group-hover:text-white",
                                    )}
                                />

                                <span className="font-medium">
                                    {item.label}
                                </span>

                                {active && (
                                    <span className="ml-auto size-1.5 rounded-full bg-[#B69A65]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-white/10 p-5">
                <div className="rounded-xl bg-white/[0.06] px-4 py-3">
                    <p className="text-xs font-medium text-white/80">
                        PRISCILA BARBOSA
                    </p>

                    <p className="mt-0.5 text-[11px] text-white/45">
                        Sistema de agendamentos
                    </p>
                </div>
            </div>
        </aside>
    );
}