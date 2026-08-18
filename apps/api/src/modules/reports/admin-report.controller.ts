import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  adminReportQuerySchema,
} from "./admin-report.schema.js";

import {
  AdminReportService,
} from "./admin-report.service.js";

const adminReportService =
  new AdminReportService();

function getSalonId(
  request:
    FastifyRequest,
): string | null {
  return (
    request.appUser
      ?.salonId ??
    null
  );
}

/*
 * GET
 *
 * /api/v1/admin/reports/summary
 *
 * ?startDate=2026-08-01
 * &endDate=2026-08-18
 */
export async function getAdminReportSummaryController(
  request:
    FastifyRequest,

  reply:
    FastifyReply,
) {
  const salonId =
    getSalonId(
      request,
    );

  if (!salonId) {
    return reply
      .status(403)
      .send({
        message:
          "Salão do usuário não identificado.",
      });
  }

  const parsedQuery =
    adminReportQuerySchema
      .safeParse(
        request.query,
      );

  if (
    !parsedQuery.success
  ) {
    return reply
      .status(400)
      .send({
        message:
          "Período do relatório inválido.",

        issues:
          parsedQuery
            .error
            .issues,
      });
  }

  try {
    const report =
      await adminReportService
        .getSummary({
          salonId,

          startDate:
            parsedQuery.data
              .startDate,

          endDate:
            parsedQuery.data
              .endDate,
        });

    return reply.send(
      report,
    );
  } catch (error) {
    if (
      error instanceof
        Error &&
      (
        error.message ===
          "Data inválida. Utilize o formato YYYY-MM-DD." ||
        error.message ===
          "A data inicial não pode ser posterior à data final."
      )
    ) {
      return reply
        .status(400)
        .send({
          message:
            error.message,
        });
    }

    throw error;
  }
}