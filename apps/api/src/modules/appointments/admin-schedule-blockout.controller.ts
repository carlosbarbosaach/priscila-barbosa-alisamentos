import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  AdminScheduleBlockoutAlreadyExistsError,
  AdminScheduleBlockoutAppointmentConflictError,
  AdminScheduleBlockoutInvalidSlotError,
  AdminScheduleBlockoutService,
} from "./admin-schedule-blockout.service.js";

import {
  adminScheduleBlockoutListQuerySchema,
  adminScheduleBlockoutReleaseQuerySchema,
  createAdminScheduleBlockoutSchema,
} from "./admin-schedule-blockout.schema.js";

const adminScheduleBlockoutService =
  new AdminScheduleBlockoutService();

function getSalonId(
  request:
    FastifyRequest,
): string | null {
  return (
    request.appUser?.salonId ??
    null
  );
}

/*
 * =================================
 * LISTAR BLOQUEIOS
 * =================================
 */
export async function listAdminScheduleBlockoutsController(
  request:
    FastifyRequest,

  reply:
    FastifyReply,
) {
  const salonId =
    getSalonId(
      request,
    );

  if (!salonId) {
    return reply
      .status(
        403,
      )
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedQuery =
    adminScheduleBlockoutListQuerySchema
      .safeParse(
        request.query,
      );

  if (
    !parsedQuery.success
  ) {
    return reply
      .status(
        400,
      )
      .send({
        message:
          "Dados da consulta de horários bloqueados inválidos.",

        issues:
          parsedQuery
            .error
            .issues,
      });
  }

  try {
    const blockouts =
      await adminScheduleBlockoutService
        .listByDate({
          salonId,

          dateKey:
            parsedQuery
              .data
              .dateKey,
        });

    return reply.send({
      dateKey:
        parsedQuery
          .data
          .dateKey,

      blockouts,
    });
  } catch (
    error
  ) {
    return handleScheduleBlockoutError(
      error,
      reply,
    );
  }
}

/*
 * =================================
 * CRIAR BLOQUEIO
 * =================================
 */
export async function createAdminScheduleBlockoutController(
  request:
    FastifyRequest,

  reply:
    FastifyReply,
) {
  const salonId =
    getSalonId(
      request,
    );

  if (!salonId) {
    return reply
      .status(
        403,
      )
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedBody =
    createAdminScheduleBlockoutSchema
      .safeParse(
        request.body,
      );

  if (
    !parsedBody.success
  ) {
    return reply
      .status(
        400,
      )
      .send({
        message:
          "Dados do bloqueio inválidos.",

        issues:
          parsedBody
            .error
            .issues,
      });
  }

  try {
    const blockout =
      await adminScheduleBlockoutService
        .create({
          salonId,

          dateKey:
            parsedBody
              .data
              .dateKey,

          startTime:
            parsedBody
              .data
              .startTime,

          reason:
            parsedBody
              .data
              .reason,
        });

    return reply
      .status(
        201,
      )
      .send({
        blockout,
      });
  } catch (
    error
  ) {
    return handleScheduleBlockoutError(
      error,
      reply,
    );
  }
}

/*
 * =================================
 * LIBERAR HORÁRIO
 * =================================
 */
export async function releaseAdminScheduleBlockoutController(
  request:
    FastifyRequest,

  reply:
    FastifyReply,
) {
  const salonId =
    getSalonId(
      request,
    );

  if (!salonId) {
    return reply
      .status(
        403,
      )
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedQuery =
    adminScheduleBlockoutReleaseQuerySchema
      .safeParse(
        request.query,
      );

  if (
    !parsedQuery.success
  ) {
    return reply
      .status(
        400,
      )
      .send({
        message:
          "Dados para liberação do horário inválidos.",

        issues:
          parsedQuery
            .error
            .issues,
      });
  }

  try {
    await adminScheduleBlockoutService
      .release({
        salonId,

        dateKey:
          parsedQuery
            .data
            .dateKey,

        startTime:
          parsedQuery
            .data
            .startTime,
      });

    return reply
      .status(
        204,
      )
      .send();
  } catch (
    error
  ) {
    return handleScheduleBlockoutError(
      error,
      reply,
    );
  }
}

/*
 * =================================
 * ERROS
 * =================================
 */
function handleScheduleBlockoutError(
  error:
    unknown,

  reply:
    FastifyReply,
) {
  /*
   * Bloqueio duplicado.
   */
  if (
    error instanceof
    AdminScheduleBlockoutAlreadyExistsError
  ) {
    return reply
      .status(
        409,
      )
      .send({
        message:
          error.message,
      });
  }

  /*
   * Já existe Appointment ativo
   * naquele horário.
   */
  if (
    error instanceof
    AdminScheduleBlockoutAppointmentConflictError
  ) {
    return reply
      .status(
        409,
      )
      .send({
        message:
          error.message,
      });
  }

  /*
   * Horário não pertence à
   * configuração oficial.
   */
  if (
    error instanceof
    AdminScheduleBlockoutInvalidSlotError
  ) {
    return reply
      .status(
        400,
      )
      .send({
        message:
          error.message,
      });
  }

  if (
    error instanceof
      Error &&
    (
      error.message ===
        "Salão não informado." ||
      error.message ===
        "Informe um motivo para o bloqueio." ||
      error.message ===
        "O motivo do bloqueio deve possuir no máximo 500 caracteres." ||
      error.message ===
        "Data inválida." ||
      error.message ===
        "Data inválida. Utilize o formato YYYY-MM-DD."
    )
  ) {
    return reply
      .status(
        400,
      )
      .send({
        message:
          error.message,
      });
  }

  throw error;
}