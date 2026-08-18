import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  AppointmentAvailabilityQueryService,
} from "./appointment-availability-query.service.js";

import {
  appointmentAvailabilityQuerySchema,
} from "./appointment-availability.schema.js";

import {
  AppointmentClientInactiveError,
  AppointmentClientNotFoundError,
  AppointmentClientResolverService,
} from "./appointment-client-resolver.service.js";

import {
  AppointmentBookingService,
  AppointmentSlotUnavailableError,
} from "./appointment-booking.service.js";

import {
  ClientAppointmentQueryService,
} from "./client-appointment-query.service.js";

import {
  ClientServiceCatalogService,
} from "./client-service-catalog.service.js";

import {
  mapAppointmentEntityToAppointment,
} from "./appointment.mapper.js";

import {
  createAppointmentSchema,
} from "./appointment.schema.js";

const clientResolverService =
  new AppointmentClientResolverService();

const appointmentBookingService =
  new AppointmentBookingService();

const appointmentAvailabilityQueryService =
  new AppointmentAvailabilityQueryService();

const clientServiceCatalogService =
  new ClientServiceCatalogService();

const clientAppointmentQueryService =
  new ClientAppointmentQueryService();

/*
 * GET /api/v1/appointments/services
 *
 * Catálogo de serviços disponível
 * para a CLIENT autenticada.
 *
 * O preço já é resolvido considerando
 * eventual preço especial da cliente.
 */
export async function listClientBookableServicesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authUser =
    request.authUser;

  const appUser =
    request.appUser;

  if (!authUser) {
    return reply
      .status(401)
      .send({
        message:
          "Usuário não autenticado.",
      });
  }

  if (!appUser) {
    return reply
      .status(403)
      .send({
        message:
          "Perfil do usuário não identificado.",
      });
  }

  const salonId =
    appUser.salonId;

  if (
    !salonId ||
    salonId.trim().length === 0
  ) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  try {
    /*
     * Nunca recebemos clientId
     * da URL ou do frontend.
     *
     * Encontramos a cliente através
     * do UID autenticado.
     */
    const client =
      await clientResolverService
        .resolve({
          salonId,

          userId:
            authUser.uid,
        });

    /*
     * Agora buscamos o catálogo
     * personalizado da cliente.
     */
    const services =
      await clientServiceCatalogService
        .getCatalog({
          salonId,

          clientId:
            client.id,
        });

    return reply.send({
      services,
    });
  } catch (error) {
    if (
      error instanceof
      AppointmentClientNotFoundError
    ) {
      return reply
        .status(409)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof
      AppointmentClientInactiveError
    ) {
      return reply
        .status(403)
        .send({
          message:
            error.message,
        });
    }

    throw error;
  }
}

/*
 * GET /api/v1/appointments/mine
 *
 * Retorna os agendamentos pertencentes
 * exclusivamente à CLIENT autenticada.
 *
 * Não recebemos clientId pelo frontend.
 */
export async function listClientAppointmentsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authUser =
    request.authUser;

  const appUser =
    request.appUser;

  if (!authUser) {
    return reply
      .status(401)
      .send({
        message:
          "Usuário não autenticado.",
      });
  }

  if (!appUser) {
    return reply
      .status(403)
      .send({
        message:
          "Perfil do usuário não identificado.",
      });
  }

  const salonId =
    appUser.salonId;

  if (
    !salonId ||
    salonId.trim().length === 0
  ) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  try {
    /*
     * Descobrimos qual cliente
     * pertence ao Firebase UID.
     */
    const client =
      await clientResolverService
        .resolve({
          salonId,

          userId:
            authUser.uid,
        });

    /*
     * Busca somente os appointments
     * daquela cliente.
     */
    const result =
      await clientAppointmentQueryService
        .findMine({
          salonId,

          clientId:
            client.id,
        });

    return reply.send({
      nextAppointment:
        result.nextAppointment,

      upcoming:
        result.upcoming,

      history:
        result.history,
    });
  } catch (error) {
    if (
      error instanceof
      AppointmentClientNotFoundError
    ) {
      return reply
        .status(409)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof
      AppointmentClientInactiveError
    ) {
      return reply
        .status(403)
        .send({
          message:
            error.message,
        });
    }

    throw error;
  }
}

