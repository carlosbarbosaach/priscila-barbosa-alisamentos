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
  completeAdminAppointmentController,
  confirmAdminAppointmentController,
  listAdminAppointmentsController,
  rejectAdminAppointmentController,
  startAdminAppointmentController,
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
       * GET
       * /api/v1/admin/appointments
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

      /*
       * CONFIRMED
       * ↓
       * IN_PROGRESS
       */
      app.patch(
        "/:appointmentId/start",
        {
          preHandler:
            adminOnly,
        },
        startAdminAppointmentController,
      );

      /*
       * IN_PROGRESS
       * ↓
       * COMPLETED
       */
      app.patch(
        "/:appointmentId/complete",
        {
          preHandler:
            adminOnly,
        },
        completeAdminAppointmentController,
      );
    };