"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  confirmAppointment,
} from "../appointments.api";

export function useConfirmAppointment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      appointmentId: string,
    ) =>
      confirmAppointment(
        appointmentId,
      ),

    onSuccess: async () => {
      /*
       * O agendamento mudou de:
       *
       * PENDING_APPROVAL
       *      ↓
       * CONFIRMED
       *
       * Precisamos sincronizar:
       *
       * 1. Agenda ADMIN
       * 2. Dashboard ADMIN
       * 3. Badge da Agenda no Sidebar
       *
       * O Sidebar utiliza a mesma query
       * ["admin", "dashboard"], então
       * basta invalidar o Dashboard.
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
      ]);
    },
  });
}