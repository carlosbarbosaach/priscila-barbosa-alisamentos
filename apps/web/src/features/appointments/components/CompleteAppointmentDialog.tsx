"use client";

import {
  type FormEvent,
  useState,
} from "react";

import type {
  Appointment,
} from "@priscila/shared";

import {
  CheckCircle2,
  LoaderCircle,
  WalletCards,
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
  useCompleteAppointment,
} from "@/features/appointments/hooks/useCompleteAppointment";

type CompleteAppointmentDialogProps = {
  appointment:
    Appointment;

  onOpenChange:
    (
      open:
        boolean,
    ) => void;
};

const currencyFormatter =
  new Intl.NumberFormat(
    "pt-BR",
    {
      style:
        "currency",

      currency:
        "BRL",
    },
  );

function formatPrice(
  priceCents:
    number,
) {
  return currencyFormatter
    .format(
      priceCents /
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

  return formatPrice(
    valueInCents,
  );
}

export function CompleteAppointmentDialog({
  appointment,
  onOpenChange,
}: CompleteAppointmentDialogProps) {
  /*
   * Começamos preenchendo com o
   * valor inicial do serviço.
   *
   * Ex:
   *
   * A partir de R$ 500
   *
   * input começa em R$ 500,
   * podendo ser alterado para
   * R$ 550, R$ 650 etc.
   */
  const [
    priceDigits,
    setPriceDigits,
  ] =
    useState(
      String(
        appointment
          .chargedPriceCents,
      ),
    );

  const [
    formError,
    setFormError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const completeMutation =
    useCompleteAppointment();

  const formattedPrice =
    formatPriceInput(
      priceDigits,
    );

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
      null,
    );
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      completeMutation
        .isPending
    ) {
      return;
    }

    setFormError(
      null,
    );

    const finalPriceCents =
      Number(
        priceDigits,
      );

    if (
      !Number.isInteger(
        finalPriceCents,
      ) ||
      finalPriceCents <=
        0
    ) {
      setFormError(
        "Informe um valor final válido.",
      );

      return;
    }

    if (
      finalPriceCents <
      appointment
        .chargedPriceCents
    ) {
      setFormError(
        `O valor final não pode ser menor que ${formatPrice(
          appointment
            .chargedPriceCents,
        )}.`,
      );

      return;
    }

    try {
      await completeMutation
        .mutateAsync({
          appointmentId:
            appointment.id,

          finalPriceCents,
        });

      onOpenChange(
        false,
      );
    } catch (
      error
    ) {
      setFormError(
        error instanceof
          Error
          ? error.message
          : "Não foi possível concluir o atendimento.",
      );
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(
        open,
      ) => {
        if (
          !completeMutation
            .isPending
        ) {
          onOpenChange(
            open,
          );
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={
            handleSubmit
          }
        >
          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#304229]">
              <CheckCircle2 className="size-5" />
            </div>

            <DialogTitle>
              Concluir atendimento
            </DialogTitle>

            <DialogDescription>
              Informe o valor final
              cobrado antes de concluir
              o atendimento.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-[#E5E0D5] bg-[#FBFAF7] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#92978E]">
                Serviço
              </p>

              <p className="mt-1 font-semibold text-[#263620]">
                {
                  appointment
                    .serviceNameSnapshot
                }
              </p>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#E8E3D9] pt-4">
                <div>
                  <p className="text-xs font-medium text-[#92978E]">
                    Valor inicial
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#304229]">
                    {formatPrice(
                      appointment
                        .chargedPriceCents,
                    )}
                  </p>
                </div>

                <WalletCards className="size-5 text-[#7A8075]" />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`final-price-${appointment.id}`}
                className="text-sm font-semibold text-[#263620]"
              >
                Valor final cobrado
              </label>

              <Input
                id={`final-price-${appointment.id}`}
                type="text"
                inputMode="numeric"
                autoFocus
                value={
                  formattedPrice
                }
                disabled={
                  completeMutation
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
              />

              <p className="text-xs leading-5 text-muted-foreground">
                Informe o valor
                realmente cobrado da
                cliente neste
                atendimento.
              </p>
            </div>

            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
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
                completeMutation
                  .isPending
              }
              onClick={() =>
                onOpenChange(
                  false,
                )
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                completeMutation
                  .isPending
              }
              className="bg-[#304229] text-white hover:bg-[#24351F]"
            >
              {completeMutation
                .isPending ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />

                  Concluindo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />

                  Concluir atendimento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}