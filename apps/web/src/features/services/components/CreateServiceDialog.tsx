"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus } from "lucide-react";

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
import { useCreateService } from "../../auth/hooks/useCreateService";


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

export function CreateServiceDialog() {
    const [open, setOpen] = useState(false);

    const [name, setName] = useState("");
    const [priceDigits, setPriceDigits] =
        useState("");

    const [formError, setFormError] =
        useState("");

    const createService =
        useCreateService();

    const formattedPrice =
        formatPriceInput(priceDigits);

    function resetForm() {
        setName("");
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

        const normalizedName = name.trim();

        if (normalizedName.length < 2) {
            setFormError(
                "Informe o nome do serviço.",
            );

            return;
        }

        const defaultPriceCents =
            Number(priceDigits);

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
            await createService.mutateAsync({
                name: normalizedName,
                defaultPriceCents,
            });

            resetForm();
            setOpen(false);
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível cadastrar o serviço.",
            );
        }
    }

    return (
        <>
            <Button
                type="button"
                onClick={() => setOpen(true)}
                className="bg-[#304229] text-white hover:bg-[#24351F]"
            >
                <Plus className="mr-2 size-4" />
                Novo serviço
            </Button>

            <Dialog
                open={open}
                onOpenChange={handleOpenChange}
            >
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                Novo serviço
                            </DialogTitle>

                            <DialogDescription>
                                Informe o nome e o preço padrão
                                do serviço.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor="service-name"
                                    className="text-sm font-medium"
                                >
                                    Nome do serviço
                                </label>

                                <Input
                                    id="service-name"
                                    type="text"
                                    value={name}
                                    disabled={
                                        createService.isPending
                                    }
                                    placeholder="Ex: Progressiva"
                                    maxLength={100}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="service-price"
                                    className="text-sm font-medium"
                                >
                                    Preço
                                </label>

                                <Input
                                    id="service-price"
                                    type="text"
                                    inputMode="numeric"
                                    value={formattedPrice}
                                    disabled={
                                        createService.isPending
                                    }
                                    placeholder="R$ 0,00"
                                    onChange={(event) =>
                                        handlePriceChange(
                                            event.target.value,
                                        )
                                    }
                                />

                                <p className="text-xs text-muted-foreground">
                                    Este será o preço padrão do
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
                                    createService.isPending
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
                                    createService.isPending
                                }
                                className="bg-[#304229] text-white hover:bg-[#24351F]"
                            >
                                {createService.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar serviço"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}