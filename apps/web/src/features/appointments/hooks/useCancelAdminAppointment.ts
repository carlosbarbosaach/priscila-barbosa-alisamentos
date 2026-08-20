"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelAdminAppointment,
  type CancelAdminAppointmentInput,
} from "../appointments.api";

export function useCancelAdminAppointment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CancelAdminAppointmentInput,
    ) =>
      cancelAdminAppointment(
        input,
      ),

    onSuccess: async () => {
      /*
       * O agendamento mudou de:
       *
       * PENDING_APPROVAL
       * ou
       * CONFIRMED
       *
       * ↓
       *
       * CANCELLED
       *
       * Precisamos atualizar:
       *
       * 1. Agenda ADMIN
       * 2. Dashboard ADMIN
       * 3. Disponibilidade da cliente
       * 4. Meus agendamentos da cliente
       *
       * Como CANCELLED não bloqueia
       * horário, ele volta a ficar
       * disponível para agendamento.
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

        queryClient.invalidateQueries({
          queryKey: [
            "client",
            "appointments",
          ],
        }),
      ]);
    },
  });
}