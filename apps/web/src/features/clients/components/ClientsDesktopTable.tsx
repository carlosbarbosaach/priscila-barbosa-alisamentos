import type {
    Client,
    ClientServicePrice,
    Service,
} from "@priscila/shared";

import {
    BadgeDollarSign,
    MessageCircle,
} from "lucide-react";

import { ClientSpecialPriceDialog } from "@/features/client-service-prices/components/ClientSpecialPriceDialog";
import { EditClientDialog } from "./EditClientDialog";
import { ClientStatusButton } from "./ClientStatusButton";

type ClientsDesktopTableProps = {
    clients: Client[];
    specialPrices: ClientServicePrice[];
    services: Service[];
};

function formatPhone(
    phone: string,
) {
    let digits =
        phone.replace(/\D/g, "");

    if (
        digits.startsWith("55") &&
        digits.length >= 12
    ) {
        digits = digits.slice(2);
    }

    if (digits.length === 11) {
        return `(${digits.slice(
            0,
            2,
        )}) ${digits.slice(
            2,
            7,
        )}-${digits.slice(7)}`;
    }

    if (digits.length === 10) {
        return `(${digits.slice(
            0,
            2,
        )}) ${digits.slice(
            2,
            6,
        )}-${digits.slice(6)}`;
    }

    return phone;
}

function formatPrice(
    priceInCents: number,
) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        },
    ).format(
        priceInCents / 100,
    );
}

export function ClientsDesktopTable({
    clients,
    specialPrices,
    services,
}: ClientsDesktopTableProps) {
    return (
        <div className="hidden overflow-hidden rounded-2xl border bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
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
                        {clients.map(
                            (client) => {
                                const clientPrices =
                                    specialPrices.filter(
                                        (
                                            price,
                                        ) =>
                                            price.clientId ===
                                            client.id &&
                                            price.active,
                                    );

                                return (
                                    <tr
                                        key={
                                            client.id
                                        }
                                        className="align-top transition-colors hover:bg-muted/20"
                                    >
                                        <td className="px-6 py-5">
                                            <p className="font-semibold text-foreground">
                                                {
                                                    client.name
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Cliente
                                                do salão
                                            </p>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <MessageCircle className="size-4 shrink-0 text-[#304229]" />

                                                <span className="whitespace-nowrap text-sm">
                                                    {formatPhone(
                                                        client.phone,
                                                    )}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="max-w-[220px] px-6 py-5">
                                            <p className="truncate text-sm text-muted-foreground">
                                                {client.email ??
                                                    "Não informado"}
                                            </p>
                                        </td>

                                        <td className="min-w-[210px] px-6 py-5">
                                            {clientPrices.length >
                                                0 ? (
                                                <div className="space-y-3">
                                                    {clientPrices.map(
                                                        (
                                                            price,
                                                        ) => {
                                                            const service =
                                                                services.find(
                                                                    (
                                                                        item,
                                                                    ) =>
                                                                        item.id ===
                                                                        price.serviceId,
                                                                );

                                                            return (
                                                                <div
                                                                    key={
                                                                        price.id
                                                                    }
                                                                    className="flex items-start gap-2"
                                                                >
                                                                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F5EBD2] text-[#8A6A2F]">
                                                                        <BadgeDollarSign className="size-4" />
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-sm font-medium">
                                                                            {service?.name ??
                                                                                "Serviço"}
                                                                        </p>

                                                                        <p className="mt-0.5 text-sm font-semibold text-[#304229]">
                                                                            {formatPrice(
                                                                                price.priceCents,
                                                                            )}
                                                                        </p>

                                                                        {service && (
                                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                                Padrão:{" "}
                                                                                {formatPrice(
                                                                                    service.defaultPriceCents,
                                                                                )}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    Preço
                                                    padrão
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

                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                <EditClientDialog
                                                    client={client}
                                                />

                                                <ClientSpecialPriceDialog
                                                    client={client}
                                                />

                                                <ClientStatusButton
                                                    client={client}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            },
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}