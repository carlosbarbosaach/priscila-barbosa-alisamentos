import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  AdminAppointmentConsistencyError,
  AdminAppointmentDecisionService,
  AdminAppointmentFinalPriceBelowBaseError,
  AdminAppointmentFinalPriceRequiredError,
  AdminAppointmentInvalidFinalPriceError,
  AdminAppointmentInvalidStatusError,
  AdminAppointmentNotFoundError,
} from "./admin-appointment-decision.service.js";

import {
  AdminAppointmentQueryService,
} from "./admin-appointment-query.service.js";

import {
  adminAppointmentListQuerySchema,
  adminAppointmentParamsSchema,
  completeAdminAppointmentSchema,
  rejectAdminAppointmentSchema,
} from "./admin-appointment.schema.js";

import {
  mapAppointmentEntityToAppointment,
} from "./appointment.mapper.js";

const adminAppointmentQueryService =
  new AdminAppointmentQueryService();

const adminAppointmentDecisionService =
  new AdminAppointmentDecisionService();

function getSalonId(
  request: FastifyRequest,
): string | null {
  return (
    request.appUser?.salonId ??
    null
  );
}

/*
 * =================================
 * LISTAR AGENDA
 * =================================
 *
 * GET
 * /api/v1/admin/appointments
 */
export async function listAdminAppointmentsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const salonId =
    getSalonId(
      request,
    );

  if (!salonId) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedQuery =
    adminAppointmentListQuerySchema
      .safeParse(
        request.query,
      );

  if (!parsedQuery.success) {
    return reply
      .status(400)
      .send({
        message:
          "Dados da consulta da agenda inválidos.",

        issues:
          parsedQuery
            .error
            .issues,
      });
  }

  try {
    const result =
      await adminAppointmentQueryService
        .findByDate({
          salonId,

          dateKey:
            parsedQuery
              .data
              .dateKey,
        });

    return reply.send({
      dateKey:
        result.dateKey,

      appointments:
        result.appointments,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message ===
          "Data inválida." ||
        error.message ===
          "Data inválida. Utilize o formato YYYY-MM-DD."
      )
    ) {
      return reply
        .status(400)
        .send({
          message:
            error.message,
        });
    }

    throw error;
  }
}

/*
 * =================================
 * CONFIRMAR
 * =================================
 *
 * PENDING_APPROVAL
 * ↓
 * CONFIRMED
 */
export async function confirmAdminAppointmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return executeAppointmentAction(
    request,
    reply,
    "confirm",
  );
}

/*
 * =================================
 * INICIAR ATENDIMENTO
 * =================================
 *
 * CONFIRMED
 * ↓
 * IN_PROGRESS
 */
export async function startAdminAppointmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  return executeAppointmentAction(
    request,
    reply,
    "start",
  );
}

/*
 * =================================
 * CONCLUIR ATENDIMENTO
 * =================================
 *
 * IN_PROGRESS
 * ↓
 * COMPLETED
 *
 * Serviço FIXED:
 *
 * PATCH sem body.
 *
 * Serviço STARTING_FROM:
 *
 * {
 *   finalPriceCents: 65000
 * }
 */
export async function completeAdminAppointmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const salonId =
    getSalonId(
      request,
    );

  if (!salonId) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedParams =
    adminAppointmentParamsSchema
      .safeParse(
        request.params,
      );

  if (!parsedParams.success) {
    return reply
      .status(400)
      .send({
        message:
          "Parâmetros do agendamento inválidos.",

        issues:
          parsedParams
            .error
            .issues,
      });
  }

  /*
   * Serviço FIXED pode chamar
   * PATCH sem body.
   *
   * Por isso usamos {} quando
   * request.body não existir.
   */
  const parsedBody =
    completeAdminAppointmentSchema
      .safeParse(
        request.body ??
          {},
      );

  if (!parsedBody.success) {
    return reply
      .status(400)
      .send({
        message:
          "Dados para conclusão do atendimento inválidos.",

        issues:
          parsedBody
            .error
            .issues,
      });
  }

  /*
   * IMPORTANTE:
   *
   * Com:
   *
   * exactOptionalPropertyTypes: true
   *
   * não podemos fazer:
   *
   * {
   *   finalPriceCents: undefined
   * }
   *
   * Quando não existir valor final,
   * a propriedade deve simplesmente
   * não existir no objeto.
   */
  const completeInput = {
    salonId,

    appointmentId:
      parsedParams
        .data
        .appointmentId,

    ...(
      parsedBody
        .data
        .finalPriceCents !==
      undefined
        ? {
            finalPriceCents:
              parsedBody
                .data
                .finalPriceCents,
          }
        : {}
    ),
  };

  try {
    const appointmentEntity =
      await adminAppointmentDecisionService
        .complete(
          completeInput,
        );

    const appointment =
      mapAppointmentEntityToAppointment(
        appointmentEntity,
      );

    return reply.send({
      appointment,
    });
  } catch (error) {
    return handleAdminAppointmentError(
      error,
      reply,
    );
  }
}

