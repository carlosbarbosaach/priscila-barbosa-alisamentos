import {
  USER_ROLES,
} from "@priscila/shared";

import type {
  FastifyPluginAsync,
} from "fastify";

import {
  authenticate,
} from "../../shared/middleware/authenticate.middleware.js";

import {
  requireRole,
} from "../../shared/middleware/require-role.middleware.js";

import {
  createAppointmentController,
  getAppointmentAvailabilityController,
  listClientAppointmentsController,
  listClientBookableServicesController,
} from "./appointment.controller.js";

const clientOnly = [
  authenticate,

  requireRole([
    USER_ROLES.CLIENT,
  ]),
];

export const appointmentRoutes:
  FastifyPluginAsync =
    async (app) => {
      /*
       * Serviços disponíveis e
       * preço personalizado.
       */
      app.get(
        "/services",
        {
          preHandler:
            clientOnly,
        },
        listClientBookableServicesController,
      );

      /*
       * Agendamentos da própria CLIENT.
       *
       * Nenhum clientId é recebido
       * pela URL.
       */
      app.get(
        "/mine",
        {
          preHandler:
            clientOnly,
        },
        listClientAppointmentsController,
      );

      /*
       * Horários disponíveis.
       */
      app.get(
        "/availability",
        {
          preHandler:
            clientOnly,
        },
        getAppointmentAvailabilityController,
      );

      /*
       * Solicitar agendamento.
       */
      app.post(
        "/",
        {
          preHandler:
            clientOnly,
        },
        createAppointmentController,
      );
    };