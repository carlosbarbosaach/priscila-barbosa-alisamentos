import {
  z,
} from "zod";

/*
 * Consulta da agenda diária.
 *
 * GET
 * /admin/appointments?dateKey=YYYY-MM-DD
 */
export const adminAppointmentListQuerySchema =
  z.object({
    dateKey: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Data inválida.",
      ),
  });

export type AdminAppointmentListQuery =
  z.infer<
    typeof adminAppointmentListQuerySchema
  >;

/*
 * Identificação de um Appointment
 * nas rotas administrativas.
 */
export const adminAppointmentParamsSchema =
  z.object({
    appointmentId: z
      .string()
      .trim()
      .min(
        1,
        "Agendamento não informado.",
      ),
  });

export type AdminAppointmentParams =
  z.infer<
    typeof adminAppointmentParamsSchema
  >;

/*
 * Body da recusa.
 *
 * O motivo será salvo no Appointment
 * e futuramente poderá ser enviado
 * para a cliente via WhatsApp.
 */
export const rejectAdminAppointmentSchema =
  z.object({
    rejectionReason: z
      .string()
      .trim()
      .min(
        3,
        "Informe um motivo para a recusa.",
      )
      .max(
        500,
        "O motivo da recusa deve possuir no máximo 500 caracteres.",
      ),
  });

export type RejectAdminAppointmentInput =
  z.infer<
    typeof rejectAdminAppointmentSchema
  >;