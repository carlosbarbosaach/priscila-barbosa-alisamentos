import cors from "@fastify/cors";
import Fastify from "fastify";

import {
  env,
} from "./config/env.js";

import {
  adminRoutes,
} from "./modules/admin/admin.routes.js";

import {
  adminAppointmentRoutes,
} from "./modules/appointments/admin-appointment.routes.js";

import {
  appointmentRoutes,
} from "./modules/appointments/appointment.routes.js";

import {
  authRoutes,
} from "./modules/auth/auth.routes.js";

import {
  clientServicePriceRoutes,
} from "./modules/client-service-prices/client-service-price.routes.js";

import {
  clientRoutes,
} from "./modules/clients/client.routes.js";

import {
  dashboardRoutes,
} from "./modules/dashboard/dashboard.routes.js";

import {
  serviceRoutes,
} from "./modules/services/service.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.decorateRequest(
    "authUser",
    null,
  );

  app.decorateRequest(
    "appUser",
    null,
  );

  app.register(
    cors,
    {
      origin:
        env.FRONTEND_ORIGIN,

      methods: [
        "GET",
        "HEAD",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ],

      allowedHeaders: [
        "Content-Type",
        "Authorization",
      ],
    },
  );

  app.get(
    "/health",
    async () => ({
      status:
        "ok",

      service:
        "priscila-barbosa-api",
    }),
  );

  /*
   * Autenticação.
   */
  app.register(
    authRoutes,
    {
      prefix:
        "/api/v1/auth",
    },
  );

  /*
   * Administração geral.
   */
  app.register(
    adminRoutes,
    {
      prefix:
        "/api/v1/admin",
    },
  );

  /*
   * Dashboard ADMIN.
   */
  app.register(
    dashboardRoutes,
    {
      prefix:
        "/api/v1/admin/dashboard",
    },
  );

  /*
   * Serviços ADMIN.
   */
  app.register(
    serviceRoutes,
    {
      prefix:
        "/api/v1/admin/services",
    },
  );

  /*
   * Clientes ADMIN.
   */
  app.register(
    clientRoutes,
    {
      prefix:
        "/api/v1/admin/clients",
    },
  );

  /*
   * Preços especiais ADMIN.
   */
  app.register(
    clientServicePriceRoutes,
    {
      prefix:
        "/api/v1/admin/clients",
    },
  );

  /*
   * Agenda ADMIN.
   *
   * GET
   * /api/v1/admin/appointments
   */
  app.register(
    adminAppointmentRoutes,
    {
      prefix:
        "/api/v1/admin/appointments",
    },
  );

  /*
   * Agenda CLIENT.
   *
   * GET
   * /api/v1/appointments/availability
   *
   * POST
   * /api/v1/appointments
   */
  app.register(
    appointmentRoutes,
    {
      prefix:
        "/api/v1/appointments",
    },
  );

  return app;
}