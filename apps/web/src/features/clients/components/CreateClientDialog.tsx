"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import {
    Loader2,
    Plus,
} from "lucide-react";

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

import { useCreateClient } from "@/features/clients/hooks/useCreateClient";

function formatPhone(value: string) {
    const digits = value
        .replace(/\D/g, "")
        .slice(0, 11);

    if (digits.length <= 2) {
        return digits.length
            ? `(${digits}`
            : "";
    }

    if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(
            2,
            6,
        )}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(
        2,
        7,
    )}-${digits.slice(7)}`;
}

export function CreateClientDialog() {
    const [open, setOpen] = useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [formError, setFormError] =
        useState("");

    const createClient =
        useCreateClient();

    function resetForm() {
        setName("");
        setPhone("");
        setEmail("");
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

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setFormError("");

        const normalizedName =
            name.trim();

        if (normalizedName.length < 2) {
            setFormError(
                "Informe o nome da cliente.",
            );

            return;
        }

        const phoneDigits =
            phone.replace(/\D/g, "");

        if (
            phoneDigits.length !== 10 &&
            phoneDigits.length !== 11
        ) {
            setFormError(
                "Informe um WhatsApp válido com DDD.",
            );

            return;
        }

        try {
            await createClient.mutateAsync({
                name: normalizedName,
                phone,

                email:
                    email.trim().length > 0
                        ? email
                            .trim()
                            .toLowerCase()
                        : null,
            });

            resetForm();
            setOpen(false);
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível cadastrar a cliente.",
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
                Nova cliente
            </Button>

            <Dialog
                open={open}
                onOpenChange={
                    handleOpenChange
                }
            >
                <DialogContent className="sm:max-w-md">
                    <form
                        onSubmit={handleSubmit}
                    >
                        <DialogHeader>
                            <DialogTitle>
                                Nova cliente
                            </DialogTitle>

                            <DialogDescription>
                                Cadastre os dados
                                principais da cliente.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor="client-name"
                                    className="text-sm font-medium"
                                >
                                    Nome
                                </label>

                                <Input
                                    id="client-name"
                                    value={name}
                                    maxLength={120}
                                    placeholder="Ex: Maria da Silva"
                                    disabled={
                                        createClient.isPending
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setName(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="client-phone"
                                    className="text-sm font-medium"
                                >
                                    WhatsApp
                                </label>

                                <Input
                                    id="client-phone"
                                    type="tel"
                                    inputMode="tel"
                                    value={phone}
                                    placeholder="(48) 99999-9999"
                                    disabled={
                                        createClient.isPending
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setPhone(
                                            formatPhone(
                                                event
                                                    .target
                                                    .value,
                                            ),
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="client-email"
                                    className="text-sm font-medium"
                                >
                                    E-mail
                                    <span className="ml-1 font-normal text-muted-foreground">
                                        (opcional)
                                    </span>
                                </label>

                                <Input
                                    id="client-email"
                                    type="email"
                                    value={email}
                                    maxLength={254}
                                    placeholder="cliente@email.com"
                                    disabled={
                                        createClient.isPending
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setEmail(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
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
                                    createClient.isPending
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
                                    createClient.isPending
                                }
                                className="bg-[#304229] text-white hover:bg-[#24351F]"
                            >
                                {createClient.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Cadastrando...
                                    </>
                                ) : (
                                    "Cadastrar cliente"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}