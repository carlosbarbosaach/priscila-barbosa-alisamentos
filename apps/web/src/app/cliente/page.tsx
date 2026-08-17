"use client";

import {
    CalendarDays,
    LogOut,
    UserRound,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

import {
    logout,
} from "@/features/services/auth.service";

export default function ClientPage() {
    const {
        user,
        appUser,
        clientLink,
    } = useAuth();

    async function handleLogout() {
        await logout();
    }

    const clientName =
        clientLink?.client?.name ??
        appUser?.displayName ??
        user?.displayName ??
        "Cliente";

    return (
        <main className="min-h-screen bg-[#F7F5EF] px-4 py-8 sm:px-6">
            <div className="mx-auto w-full max-w-3xl">
                <header className="flex flex-col gap-5 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#304229] text-white">
                            <UserRound className="size-5" />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                PRISCILA BARBOSA ALISAMENTOS
                            </p>

                            <h1 className="mt-1 text-xl font-semibold">
                                Olá, {clientName}
                            </h1>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            void handleLogout()
                        }
                    >
                        <LogOut className="mr-2 size-4" />

                        Sair
                    </Button>
                </header>

                <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#F5EBD2] text-[#8A6A2F]">
                        <CalendarDays className="size-5" />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold">
                        Área da cliente
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                        Sua área de agendamentos está sendo preparada.
                        Em breve você poderá solicitar horários e
                        acompanhar seus agendamentos por aqui.
                    </p>

                    {clientLink && (
                        <div className="mt-6 rounded-xl border bg-muted/20 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Status da conta
                            </p>

                            <p className="mt-2 text-sm font-medium">
                                {clientLink.status}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}