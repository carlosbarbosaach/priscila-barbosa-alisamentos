"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  completeAppointment,
  type CompleteAppointmentInput,
} from "../appointments.api";

export function useCompleteAppointment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CompleteAppointmentInput,
    ) =>
      completeAppointment(
        input,
      ),

    onSuccess:
      async () => {
        await Promise.all([
          /*
           * Agenda ADMIN.
           */
          queryClient
            .invalidateQueries({
              queryKey: [
                "admin",
                "appointments",
              ],
            }),

          /*
           * Dashboard ADMIN.
           */
          queryClient
            .invalidateQueries({
              queryKey: [
                "admin",
                "dashboard",
              ],
            }),

          /*
           * Relatórios.
           *
           * O valor final pode ter
           * mudado ao concluir.
           */
          queryClient
            .invalidateQueries({
              queryKey: [
                "admin",
                "reports",
              ],
            }),

          /*
           * COMPLETED libera
           * disponibilidade.
           */
          queryClient
            .invalidateQueries({
              queryKey: [
                "client",
                "appointment-availability",
              ],
            }),

          /*
           * Atualiza histórico
           * da cliente.
           */
          queryClient
            .invalidateQueries({
              queryKey: [
                "client",
                "appointments",
              ],
            }),
        ]);
      },
  });
}