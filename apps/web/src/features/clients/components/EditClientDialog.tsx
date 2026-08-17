"use client";

import type { Client } from "@priscila/shared";
import type { FormEvent } from "react";

import {
    Loader2,
    Pencil,
} from "lucide-react";

import { useState } from "react";

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

import { useUpdateClient } from "@/features/clients/hooks/useUpdateClient";

type EditClientDialogProps = {
    client: Client;
};

function formatPhone(
    value: string,
) {
    let digits =
        value.replace(/\D/g, "");

    if (
        digits.startsWith("55") &&
        digits.length >= 12
    ) {
        digits = digits.slice(2);
    }

    digits = digits.slice(0, 11);

    if (digits.length <= 2) {
        return digits.length
            ? `(${digits}`
            : "";
    }

    if (digits.length <= 6) {
        return `(${digits.slice(
            0,
            2,
        )}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
        return `(${digits.slice(
            0,
            2,
        )}) ${digits.slice(
            2,
            6,
        )}-${digits.slice(6)}`;
    }

    return `(${digits.slice(
        0,
        2,
    )}) ${digits.slice(
        2,
        7,
    )}-${digits.slice(7)}`;
}

export function EditClientDialog({
    client,
}: EditClientDialogProps) {
    const [open, setOpen] =
        useState(false);

    const [name, setName] =
        useState(client.name);

    const [phone, setPhone] =
        useState(
            formatPhone(
                client.phone,
            ),
        );

    const [email, setEmail] =
        useState(
            client.email ?? "",
        );

    const [
        formError,
        setFormError,
    ] = useState("");

    const updateClient =
        useUpdateClient();

    function prepareForm() {
        setName(client.name);

        setPhone(
            formatPhone(
                client.phone,
            ),
        );

        setEmail(
            client.email ?? "",
        );

        setFormError("");
    }

    function handleOpen() {
        prepareForm();
        setOpen(true);
    }

    function handleOpenChange(
        nextOpen: boolean,
    ) {
        setOpen(nextOpen);

        if (!nextOpen) {
            setFormError("");
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setFormError("");

        const normalizedName =
            name.trim();

        if (
            normalizedName.length < 2
        ) {
            setFormError(
                "Informe o nome da cliente.",
            );

            return;
        }

        const phoneDigits =
            phone.replace(
                /\D/g,
                "",
            );

        if (
            phoneDigits.length !== 10 &&
            phoneDigits.length !== 11
        ) {
            setFormError(
                "Informe um WhatsApp válido com DDD.",
            );

            return;
        }

        const normalizedEmail =
            email.trim();

        try {
            await updateClient.mutateAsync({
                clientId:
                    client.id,

                input: {
                    name:
                        normalizedName,

                    phone,

                    email:
                        normalizedEmail.length >
                            0
                            ? normalizedEmail.toLowerCase()
                            : null,
                },
            });

            setOpen(false);
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar a cliente.",
            );
        }
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={
                    handleOpen
                }
            >
                <Pencil className="mr-2 size-4" />

                Editar
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
                            <DialogTitle>
                                Editar cliente
                            </DialogTitle>

                            <DialogDescription>
                                Atualize os
                                dados da cliente.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-5">
                            <div className="space-y-2">
                                <label
                                    htmlFor={`edit-client-name-${client.id}`}
                                    className="text-sm font-medium"
                                >
                                    Nome
                                </label>

                                <Input
                                    id={`edit-client-name-${client.id}`}
                                    value={
                                        name
                                    }
                                    maxLength={
                                        120
                                    }
                                    disabled={
                                        updateClient.isPending
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
                                    htmlFor={`edit-client-phone-${client.id}`}
                                    className="text-sm font-medium"
                                >
                                    WhatsApp
                                </label>

                                <Input
                                    id={`edit-client-phone-${client.id}`}
                                    type="tel"
                                    inputMode="tel"
                                    value={
                                        phone
                                    }
                                    disabled={
                                        updateClient.isPending
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
                                    htmlFor={`edit-client-email-${client.id}`}
                                    className="text-sm font-medium"
                                >
                                    E-mail

                                    <span className="ml-1 font-normal text-muted-foreground">
                                        (opcional)
                                    </span>
                                </label>

                                <Input
                                    id={`edit-client-email-${client.id}`}
                                    type="email"
                                    value={
                                        email
                                    }
                                    maxLength={
                                        254
                                    }
                                    disabled={
                                        updateClient.isPending
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
                                    updateClient.isPending
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
                                    updateClient.isPending
                                }
                                className="bg-[#304229] text-white hover:bg-[#24351F]"
                            >
                                {updateClient.isPending ? (
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