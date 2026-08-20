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

import {
  createAdminScheduleBlockoutController,
  listAdminScheduleBlockoutsController,
  releaseAdminScheduleBlockoutController,
} from "./admin-schedule-blockout.controller.js";

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
     * LISTAR HORÁRIOS BLOQUEADOS
     * =================================
     */
    app.get(
      "/blockouts",
      {
        preHandler:
          adminOnly,
      },
      listAdminScheduleBlockoutsController,
    );

    /*
     * =================================
     * CRIAR BLOQUEIO MANUAL
     * =================================
     */
    app.post(
      "/blockouts",
      {
        preHandler:
          adminOnly,
      },
      createAdminScheduleBlockoutController,
    );

    /*
     * =================================
     * LIBERAR HORÁRIO
     * =================================
     */
    app.delete(
      "/blockouts",
      {
        preHandler:
          adminOnly,
      },
      releaseAdminScheduleBlockoutController,
    );

    /*
     * =================================
     * CONFIRMAR
     * =================================
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