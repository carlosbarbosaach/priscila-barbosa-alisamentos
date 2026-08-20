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
  cancelClientAppointmentController,
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
    async (
      app,
    ) => {
      /*
       * =================================
       * SERVIÇOS DA CLIENTE
       * =================================
       *
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
       * =================================
       * MEUS AGENDAMENTOS
       * =================================
       *
       * Nenhum clientId é recebido
       * pela URL.
       *
       * A cliente é identificada
       * pela autenticação.
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
       * =================================
       * CANCELAMENTO PELA CLIENTE
       * =================================
       *
       * PATCH
       *
       * /api/v1/appointments/
       * mine/:appointmentId/cancel
       *
       * A cliente envia somente
       * o ID do agendamento.
       *
       * salonId e clientId são
       * determinados pelo backend.
       */
      app.patch(
        "/mine/:appointmentId/cancel",

        {
          preHandler:
            clientOnly,
        },

        cancelClientAppointmentController,
      );

      /*
       * =================================
       * DISPONIBILIDADE
       * =================================
       *
       * Horários disponíveis
       * para determinado serviço.
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
       * =================================
       * NOVO AGENDAMENTO
       * =================================
       *
       * Cliente solicita
       * um novo horário.
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