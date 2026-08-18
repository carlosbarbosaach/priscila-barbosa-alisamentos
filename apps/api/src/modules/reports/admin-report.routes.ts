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
  getAdminReportSummaryController,
} from "./admin-report.controller.js";

const adminOnly = [
  authenticate,

  requireRole([
    USER_ROLES.ADMIN,
  ]),
];

export const adminReportRoutes:
  FastifyPluginAsync =
    async (app) => {
      /*
       * GET
       *
       * /api/v1/admin/reports/summary
       *
       * Query:
       *
       * ?startDate=2026-08-01
       * &endDate=2026-08-18
       */
      app.get(
        "/summary",
        {
          preHandler:
            adminOnly,
        },
        getAdminReportSummaryController,
      );
    };