export type ReportPeriod = {
  startDate: string;
  endDate: string;
};

export type ReportMetrics = {
  totalAppointments: number;
  pendingApproval: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  rejected: number;

  revenueCents: number;
};

export type ReportServiceItem = {
  serviceId: string;
  serviceName: string;

  appointments: number;
  completed: number;

  revenueCents: number;
};

export type AdminReportSummary = {
  period: ReportPeriod;

  metrics: ReportMetrics;

  services: ReportServiceItem[];

  generatedAt: string;
};