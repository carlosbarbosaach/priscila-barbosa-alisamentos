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
    dateKey:
      z
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
    appointmentId:
      z
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
 * =================================
 * RECUSAR AGENDAMENTO
 * =================================
 *
 * blockSlot:
 *
 * false
 * ↓
 * recusa o Appointment
 * e libera o horário.
 *
 * true
 * ↓
 * recusa o Appointment
 * e cria ScheduleBlockout.
 *
 * O padrão é false.
 */
export const rejectAdminAppointmentSchema =
  z.object({
    rejectionReason:
      z
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

    blockSlot:
      z
        .boolean()
        .optional()
        .default(
          false,
        ),
  });

export type RejectAdminAppointmentInput =
  z.infer<
    typeof rejectAdminAppointmentSchema
  >;

/*
 * =================================
 * CONCLUIR ATENDIMENTO
 * =================================
 *
 * Para serviços FIXED:
 *
 * {}
 *
 * Para serviços STARTING_FROM:
 *
 * {
 *   finalPriceCents: 65000
 * }
 *
 * O campo permanece opcional no schema
 * porque serviços de preço fixo continuam
 * podendo ser concluídos sem enviar body.
 *
 * A regra que exige o valor para
 * STARTING_FROM fica no Service.
 */
export const completeAdminAppointmentSchema =
  z.object({
    finalPriceCents:
      z
        .number()
        .int(
          "O valor final deve ser um número inteiro em centavos.",
        )
        .min(
          1,
          "O valor final deve ser maior que zero.",
        )
        .optional(),
  });

export type CompleteAdminAppointmentInput =
  z.infer<
    typeof completeAdminAppointmentSchema
  >;