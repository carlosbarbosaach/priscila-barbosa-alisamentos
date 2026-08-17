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

type ClientsMobileCardsProps = {
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

export function ClientsMobileCards({
    clients,
    specialPrices,
    services,
}: ClientsMobileCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {clients.map(
                (client) => {
                    const clientPrices =
                        specialPrices.filter(
                            (price) =>
                                price.clientId ===
                                client.id &&
                                price.active,
                        );

                    const hasSpecialPrice =
                        clientPrices.length >
                        0;

                    return (
                        <article
                            key={
                                client.id
                            }
                            className="rounded-2xl border bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Cliente
                                    </p>

                                    <h2 className="mt-2 text-lg font-semibold">
                                        {
                                            client.name
                                        }
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

                            {hasSpecialPrice && (
                                <div className="mt-5 border-t pt-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <BadgeDollarSign className="size-4 text-[#8A6A2F]" />

                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A6A2F]">
                                            Preço
                                            especial
                                        </p>
                                    </div>

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
                                                        className="rounded-xl bg-[#FAF7EF] p-3"
                                                    >
                                                        <p className="text-sm font-medium">
                                                            {service?.name ??
                                                                "Serviço"}
                                                        </p>

                                                        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                                            <span className="text-lg font-semibold text-[#304229]">
                                                                {formatPrice(
                                                                    price.priceCents,
                                                                )}
                                                            </span>

                                                            {service && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    Padrão:{" "}
                                                                    {formatPrice(
                                                                        service.defaultPriceCents,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t pt-4">
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
                        </article>
                    );
                },
            )}
        </div>
    );
}