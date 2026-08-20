"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  releaseAdminScheduleBlockout,
  type ReleaseAdminScheduleBlockoutInput,
} from "../schedule-blockouts.api";

export function useReleaseScheduleBlockout() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        ReleaseAdminScheduleBlockoutInput,
    ) =>
      releaseAdminScheduleBlockout(
        input,
      ),

    onSuccess: async () => {
      /*
       * =================================
       * ADMIN
       * =================================
       *
       * O ScheduleBlockout foi removido.
       *
       * Atualizamos imediatamente
       * a lista administrativa.
       */
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "admin",
            "schedule-blockouts",
          ],
        }),

        /*
         * =================================
         * CLIENTE
         * =================================
         *
         * O horário voltou a ficar
         * disponível.
         *
         * Invalidamos as consultas
         * existentes para que a cliente
         * veja a nova disponibilidade.
         */
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