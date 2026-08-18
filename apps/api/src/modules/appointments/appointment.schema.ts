import {
  z,
} from "zod";

export const createAppointmentSchema =
  z.object({
    serviceId: z
      .string()
      .trim()
      .min(
        1,
        "Serviço não informado.",
      ),

    /*
     * Data local do salão.
     *
     * Exemplo:
     * 2026-08-20
     */
    dateKey: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Data inválida.",
      ),

    /*
     * Horário local escolhido.
     *
     * Exemplo:
     * 09:30
     */
    startTime: z
      .string()
      .regex(
        /^\d{2}:\d{2}$/,
        "Horário inválido.",
      ),
  });

export type CreateAppointmentInput =
  z.infer<
    typeof createAppointmentSchema
  >;