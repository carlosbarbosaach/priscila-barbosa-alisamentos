import type { Client } from "@priscila/shared";

import {
    BadgeDollarSign,
    MessageCircle,
} from "lucide-react";

import { ClientSpecialPriceDialog } from "@/features/client-service-prices/components/ClientSpecialPriceDialog";

type ClientsDesktopTableProps = {
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

export function ClientsDesktopTable({
    clients,
    clientsWithSpecialPrice,
}: ClientsDesktopTableProps) {
    return (
        <div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="border-b bg-muted/40">
                        <tr className="text-left">
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Cliente
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                WhatsApp
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                E-mail
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Preço
                            </th>

                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Status
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {clients.map((client) => {
                            const hasSpecialPrice =
                                clientsWithSpecialPrice.has(
                                    client.id,
                                );

                            return (
                                <tr
                                    key={client.id}
                                    className="transition-colors hover:bg-muted/20"
                                >
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {client.name}
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Cliente do salão
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="size-4 text-[#304229]" />

                                            <span className="text-sm">
                                                {formatPhone(
                                                    client.phone,
                                                )}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="max-w-[240px] px-6 py-5">
                                        <p className="truncate text-sm text-muted-foreground">
                                            {client.email ??
                                                "Não informado"}
                                        </p>
                                    </td>

                                    <td className="px-6 py-5">
                                        {hasSpecialPrice ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5EBD2] px-2.5 py-1 text-xs font-medium text-[#8A6A2F]">
                                                <BadgeDollarSign className="size-3.5" />

                                                Especial
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Padrão
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-5">
                                        <span
                                            className={
                                                client.active
                                                    ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
                                                    : "inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
                                            }
                                        >
                                            {client.active
                                                ? "Ativa"
                                                : "Inativa"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <ClientSpecialPriceDialog
                                            client={client}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}