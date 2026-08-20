"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminScheduleBlockout,
  type CreateAdminScheduleBlockoutInput,
} from "../schedule-blockouts.api";

export function useCreateScheduleBlockout() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CreateAdminScheduleBlockoutInput,
    ) =>
      createAdminScheduleBlockout(
        input,
      ),

    onSuccess: async () => {
      /*
       * =================================
       * ADMIN
       * =================================
       *
       * Um novo ScheduleBlockout foi
       * criado.
       *
       * Atualizamos qualquer consulta
       * da área administrativa que
       * esteja exibindo os bloqueios.
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
         * O horário acabou de ser
         * bloqueado.
         *
         * Qualquer disponibilidade
         * já carregada pela cliente
         * precisa ser considerada
         * desatualizada.
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