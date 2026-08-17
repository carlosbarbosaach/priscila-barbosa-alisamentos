import type { Client } from "@priscila/shared";

import {
    BadgeDollarSign,
    MessageCircle,
} from "lucide-react";

import { ClientSpecialPriceDialog } from "@/features/client-service-prices/components/ClientSpecialPriceDialog";

type ClientsMobileCardsProps = {
    clients: Client[];
    clientsWithSpecialPrice: ReadonlySet<string>;
};

function formatPhone(phone: string) {
    let digits = phone.replace(/\D/g, "");

    if (
        digits.startsWith("55") &&
        digits.length >= 12
    ) {
        digits = digits.slice(2);
    }

    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(
            2,
            7,
        )}-${digits.slice(7)}`;
    }

    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(
            2,
            6,
        )}-${digits.slice(6)}`;
    }

    return phone;
}

export function ClientsMobileCards({
    clients,
    clientsWithSpecialPrice,
}: ClientsMobileCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {clients.map((client) => {
                const hasSpecialPrice =
                    clientsWithSpecialPrice.has(
                        client.id,
                    );

                return (
                    <article
                        key={client.id}
                        className="rounded-2xl border bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Cliente
                                </p>

                                <h2 className="mt-2 text-lg font-semibold">
                                    {client.name}
                                </h2>
                            </div>

                            <span
                                className={
                                    client.active
                                        ? "shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
                                        : "shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
                                }
                            >
                                {client.active
                                    ? "Ativa"
                                    : "Inativa"}
                            </span>
                        </div>

                        {hasSpecialPrice && (
                            <div className="mt-4">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5EBD2] px-2.5 py-1 text-xs font-medium text-[#8A6A2F]">
                                    <BadgeDollarSign className="size-3.5" />

                                    Preço especial
                                </span>
                            </div>
                        )}

                        <div className="mt-5 space-y-3 border-t pt-5">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="size-4 text-[#304229]" />

                                <p className="text-sm">
                                    {formatPhone(
                                        client.phone,
                                    )}
                                </p>
                            </div>

                            <p className="truncate text-sm text-muted-foreground">
                                {client.email ??
                                    "E-mail não informado"}
                            </p>
                        </div>

                        <div className="mt-5 flex justify-end border-t pt-4">
                            <ClientSpecialPriceDialog
                                client={client}
                            />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}