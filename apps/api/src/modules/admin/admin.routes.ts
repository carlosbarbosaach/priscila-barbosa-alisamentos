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
} from "../reports/report.controller.js";

export const adminRoutes:
  FastifyPluginAsync =
  async (app) => {
    const adminOnly = [
      authenticate,

      requireRole([
        USER_ROLES.ADMIN,
      ]),
    ];

    /*
     * ==============================
     * ADMIN — PERFIL
     * ==============================
     */

    app.get(
      "/me",
      {
        preHandler:
          adminOnly,
      },
      async (
        request,
        reply,
      ) => {
        const appUser =
          request.appUser;

        if (!appUser) {
          return reply
            .status(403)
            .send({
              message:
                "Perfil administrativo não encontrado.",
            });
        }

        return {
          user:
            appUser,

          access: {
            area:
              "ADMIN",

            authorized:
              true,
          },
        };
      },
    );

    /*
     * ==============================
     * ADMIN — RELATÓRIOS
     * ==============================
     */

    app.get(
      "/reports/summary",
      {
        preHandler:
          adminOnly,
      },
      getAdminReportSummaryController,
    );
  };