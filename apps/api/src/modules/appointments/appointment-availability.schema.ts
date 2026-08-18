import {
  z,
} from "zod";

export const appointmentAvailabilityQuerySchema =
  z.object({
    /*
     * Serviço escolhido pela cliente.
     */
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
  });

export type AppointmentAvailabilityQuery =
  z.infer<
    typeof appointmentAvailabilityQuerySchema
  >;