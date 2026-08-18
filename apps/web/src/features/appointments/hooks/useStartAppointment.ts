"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  startAppointment,
} from "../appointments.api";

export function useStartAppointment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      appointmentId:
        string,
    ) =>
      startAppointment(
        appointmentId,
      ),

    onSuccess: async () => {
      /*
       * Atualiza imediatamente
       * qualquer Agenda ADMIN
       * carregada em cache.
       *
       * CONFIRMED
       * ↓
       * IN_PROGRESS
       */
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey: [
              "admin",
              "appointments",
            ],
          }),

        /*
         * Mantemos o Dashboard
         * sincronizado também.
         *
         * Hoje essa mudança não altera
         * as pendências, mas evita
         * informações antigas quando
         * adicionarmos novas métricas.
         */
        queryClient
          .invalidateQueries({
            queryKey: [
              "admin",
              "dashboard",
            ],
          }),
      ]);
    },
  });
}