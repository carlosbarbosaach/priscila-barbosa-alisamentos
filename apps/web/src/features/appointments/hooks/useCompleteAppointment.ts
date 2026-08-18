"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  completeAppointment,
} from "../appointments.api";

export function useCompleteAppointment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      appointmentId: string,
    ) =>
      completeAppointment(
        appointmentId,
      ),

    onSuccess: async () => {
      await Promise.all([
        /*
         * Atualiza a Agenda ADMIN.
         */
        queryClient.invalidateQueries({
          queryKey: [
            "admin",
            "appointments",
          ],
        }),

        /*
         * Deixa o Dashboard preparado
         * para futuras métricas de
         * atendimentos concluídos.
         */
        queryClient.invalidateQueries({
          queryKey: [
            "admin",
            "dashboard",
          ],
        }),

        /*
         * COMPLETED não bloqueia
         * disponibilidade.
         */
        queryClient.invalidateQueries({
          queryKey: [
            "client",
            "appointment-availability",
          ],
        }),

        /*
         * Caso a sessão da cliente esteja
         * usando o mesmo QueryClient,
         * atualizamos histórico/próximos.
         */
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