/*
 * =================================
 * RECUSAR
 * =================================
 *
 * PENDING_APPROVAL
 * ↓
 * REJECTED
 *
 * blockSlot = false
 * ↓
 * libera o horário.
 *
 * blockSlot = true
 * ↓
 * cria bloqueio administrativo.
 */
export async function rejectAdminAppointmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const salonId =
    getSalonId(
      request,
    );

  if (!salonId) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedParams =
    adminAppointmentParamsSchema
      .safeParse(
        request.params,
      );

  if (!parsedParams.success) {
    return reply
      .status(400)
      .send({
        message:
          "Parâmetros do agendamento inválidos.",

        issues:
          parsedParams
            .error
            .issues,
      });
  }

  const parsedBody =
    rejectAdminAppointmentSchema
      .safeParse(
        request.body,
      );

  if (!parsedBody.success) {
    return reply
      .status(400)
      .send({
        message:
          "Dados da recusa inválidos.",

        issues:
          parsedBody
            .error
            .issues,
      });
  }

  try {
    const appointmentEntity =
      await adminAppointmentDecisionService
        .reject({
          salonId,

          appointmentId:
            parsedParams
              .data
              .appointmentId,

          rejectionReason:
            parsedBody
              .data
              .rejectionReason,

          blockSlot:
            parsedBody
              .data
              .blockSlot,
        });

    const appointment =
      mapAppointmentEntityToAppointment(
        appointmentEntity,
      );

    return reply.send({
      appointment,
    });
  } catch (error) {
    return handleAdminAppointmentError(
      error,
      reply,
    );
  }
}

type AppointmentAction =
  | "confirm"
  | "start";

/*
 * =================================
 * AÇÕES SEM BODY
 * =================================
 *
 * Confirmar e iniciar continuam
 * utilizando este controller
 * compartilhado.
 *
 * Concluir não utiliza mais porque
 * agora pode receber finalPriceCents.
 */
async function executeAppointmentAction(
  request: FastifyRequest,
  reply: FastifyReply,
  action: AppointmentAction,
) {
  const salonId =
    getSalonId(
      request,
    );

  if (!salonId) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedParams =
    adminAppointmentParamsSchema
      .safeParse(
        request.params,
      );

  if (!parsedParams.success) {
    return reply
      .status(400)
      .send({
        message:
          "Parâmetros do agendamento inválidos.",

        issues:
          parsedParams
            .error
            .issues,
      });
  }

  const input = {
    salonId,

    appointmentId:
      parsedParams
        .data
        .appointmentId,
  };

  try {
    const appointmentEntity =
      action ===
      "confirm"
        ? await adminAppointmentDecisionService
            .confirm(
              input,
            )
        : await adminAppointmentDecisionService
            .start(
              input,
            );

    const appointment =
      mapAppointmentEntityToAppointment(
        appointmentEntity,
      );

    return reply.send({
      appointment,
    });
  } catch (error) {
    return handleAdminAppointmentError(
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
function handleAdminAppointmentError(
  error: unknown,
  reply: FastifyReply,
) {
  /*
   * Agendamento não encontrado.
   */
  if (
    error instanceof
    AdminAppointmentNotFoundError
  ) {
    return reply
      .status(404)
      .send({
        message:
          error.message,
      });
  }

  /*
   * Status não permite a operação.
   */
  if (
    error instanceof
    AdminAppointmentInvalidStatusError
  ) {
    return reply
      .status(409)
      .send({
        message:
          error.message,
      });
  }

  /*
   * Alteração concorrente.
   */
  if (
    error instanceof
    AdminAppointmentConsistencyError
  ) {
    return reply
      .status(409)
      .send({
        message:
          error.message,
      });
  }

  /*
   * Serviço STARTING_FROM sem
   * valor final informado.
   */
  if (
    error instanceof
    AdminAppointmentFinalPriceRequiredError
  ) {
    return reply
      .status(400)
      .send({
        message:
          error.message,
      });
  }

  /*
   * Valor final inválido.
   */
  if (
    error instanceof
    AdminAppointmentInvalidFinalPriceError
  ) {
    return reply
      .status(400)
      .send({
        message:
          error.message,
      });
  }

  /*
   * Valor final inferior ao
   * valor inicial.
   */
  if (
    error instanceof
    AdminAppointmentFinalPriceBelowBaseError
  ) {
    return reply
      .status(400)
      .send({
        message:
          error.message,
      });
  }

  /*
   * Validações da recusa.
   */
  if (
    error instanceof Error &&
    (
      error.message ===
        "Informe um motivo para a recusa." ||
      error.message ===
        "O motivo da recusa deve possuir no máximo 500 caracteres."
    )
  ) {
    return reply
      .status(400)
      .send({
        message:
          error.message,
      });
  }

  throw error;
}