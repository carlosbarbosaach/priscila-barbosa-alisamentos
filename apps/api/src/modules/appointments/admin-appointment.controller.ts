import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  AdminAppointmentConsistencyError,
  AdminAppointmentDecisionService,
  AdminAppointmentFinalPriceBelowBaseError,
  AdminAppointmentFinalPriceRequiredError,
  AdminAppointmentInvalidCancellationReasonError,
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
  cancelAdminAppointmentSchema,
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
  request:
    FastifyRequest,
): string | null {
  return (
    request
      .appUser
      ?.salonId ??
    null
  );
}

/*
 * =================================
 * LISTAR AGENDA
 * =================================
 */
export async function listAdminAppointmentsController(
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
    adminAppointmentListQuerySchema
      .safeParse(
        request.query,
      );

  if (!parsedQuery.success) {
    return reply
      .status(
        400,
      )
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
  } catch (
    error
  ) {
    if (
      error instanceof
        Error &&
      (
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
}

/*
 * =================================
 * CONFIRMAR
 * =================================
 */
export async function confirmAdminAppointmentController(
  request:
    FastifyRequest,

  reply:
    FastifyReply,
) {
  return executeAppointmentAction(
    request,
    reply,
    "confirm",
  );
}

/*
 * =================================
 * CANCELAR
 * =================================
 *
 * PENDING_APPROVAL
 * ou
 * CONFIRMED
 *
 * ↓
 *
 * CANCELLED
 */
export async function cancelAdminAppointmentController(
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

  const parsedParams =
    adminAppointmentParamsSchema
      .safeParse(
        request.params,
      );

  if (!parsedParams.success) {
    return reply
      .status(
        400,
      )
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
    cancelAdminAppointmentSchema
      .safeParse(
        request.body,
      );

  if (!parsedBody.success) {
    return reply
      .status(
        400,
      )
      .send({
        message:
          "Dados do cancelamento inválidos.",

        issues:
          parsedBody
            .error
            .issues,
      });
  }

  try {
    const appointmentEntity =
      await adminAppointmentDecisionService
        .cancel({
          salonId,

          appointmentId:
            parsedParams
              .data
              .appointmentId,

          cancellationReason:
            parsedBody
              .data
              .cancellationReason,
        });

    const appointment =
      mapAppointmentEntityToAppointment(
        appointmentEntity,
      );

    return reply.send({
      appointment,
    });
  } catch (
    error
  ) {
    return handleAdminAppointmentError(
      error,
      reply,
    );
  }
}

/*
 * =================================
 * INICIAR
 * =================================
 */
export async function startAdminAppointmentController(
  request:
    FastifyRequest,

  reply:
    FastifyReply,
) {
  return executeAppointmentAction(
    request,
    reply,
    "start",
  );
}

/*
 * =================================
 * CONCLUIR
 * =================================
 */
export async function completeAdminAppointmentController(
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

  const parsedParams =
    adminAppointmentParamsSchema
      .safeParse(
        request.params,
      );

  if (!parsedParams.success) {
    return reply
      .status(
        400,
      )
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
    completeAdminAppointmentSchema
      .safeParse(
        request.body ??
          {},
      );

  if (!parsedBody.success) {
    return reply
      .status(
        400,
      )
      .send({
        message:
          "Dados para conclusão do atendimento inválidos.",

        issues:
          parsedBody
            .error
            .issues,
      });
  }

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
  } catch (
    error
  ) {
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
 */
export async function rejectAdminAppointmentController(
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

  const parsedParams =
    adminAppointmentParamsSchema
      .safeParse(
        request.params,
      );

  if (!parsedParams.success) {
    return reply
      .status(
        400,
      )
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
      .status(
        400,
      )
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
  } catch (
    error
  ) {
    return handleAdminAppointmentError(
      error,
      reply,
    );
  }
}

type AppointmentAction =
  | "confirm"
  | "start";

async function executeAppointmentAction(
  request:
    FastifyRequest,

  reply:
    FastifyReply,

  action:
    AppointmentAction,
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

  const parsedParams =
    adminAppointmentParamsSchema
      .safeParse(
        request.params,
      );

  if (!parsedParams.success) {
    return reply
      .status(
        400,
      )
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
  } catch (
    error
  ) {
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
  error:
    unknown,

  reply:
    FastifyReply,
) {
  if (
    error instanceof
    AdminAppointmentNotFoundError
  ) {
    return reply
      .status(
        404,
      )
      .send({
        message:
          error.message,
      });
  }

  if (
    error instanceof
    AdminAppointmentInvalidStatusError
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

  if (
    error instanceof
    AdminAppointmentConsistencyError
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

  if (
    error instanceof
    AdminAppointmentInvalidCancellationReasonError
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
    AdminAppointmentFinalPriceRequiredError
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
    AdminAppointmentInvalidFinalPriceError
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
    AdminAppointmentFinalPriceBelowBaseError
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
        "Informe um motivo para a recusa." ||
      error.message ===
        "O motivo da recusa deve possuir no máximo 500 caracteres."
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