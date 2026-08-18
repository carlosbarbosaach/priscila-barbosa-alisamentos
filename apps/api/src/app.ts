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
  adminReportRoutes,
} from "./modules/reports/admin-report.routes.js";

import {
  serviceRoutes,
} from "./modules/services/service.routes.js";

export function buildApp() {
  const app = Fastify({
    logger:
      true,
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

  /*
   * ==============================
   * HEALTH
   * ==============================
   */
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
   * ==============================
   * AUTENTICAÇÃO
   * ==============================
   */
  app.register(
    authRoutes,
    {
      prefix:
        "/api/v1/auth",
    },
  );

  /*
   * ==============================
   * ADMINISTRAÇÃO
   * ==============================
   */
  app.register(
    adminRoutes,
    {
      prefix:
        "/api/v1/admin",
    },
  );

  /*
   * ==============================
   * DASHBOARD ADMIN
   * ==============================
   */
  app.register(
    dashboardRoutes,
    {
      prefix:
        "/api/v1/admin/dashboard",
    },
  );

  /*
   * ==============================
   * RELATÓRIOS ADMIN
   * ==============================
   *
   * GET
   *
   * /api/v1/admin/reports/summary
   */
  app.register(
    adminReportRoutes,
    {
      prefix:
        "/api/v1/admin/reports",
    },
  );

  /*
   * ==============================
   * SERVIÇOS ADMIN
   * ==============================
   */
  app.register(
    serviceRoutes,
    {
      prefix:
        "/api/v1/admin/services",
    },
  );

  /*
   * ==============================
   * CLIENTES ADMIN
   * ==============================
   */
  app.register(
    clientRoutes,
    {
      prefix:
        "/api/v1/admin/clients",
    },
  );

  /*
   * ==============================
   * PREÇOS ESPECIAIS
   * ==============================
   */
  app.register(
    clientServicePriceRoutes,
    {
      prefix:
        "/api/v1/admin/clients",
    },
  );

  /*
   * ==============================
   * AGENDA ADMIN
   * ==============================
   */
  app.register(
    adminAppointmentRoutes,
    {
      prefix:
        "/api/v1/admin/appointments",
    },
  );

  /*
   * ==============================
   * AGENDA CLIENT
   * ==============================
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