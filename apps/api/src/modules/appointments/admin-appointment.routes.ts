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
  async (
    app,
  ) => {
    /*
     * =================================
     * AGENDA DO DIA
     * =================================
     *
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
     * =================================
     * CONFIRMAR
     * =================================
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
     * =================================
     * RECUSAR
     * =================================
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

    /*
     * =================================
     * INICIAR
     * =================================
     *
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
     * =================================
     * CONCLUIR
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
     *   "finalPriceCents": 65000
     * }
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