/*
 * GET /api/v1/appointments/availability
 *
 * Consulta os horários disponíveis
 * para determinado serviço e data.
 */
export async function getAppointmentAvailabilityController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const appUser =
    request.appUser;

  if (!appUser) {
    return reply
      .status(403)
      .send({
        message:
          "Perfil do usuário não identificado.",
      });
  }

  const salonId =
    appUser.salonId;

  if (
    !salonId ||
    salonId.trim().length === 0
  ) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedQuery =
    appointmentAvailabilityQuerySchema.safeParse(
      request.query,
    );

  if (!parsedQuery.success) {
    return reply
      .status(400)
      .send({
        message:
          "Dados da consulta de disponibilidade inválidos.",

        issues:
          parsedQuery.error.issues,
      });
  }

  try {
    const availability =
      await appointmentAvailabilityQueryService
        .getAvailability({
          salonId,

          serviceId:
            parsedQuery.data.serviceId,

          dateKey:
            parsedQuery.data.dateKey,
        });

    return reply.send({
      availability,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Serviço não encontrado."
    ) {
      return reply
        .status(404)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Serviço indisponível para novos agendamentos."
    ) {
      return reply
        .status(409)
        .send({
          message:
            error.message,
        });
    }

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
 * POST /api/v1/appointments
 *
 * CLIENT autenticada solicita
 * um novo agendamento.
 */
export async function createAppointmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authUser =
    request.authUser;

  const appUser =
    request.appUser;

  if (!authUser) {
    return reply
      .status(401)
      .send({
        message:
          "Usuário não autenticado.",
      });
  }

  if (!appUser) {
    return reply
      .status(403)
      .send({
        message:
          "Perfil do usuário não identificado.",
      });
  }

  const salonId =
    appUser.salonId;

  if (
    !salonId ||
    salonId.trim().length === 0
  ) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedBody =
    createAppointmentSchema.safeParse(
      request.body,
    );

  if (!parsedBody.success) {
    return reply
      .status(400)
      .send({
        message:
          "Dados do agendamento inválidos.",

        issues:
          parsedBody.error.issues,
      });
  }

  try {
    const client =
      await clientResolverService
        .resolve({
          salonId,

          userId:
            authUser.uid,
        });

    const appointmentEntity =
      await appointmentBookingService
        .create({
          salonId,

          clientId:
            client.id,

          serviceId:
            parsedBody.data.serviceId,

          dateKey:
            parsedBody.data.dateKey,

          startTime:
            parsedBody.data.startTime,
        });

    const appointment =
      mapAppointmentEntityToAppointment(
        appointmentEntity,
      );

    return reply
      .status(201)
      .send({
        appointment,
      });
  } catch (error) {
    if (
      error instanceof
      AppointmentClientNotFoundError
    ) {
      return reply
        .status(409)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof
      AppointmentClientInactiveError
    ) {
      return reply
        .status(403)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof
      AppointmentSlotUnavailableError
    ) {
      return reply
        .status(409)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Serviço não encontrado."
    ) {
      return reply
        .status(404)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof Error &&
      (
        error.message ===
          "Serviço indisponível." ||
        error.message ===
          "Serviço indisponível para novos agendamentos."
      )
    ) {
      return reply
        .status(409)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Não é possível agendar um horário no passado."
    ) {
      return reply
        .status(400)
        .send({
          message:
            error.message,
        });
    }

    if (
      error instanceof Error &&
      error.message ===
        "O horário selecionado não está mais disponível."
    ) {
      return reply
        .status(409)
        .send({
          message:
            error.message,
        });
    }

    throw error;
  }
}