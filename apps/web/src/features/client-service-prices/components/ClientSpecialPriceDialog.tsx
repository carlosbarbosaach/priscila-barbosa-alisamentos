"use client";

import type {
    Client,
    Service,
} from "@priscila/shared";

import type { FormEvent } from "react";

import {
    BadgeDollarSign,
    Loader2,
    Plus,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { useClientServicePrices } from "@/features/client-service-prices/hooks/useClientServicePrices";
import { useSaveClientServicePrice } from "@/features/client-service-prices/hooks/useSaveClientServicePrice";
import { useServices } from "@/features/services/hooks/useServices";

type ClientSpecialPriceDialogProps = {
    client: Client;
};

function formatCurrency(
    priceInCents: number,
) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        },
    ).format(priceInCents / 100);
}

function formatPriceInput(
    digits: string,
) {
    if (!digits) {
        return "";
    }

    return formatCurrency(
        Number(digits),
    );
}

export function ClientSpecialPriceDialog({
    client,
}: ClientSpecialPriceDialogProps) {
    const [open, setOpen] =
        useState(false);

    const [serviceId, setServiceId] =
        useState("");

    const [
        priceDigits,
        setPriceDigits,
    ] = useState("");

    const [
        formError,
        setFormError,
    ] = useState("");

    const {
        data: services = [],
        isLoading: isLoadingServices,
    } = useServices();

    const {
        data: clientPrices = [],
        isLoading: isLoadingPrices,
    } = useClientServicePrices(
        client.id,
        open,
    );

    const savePrice =
        useSaveClientServicePrice();

    const activeServices =
        useMemo(
            () =>
                services.filter(
                    (service) =>
                        service.active,
                ),
            [services],
        );

    const selectedService:
        | Service
        | undefined =
        useMemo(
            () =>
                services.find(
                    (service) =>
                        service.id ===
                        serviceId,
                ),
            [
                services,
                serviceId,
            ],
        );

    const existingPrice =
        useMemo(
            () =>
                clientPrices.find(
                    (price) =>
                        price.serviceId ===
                        serviceId &&
                        price.active,
                ),
            [
                clientPrices,
                serviceId,
            ],
        );

    useEffect(() => {
        if (!serviceId) {
            setPriceDigits("");

            return;
        }

        if (existingPrice) {
            setPriceDigits(
                String(
                    existingPrice.priceCents,
                ),
            );

            return;
        }

        setPriceDigits("");
    }, [
        serviceId,
        existingPrice,
    ]);

    function resetForm() {
        setServiceId("");
        setPriceDigits("");
        setFormError("");
    }

    function handleOpenChange(
        nextOpen: boolean,
    ) {
        setOpen(nextOpen);

        if (!nextOpen) {
            resetForm();
        }
    }

    function handlePriceChange(
        value: string,
    ) {
        const digits = value
            .replace(/\D/g, "")
            .slice(0, 9);

        setPriceDigits(digits);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setFormError("");

        if (!serviceId) {
            setFormError(
                "Selecione um serviço.",
            );

            return;
        }

        const priceCents =
            Number(priceDigits);

        if (
            !Number.isInteger(
                priceCents,
            ) ||
            priceCents <= 0
        ) {
            setFormError(
                "Informe um preço válido.",
            );

            return;
        }

        try {
            await savePrice.mutateAsync({
                clientId: client.id,
                serviceId,

                input: {
                    priceCents,
                },
            });

            setOpen(false);
            resetForm();
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível salvar o preço especial.",
            );
        }
    }

    const isLoading =
        isLoadingServices ||
        isLoadingPrices;

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                    setOpen(true)
                }
            >
                <Plus className="mr-2 size-4" />

                Preço especial
            </Button>

            <Dialog
                open={open}
                onOpenChange={
                    handleOpenChange
                }
            >
                <DialogContent className="sm:max-w-md">
                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >
                        <DialogHeader>
                            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[#304229] text-white">
                                <BadgeDollarSign className="size-5" />
                            </div>

                            <DialogTitle>
                                Preço especial
                            </DialogTitle>

                            <DialogDescription>
                                Defina um preço
                                personalizado para{" "}
                                <strong>
                                    {client.name}
                                </strong>
                                .
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor={`special-service-${client.id}`}
                                    className="text-sm font-medium"
                                >
                                    Serviço
                                </label>

                                <select
                                    id={`special-service-${client.id}`}
                                    value={
                                        serviceId
                                    }
                                    disabled={
                                        isLoading ||
                                        savePrice.isPending
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setServiceId(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">
                                        Selecione
                                        um serviço
                                    </option>

                                    {activeServices.map(
                                        (
                                            service,
                                        ) => (
                                            <option
                                                key={
                                                    service.id
                                                }
                                                value={
                                                    service.id
                                                }
                                            >
                                                {
                                                    service.name
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            {selectedService && (
                                <div className="rounded-xl border bg-muted/30 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Preço
                                        padrão
                                    </p>

                                    <p className="mt-1 text-xl font-semibold text-[#304229]">
                                        {formatCurrency(
                                            selectedService.defaultPriceCents,
                                        )}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label
                                    htmlFor={`special-price-${client.id}`}
                                    className="text-sm font-medium"
                                >
                                    Preço da
                                    cliente
                                </label>

                                <Input
                                    id={`special-price-${client.id}`}
                                    type="text"
                                    inputMode="numeric"
                                    value={formatPriceInput(
                                        priceDigits,
                                    )}
                                    disabled={
                                        !serviceId ||
                                        savePrice.isPending
                                    }
                                    placeholder="R$ 0,00"
                                    onChange={(
                                        event,
                                    ) =>
                                        handlePriceChange(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />

                                {existingPrice && (
                                    <p className="text-xs text-[#304229]">
                                        Esta cliente já
                                        possui preço
                                        especial para
                                        este serviço.
                                        Salvar irá
                                        atualizar o
                                        valor atual.
                                    </p>
                                )}
                            </div>

                            {formError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-700">
                                        {
                                            formError
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    savePrice.isPending
                                }
                                onClick={() =>
                                    handleOpenChange(
                                        false,
                                    )
                                }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    !serviceId ||
                                    savePrice.isPending
                                }
                                className="bg-[#304229] text-white hover:bg-[#24351F]"
                            >
                                {savePrice.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />

                                        Salvando...
                                    </>
                                ) : existingPrice ? (
                                    "Atualizar preço"
                                ) : (
                                    "Salvar preço"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}