"use client";

import {
  CalendarDays,
  CalendarPlus,
  Home,
  LogOut,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import type {
  ReactNode,
} from "react";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  logout,
} from "@/features/services/auth.service";

type ClientShellProps = {
  children: ReactNode;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

const navigationItems:
  NavigationItem[] = [
    {
      label: "Início",
      href: "/cliente",
      icon: Home,
    },
    {
      label: "Agendar",
      href: "/cliente/agendar",
      icon: CalendarPlus,
    },
    {
      label: "Agenda",
      href: "/cliente/agendamentos",
      icon: CalendarDays,
    },
    {
      label: "Perfil",
      href: "/cliente/perfil",
      icon: UserRound,
    },
  ];

export function ClientShell({
  children,
}: ClientShellProps) {
  const pathname =
    usePathname();

  const {
    user,
    appUser,
    clientLink,
  } = useAuth();

  const clientName =
    clientLink?.client?.name ??
    appUser?.displayName ??
    user?.displayName ??
    "Cliente";

  async function handleLogout() {
    await logout();
  }

  function isActive(
    href: string,
  ): boolean {
    if (
      href ===
      "/cliente"
    ) {
      return (
        pathname ===
        "/cliente"
      );
    }

    return pathname.startsWith(
      href,
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EE]">
      {/* DESKTOP HEADER */}
      <header className="sticky top-0 z-40 hidden border-b border-[#E5E0D5] bg-white/95 backdrop-blur md:block">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#304229] text-sm font-bold tracking-wide text-white shadow-sm">
              PB
            </div>

            <div>
              <p className="text-sm font-bold tracking-wide text-[#263620]">
                PRISCILA BARBOSA
              </p>

              <p className="text-xs font-medium tracking-[0.18em] text-[#7A8075]">
                ALISAMENTOS
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navigationItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.href,
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className={[
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#EEF1EA] text-[#304229]"
                        : "text-[#687065] hover:bg-[#F6F4EE] hover:text-[#304229]",
                    ].join(
                      " ",
                    )}
                  >
                    <Icon className="size-4" />

                    {
                      item.label
                    }
                  </Link>
                );
              },
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="max-w-44 truncate text-sm font-semibold text-[#263620]">
                {clientName}
              </p>

              <p className="text-xs text-[#7A8075]">
                Área da cliente
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleLogout()
              }
              className="flex size-10 items-center justify-center rounded-xl border border-[#E5E0D5] bg-white text-[#687065] transition hover:border-[#CFC9BB] hover:bg-[#F6F4EE] hover:text-[#304229]"
              aria-label="Sair da conta"
              title="Sair"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE HEADER */}
      <header className="border-b border-[#E5E0D5] bg-white px-4 py-4 md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/cliente"
            className="flex items-center gap-3"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#304229] text-xs font-bold text-white">
              PB
            </div>

            <div>
              <p className="text-xs font-bold tracking-wide text-[#263620]">
                PRISCILA BARBOSA
              </p>

              <p className="text-[10px] font-medium tracking-[0.16em] text-[#7A8075]">
                ALISAMENTOS
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            className="flex size-10 items-center justify-center rounded-xl border border-[#E5E0D5] text-[#687065]"
            aria-label="Sair da conta"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-10 md:pt-8 lg:px-8">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E5E0D5] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {navigationItems.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href,
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={[
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors",
                    active
                      ? "bg-[#EEF1EA] text-[#304229]"
                      : "text-[#7A8075]",
                  ].join(
                    " ",
                  )}
                >
                  <Icon
                    className={[
                      "size-5",
                      active
                        ? "stroke-[2.25]"
                        : "",
                    ].join(
                      " ",
                    )}
                  />

                  {
                    item.label
                  }
                </Link>
              );
            },
          )}
        </div>
      </nav>
    </div>
  );
}