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

import {
  useDashboard,
} from "@/features/dashboard/hooks/useDashboard";

import {
  cn,
} from "@/lib/utils";

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
    showPendingBadge: true,
  },
  {
    label: "Clientes",
    href: "/admin/clientes",
    icon: Users,
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

function formatPendingCount(
  count: number,
) {
  if (count > 99) {
    return "99+";
  }

  return String(
    count,
  );
}

export function AdminSidebar({
  onNavigate,
}: AdminSidebarProps) {
  const pathname =
    usePathname();

  /*
   * O Sidebar reutiliza a mesma query
   * do Dashboard.
   *
   * Como usamos a mesma queryKey do
   * React Query, não criamos uma
   * implementação paralela de API.
   */
  const {
    data: dashboard,
    isLoading:
      dashboardLoading,
    isError:
      dashboardError,
  } =
    useDashboard();

  const pendingApproval =
    dashboard?.metrics
      .pendingApproval ??
    0;

  /*
   * O badge só aparece quando:
   *
   * - a consulta terminou;
   * - não houve erro;
   * - existe pelo menos 1 pendência.
   *
   * Dessa forma não exibimos um "0"
   * piscando enquanto os dados carregam.
   */
  const showPendingBadge =
    !dashboardLoading &&
    !dashboardError &&
    pendingApproval > 0;

  return (
    <aside className="flex h-full flex-col bg-[#24351F] text-white">
      {/* MARCA */}
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

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {navigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                item.href ===
                "/admin"
                  ? pathname ===
                    "/admin"
                  : pathname.startsWith(
                      item.href,
                    );

              const shouldShowBadge =
                item.showPendingBadge ===
                  true &&
                showPendingBadge;

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  onClick={
                    onNavigate
                  }
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition-all",
                    active
                      ? "bg-white text-[#24351F] shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {/* ÍCONE */}
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0",
                      active
                        ? "text-[#465B36]"
                        : "text-white/55 group-hover:text-white",
                    )}
                  />

                  {/* LABEL */}
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {
                      item.label
                    }
                  </span>

                  {/* LADO DIREITO */}
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    {/* BADGE DE PENDÊNCIAS */}
                    {shouldShowBadge && (
                      <span
                        className={cn(
                          "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold leading-5",
                          active
                            ? "bg-[#8A6A2F] text-white"
                            : "bg-[#D9B96E] text-[#24351F]",
                        )}
                        aria-label={`${pendingApproval} solicitações aguardando confirmação`}
                        title={`${pendingApproval} solicitações aguardando confirmação`}
                      >
                        {formatPendingCount(
                          pendingApproval,
                        )}
                      </span>
                    )}

                    {/* INDICADOR DA PÁGINA ATIVA */}
                    {active && (
                      <span className="size-1.5 rounded-full bg-[#B69A65]" />
                    )}
                  </div>
                </Link>
              );
            },
          )}
        </div>
      </nav>

      {/* RODAPÉ */}
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