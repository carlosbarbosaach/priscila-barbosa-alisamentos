"use client";

import {
  APPOINTMENT_STATUS,
  type Appointment,
} from "@priscila/shared";

import {
  Ban,
  LoaderCircle,
  TriangleAlert,
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

type CancelClientAppointmentDialogProps = {
  appointment:
    Appointment | null;

  isPending:
    boolean;

  error:
    string | null;

  onOpenChange:
    (
      open:
        boolean,
    ) => void;

  onConfirm:
    () => void;
};

export function CancelClientAppointmentDialog({
  appointment,
  isPending,
  error,
  onOpenChange,
  onConfirm,
}: CancelClientAppointmentDialogProps) {
  if (!appointment) {
    return null;
  }

  const isPendingApproval =
    appointment.status ===
    APPOINTMENT_STATUS
      .PENDING_APPROVAL;

  const title =
    isPendingApproval
      ? "Cancelar solicitação?"
      : "Cancelar agendamento?";

  const description =
    isPendingApproval
      ? "Sua solicitação ainda não foi confirmada pelo salão."
      : "Seu horário já foi confirmado pelo salão.";

  const confirmLabel =
    isPendingApproval
      ? "Cancelar solicitação"
      : "Cancelar agendamento";

  return (
    <Dialog
      open={
        Boolean(
          appointment,
        )
      }
      onOpenChange={(
        open,
      ) => {
        /*
         * Enquanto a requisição estiver
         * sendo processada, mantemos
         * o modal aberto.
         */
        if (
          isPending &&
          !open
        ) {
          return;
        }

        onOpenChange(
          open,
        );
      }}
    >
      <DialogContent className="border-[#E5E0D5] bg-[#FFFDF8] sm:max-w-[480px]">
        <DialogHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#FAECE8] text-[#984B3E]">
            <Ban className="size-5" />
          </div>

          <DialogTitle className="text-xl font-bold text-[#263620]">
            {
              title
            }
          </DialogTitle>

          <DialogDescription className="leading-6 text-[#71776D]">
            {
              description
            }
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-[#E8D4CF] bg-[#FFF8F6] p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#984B3E]" />

            <div>
              <p className="text-sm font-semibold text-[#6E443D]">
                Esta ação não poderá ser desfeita.
              </p>

              <p className="mt-1 text-xs leading-5 text-[#80655F]">
                O horário ficará novamente disponível para outras clientes.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-[#E8CEC7] bg-[#FFF5F2] px-4 py-3">
            <p className="text-sm font-medium leading-5 text-[#984B3E]">
              {
                error
              }
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={
              isPending
            }
            onClick={() =>
              onOpenChange(
                false,
              )
            }
            className="border-[#D8D3C8] bg-white text-[#304229]"
          >
            Voltar
          </Button>

          <Button
            type="button"
            disabled={
              isPending
            }
            onClick={
              onConfirm
            }
            className="bg-[#984B3E] text-white hover:bg-[#813E34]"
          >
            {isPending ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />

                Cancelando...
              </>
            ) : (
              <>
                <Ban className="mr-2 size-4" />

                {
                  confirmLabel
                }
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}