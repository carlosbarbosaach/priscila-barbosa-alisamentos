"use client";

import {
    type FormEvent,
    useState,
} from "react";

import type {
    Service,
} from "@priscila/shared";

import {
    BadgePercent,
    Flame,
    Loader2,
    Trash2,
} from "lucide-react";

import {
    Button,
} from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Input,
} from "@/components/ui/input";

import {
    useUpdateServicePromotion,
} from "../hooks/useUpdateServicePromotion";

type ServicePromotionDialogProps = {
    service:
        Service;
};

function formatPrice(
    priceInCents:
        number,
) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL",
        },
    ).format(
        priceInCents /
            100,
    );
}

function formatPriceInput(
    digits:
        string,
) {
    if (!digits) {
        return "";
    }

    const valueInCents =
        Number(
            digits,
        );

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL",
        },
    ).format(
        valueInCents /
            100,
    );
}

export function ServicePromotionDialog({
    service,
}: ServicePromotionDialogProps) {
    const [
        open,
        setOpen,
    ] =
        useState(
            false,
        );

    const [
        priceDigits,
        setPriceDigits,
    ] =
        useState(
            service
                .promotionPriceCents !==
                null
                ? String(
                      service
                          .promotionPriceCents,
                  )
                : "",
        );

    const [
        promotionLabel,
        setPromotionLabel,
    ] =
        useState(
            service
                .promotionLabel ??
                "Promoção",
        );

    const [
        formError,
        setFormError,
    ] =
        useState(
            "",
        );

    const updatePromotion =
        useUpdateServicePromotion();

    const promotionIsActive =
        service
            .promotionActive &&
        service
            .promotionPriceCents !==
            null;

    const formattedNormalPrice =
        formatPrice(
            service
                .defaultPriceCents,
        );

    const formattedPromotionPrice =
        formatPriceInput(
            priceDigits,
        );

    const promotionPriceCents =
        priceDigits
            ? Number(
                  priceDigits,
              )
            : null;

    const discountPercentage =
        promotionPriceCents !==
            null &&
        Number.isInteger(
            promotionPriceCents,
        ) &&
        promotionPriceCents >
            0 &&
        promotionPriceCents <
            service
                .defaultPriceCents &&
        service
            .defaultPriceCents >
            0
            ? Math.round(
                  ((
                      service
                          .defaultPriceCents -
                      promotionPriceCents
                  ) /
                      service
                          .defaultPriceCents) *
                      100,
              )
            : null;

    function handleOpen() {
        setPriceDigits(
            service
                .promotionPriceCents !==
                null
                ? String(
                      service
                          .promotionPriceCents,
                  )
                : "",
        );

        setPromotionLabel(
            service
                .promotionLabel ??
                "Promoção",
        );

        setFormError(
            "",
        );

        setOpen(
            true,
        );
    }

    function handleOpenChange(
        nextOpen:
            boolean,
    ) {
        if (
            updatePromotion
                .isPending
        ) {
            return;
        }

        setOpen(
            nextOpen,
        );

        if (!nextOpen) {
            setFormError(
                "",
            );
        }
    }

    function handlePriceChange(
        value:
            string,
    ) {
        const digits =
            value
                .replace(
                    /\D/g,
                    "",
                )
                .slice(
                    0,
                    9,
                );

        setPriceDigits(
            digits,
        );

        setFormError(
            "",
        );
    }

    async function handleSubmit(
        event:
            FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setFormError(
            "",
        );

        const priceCents =
            Number(
                priceDigits,
            );

        if (
            !Number.isInteger(
                priceCents,
            ) ||
            priceCents <=
                0
        ) {
            setFormError(
                "Informe um preço promocional válido.",
            );

            return;
        }

        if (
            priceCents >=
            service
                .defaultPriceCents
        ) {
            setFormError(
                "O preço promocional precisa ser menor que o preço normal do serviço.",
            );

            return;
        }

        const normalizedLabel =
            promotionLabel
                .trim();

        if (
            normalizedLabel &&
            normalizedLabel.length <
                2
        ) {
            setFormError(
                "O nome da promoção precisa ter pelo menos 2 caracteres.",
            );

            return;
        }

        if (
            normalizedLabel.length >
            40
        ) {
            setFormError(
                "O nome da promoção deve possuir no máximo 40 caracteres.",
            );

            return;
        }

        try {
            await updatePromotion
                .mutateAsync({
                    serviceId:
                        service.id,

                    input: {
                        active:
                            true,

                        promotionPriceCents:
                            priceCents,

                        promotionLabel:
                            normalizedLabel ||
                            "Promoção",
                    },
                });

            setOpen(
                false,
            );
        } catch (error) {
            setFormError(
                error instanceof
                    Error
                    ? error.message
                    : "Não foi possível atualizar a promoção.",
            );
        }
    }

    async function handleRemovePromotion() {
        setFormError(
            "",
        );

        try {
            await updatePromotion
                .mutateAsync({
                    serviceId:
                        service.id,

                    input: {
                        active:
                            false,
                    },
                });

            setOpen(
                false,
            );
        } catch (error) {
            setFormError(
                error instanceof
                    Error
                    ? error.message
                    : "Não foi possível retirar a promoção.",
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
                className={
                    promotionIsActive
                        ? "border-[#E2C98E] bg-[#FFF9EA] text-[#7A5B18] hover:bg-[#FBF0D0] hover:text-[#65490F]"
                        : "border-[#DDD6C9] text-[#655B49] hover:bg-[#FBF8F1]"
                }
            >
                {promotionIsActive ? (
                    <Flame className="mr-2 size-4" />
                ) : (
                    <BadgePercent className="mr-2 size-4" />
                )}

                {promotionIsActive
                    ? "Promoção"
                    : "Colocar em promoção"}
            </Button>

            <Dialog
                open={
                    open
                }
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
                                {promotionIsActive
                                    ? "Gerenciar promoção"
                                    : "Colocar em promoção"}
                            </DialogTitle>

                            <DialogDescription>
                                {promotionIsActive
                                    ? "Altere o valor promocional ou retire este serviço da promoção."
                                    : "Defina um valor promocional para este serviço."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-5">
                            {/* SERVIÇO */}
                            <div className="rounded-2xl border border-[#E3E7E0] bg-[#FAFBF9] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-[#858B81]">
                                            Serviço
                                        </p>

                                        <p className="mt-1 truncate font-semibold text-[#293027]">
                                            {
                                                service
                                                    .name
                                            }
                                        </p>
                                    </div>

                                    {promotionIsActive && (
                                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#EAD6A5] bg-[#FFF7DF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7A5B18]">
                                            <Flame className="size-3.5" />

                                            {service
                                                .promotionLabel ??
                                                "Promoção"}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 border-t border-[#E7EAE4] pt-3">
                                    <p className="text-xs text-[#858B81]">
                                        Preço normal
                                    </p>

                                    <p className="mt-0.5 text-lg font-bold text-[#304229]">
                                        {
                                            formattedNormalPrice
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* PREÇO PROMOCIONAL */}
                            <div className="space-y-2">
                                <label
                                    htmlFor={`promotion-price-${service.id}`}
                                    className="text-sm font-medium"
                                >
                                    Preço promocional
                                </label>

                                <Input
                                    id={`promotion-price-${service.id}`}
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        formattedPromotionPrice
                                    }
                                    disabled={
                                        updatePromotion
                                            .isPending
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        handlePriceChange(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="R$ 0,00"
                                />

                                <p className="text-xs text-muted-foreground">
                                    O valor precisa ser menor que{" "}
                                    {
                                        formattedNormalPrice
                                    }
                                    .
                                </p>
                            </div>

                            {/* NOME DA PROMOÇÃO */}
                            <div className="space-y-2">
                                <label
                                    htmlFor={`promotion-label-${service.id}`}
                                    className="text-sm font-medium"
                                >
                                    Nome da promoção
                                </label>

                                <Input
                                    id={`promotion-label-${service.id}`}
                                    type="text"
                                    value={
                                        promotionLabel
                                    }
                                    maxLength={
                                        40
                                    }
                                    disabled={
                                        updatePromotion
                                            .isPending
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setPromotionLabel(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Promoção"
                                />

                                <p className="text-xs text-muted-foreground">
                                    Este texto será usado na badge apresentada para a cliente.
                                </p>
                            </div>

                            {/* PRÉVIA */}
                            {promotionPriceCents !==
                                null &&
                                promotionPriceCents >
                                    0 &&
                                promotionPriceCents <
                                    service
                                        .defaultPriceCents && (
                                    <div className="rounded-2xl border border-[#E6D7B4] bg-[#FFF9EA] p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#82621F]">
                                                    <Flame className="size-3.5" />

                                                    {promotionLabel
                                                        .trim() ||
                                                        "Promoção"}
                                                </p>

                                                <div className="mt-2 flex flex-wrap items-end gap-2">
                                                    <span className="text-sm text-[#8A8171] line-through">
                                                        {
                                                            formattedNormalPrice
                                                        }
                                                    </span>

                                                    <span className="text-xl font-bold text-[#6F5216]">
                                                        {
                                                            formattedPromotionPrice
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {discountPercentage !==
                                                null && (
                                                <span className="shrink-0 rounded-full bg-[#F4E4B9] px-2.5 py-1 text-xs font-bold text-[#6F5216]">
                                                    -
                                                    {
                                                        discountPercentage
                                                    }
                                                    %
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* ERRO */}
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

                        <DialogFooter className="mt-6 gap-2 sm:justify-between">
                            {promotionIsActive && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        updatePromotion
                                            .isPending
                                    }
                                    onClick={() =>
                                        void handleRemovePromotion()
                                    }
                                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                >
                                    {updatePromotion
                                        .isPending ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 size-4" />
                                    )}

                                    Retirar promoção
                                </Button>
                            )}

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                        updatePromotion
                                            .isPending
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
                                        updatePromotion
                                            .isPending
                                    }
                                    className="bg-[#304229] text-white hover:bg-[#24351F]"
                                >
                                    {updatePromotion
                                        .isPending ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />

                                            Salvando...
                                        </>
                                    ) : promotionIsActive ? (
                                        "Salvar promoção"
                                    ) : (
                                        <>
                                            <Flame className="mr-2 size-4" />

                                            Ativar promoção
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}