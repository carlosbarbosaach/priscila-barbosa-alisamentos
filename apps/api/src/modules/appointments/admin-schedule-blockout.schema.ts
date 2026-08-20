import {
  z,
} from "zod";

/*
 * =================================
 * LISTAR BLOQUEIOS
 * =================================
 *
 * GET
 *
 * /admin/appointments/blockouts
 * ?dateKey=2026-08-21
 */
export const adminScheduleBlockoutListQuerySchema =
  z.object({
    dateKey:
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Data inválida.",
        ),
  });

export type AdminScheduleBlockoutListQuery =
  z.infer<
    typeof adminScheduleBlockoutListQuerySchema
  >;

/*
 * =================================
 * CRIAR BLOQUEIO MANUAL
 * =================================
 *
 * POST
 *
 * /admin/appointments/blockouts
 *
 * {
 *   "dateKey": "2026-08-21",
 *   "startTime": "13:00",
 *   "reason": "Compromisso pessoal"
 * }
 */
export const createAdminScheduleBlockoutSchema =
  z.object({
    dateKey:
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Data inválida.",
        ),

    startTime:
      z
        .string()
        .regex(
          /^\d{2}:\d{2}$/,
          "Horário inválido.",
        ),

    reason:
      z
        .string()
        .trim()
        .min(
          3,
          "Informe um motivo para o bloqueio.",
        )
        .max(
          500,
          "O motivo do bloqueio deve possuir no máximo 500 caracteres.",
        ),
  });

export type CreateAdminScheduleBlockoutInput =
  z.infer<
    typeof createAdminScheduleBlockoutSchema
  >;

/*
 * =================================
 * LIBERAR HORÁRIO
 * =================================
 *
 * DELETE
 *
 * /admin/appointments/blockouts
 * ?dateKey=2026-08-21
 * &startTime=13:00
 */
export const adminScheduleBlockoutReleaseQuerySchema =
  z.object({
    dateKey:
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Data inválida.",
        ),

    startTime:
      z
        .string()
        .regex(
          /^\d{2}:\d{2}$/,
          "Horário inválido.",
        ),
  });

export type AdminScheduleBlockoutReleaseQuery =
  z.infer<
    typeof adminScheduleBlockoutReleaseQuerySchema
  >;