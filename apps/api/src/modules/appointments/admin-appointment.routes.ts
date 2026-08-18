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
  confirmAdminAppointmentController,
  listAdminAppointmentsController,
  rejectAdminAppointmentController,
} from "./admin-appointment.controller.js";

const adminOnly = [
  authenticate,

  requireRole([
    USER_ROLES.ADMIN,
  ]),
];

export const adminAppointmentRoutes:
  FastifyPluginAsync =
    async (app) => {
      /*
       * Lista a agenda de um dia.
       *
       * GET
       * /api/v1/admin/appointments
       *
       * Query:
       *
       * ?dateKey=2026-08-20
       */
      app.get(
        "/",
        {
          preHandler:
            adminOnly,
        },
        listAdminAppointmentsController,
      );

      /*
       * Confirma uma solicitação.
       *
       * PATCH
       * /api/v1/admin/appointments/:appointmentId/confirm
       *
       * PENDING_APPROVAL
       * ↓
       * CONFIRMED
       */
      app.patch(
        "/:appointmentId/confirm",
        {
          preHandler:
            adminOnly,
        },
        confirmAdminAppointmentController,
      );

      /*
       * Recusa uma solicitação.
       *
       * PATCH
       * /api/v1/admin/appointments/:appointmentId/reject
       *
       * Body:
       *
       * {
       *   "rejectionReason":
       *     "Não consigo atender neste horário."
       * }
       *
       * PENDING_APPROVAL
       * ↓
       * REJECTED
       */
      app.patch(
        "/:appointmentId/reject",
        {
          preHandler:
            adminOnly,
        },
        rejectAdminAppointmentController,
      );
    };