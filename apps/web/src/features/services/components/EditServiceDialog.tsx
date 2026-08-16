"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { Service } from "@priscila/shared";
import { Loader2, Pencil } from "lucide-react";

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

import { useUpdateService } from "../hooks/useUpdateService";

type EditServiceDialogProps = {
    service: Service;
};

function formatPriceInput(digits: string) {
    if (!digits) {
        return "";
    }

    const valueInCents = Number(digits);

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valueInCents / 100);
}

export function EditServiceDialog({
    service,
}: EditServiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(service.name);

    const [priceDigits, setPriceDigits] = useState(
        String(service.defaultPriceCents),
    );

    const [formError, setFormError] = useState("");

    const updateService = useUpdateService();

    const formattedPrice = formatPriceInput(priceDigits);

    function handleOpen() {
        setName(service.name);
        setPriceDigits(
            String(service.defaultPriceCents),
        );
        setFormError("");
        setOpen(true);
    }

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);

        if (!nextOpen) {
            setFormError("");
        }
    }

    function handlePriceChange(value: string) {
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

        const normalizedName = name.trim();

        if (normalizedName.length < 2) {
            setFormError(
                "Informe o nome do serviço.",
            );

            return;
        }

        const defaultPriceCents = Number(
            priceDigits,
        );

        if (
            !Number.isInteger(defaultPriceCents) ||
            defaultPriceCents <= 0
        ) {
            setFormError(
                "Informe um preço válido.",
            );

            return;
        }

        try {
            await updateService.mutateAsync({
                serviceId: service.id,

                input: {
                    name: normalizedName,
                    defaultPriceCents,
                },
            });

            setOpen(false);
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar o serviço.",
            );
        }
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpen}
            >
                <Pencil className="mr-2 size-4" />
                Editar
            </Button>

            <Dialog
                open={open}
                onOpenChange={handleOpenChange}
            >
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                Editar serviço
                            </DialogTitle>

                            <DialogDescription>
                                Altere o nome ou o preço padrão
                                deste serviço.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor={`service-name-${service.id}`}
                                    className="text-sm font-medium"
                                >
                                    Nome do serviço
                                </label>

                                <Input
                                    id={`service-name-${service.id}`}
                                    value={name}
                                    maxLength={100}
                                    disabled={
                                        updateService.isPending
                                    }
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor={`service-price-${service.id}`}
                                    className="text-sm font-medium"
                                >
                                    Preço
                                </label>

                                <Input
                                    id={`service-price-${service.id}`}
                                    type="text"
                                    inputMode="numeric"
                                    value={formattedPrice}
                                    disabled={
                                        updateService.isPending
                                    }
                                    onChange={(event) =>
                                        handlePriceChange(
                                            event.target.value,
                                        )
                                    }
                                />

                                <p className="text-xs text-muted-foreground">
                                    Este é o preço padrão do
                                    serviço.
                                </p>
                            </div>

                            {formError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-700">
                                        {formError}
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={
                                    updateService.isPending
                                }
                                onClick={() =>
                                    handleOpenChange(false)
                                }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    updateService.isPending
                                }
                                className="bg-[#304229] text-white hover:bg-[#24351F]"
                            >
                                {updateService.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar alterações"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}