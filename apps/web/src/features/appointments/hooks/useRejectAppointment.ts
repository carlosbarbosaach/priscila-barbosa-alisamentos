"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  rejectAppointment,
  type RejectAppointmentInput,
} from "../appointments.api";

export function useRejectAppointment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        RejectAppointmentInput,
    ) =>
      rejectAppointment(
        input,
      ),

    onSuccess: async () => {
      /*
       * O agendamento mudou de:
       *
       * PENDING_APPROVAL
       *      ↓
       * REJECTED
       *
       * Precisamos atualizar:
       *
       * 1. Agenda ADMIN
       * 2. Dashboard ADMIN
       * 3. Badge da Agenda
       * 4. Disponibilidade da CLIENTE
       *
       * Como REJECTED não bloqueia mais
       * aquele horário, ele pode voltar
       * a aparecer como disponível.
       */
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "admin",
            "appointments",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "admin",
            "dashboard",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "client",
            "appointment-availability",
          ],
        }),
      ]);
    },
  });
}