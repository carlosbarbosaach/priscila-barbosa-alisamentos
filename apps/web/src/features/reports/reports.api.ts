import {
  apiFetch,
} from "@/services/api/api-client";

export type AdminReportMetrics = {
  totalAppointments: number;

  pendingApproval: number;

  confirmed: number;

  inProgress: number;

  completed: number;

  cancelled: number;

  rejected: number;

  revenueCents: number;
};

export type AdminReportService = {
  serviceId: string;

  serviceName: string;

  appointments: number;

  completed: number;

  revenueCents: number;
};

export type AdminReportSummary = {
  period: {
    startDate: string;

    endDate: string;
  };

  metrics:
    AdminReportMetrics;

  services:
    AdminReportService[];

  generatedAt: string;
};

export type GetAdminReportInput = {
  startDate: string;

  endDate: string;
};

export async function getAdminReport(
  input:
    GetAdminReportInput,
): Promise<AdminReportSummary> {
  const params =
    new URLSearchParams({
      startDate:
        input.startDate,

      endDate:
        input.endDate,
    });

  return apiFetch<AdminReportSummary>(
    `/admin/reports/summary?${params.toString()}`,
  );
}