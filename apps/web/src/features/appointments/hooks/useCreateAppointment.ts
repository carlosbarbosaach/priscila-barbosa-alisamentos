"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAppointment,
  type CreateAppointmentInput,
} from "../appointments.api";

export function useCreateAppointment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      input:
        CreateAppointmentInput,
    ) =>
      createAppointment(
        input,
      ),

    onSuccess: async () => {
      /*
       * O novo Appointment muda
       * a disponibilidade do dia.
       */
      await queryClient
        .invalidateQueries({
          queryKey: [
            "client",
            "appointment-availability",
          ],
        });

      /*
       * Mais adiante teremos a query
       * "Meus agendamentos".
       *
       * Já deixamos a invalidação
       * preparada.
       */
      await queryClient
        .invalidateQueries({
          queryKey: [
            "client",
            "appointments",
          ],
        });
    },
  });
}