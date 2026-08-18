export type DashboardMetrics = {
  appointmentsToday: number;

  pendingApproval: number;

  confirmedToday: number;

  cancelledToday: number;
};

export type DashboardPendingAppointment = {
  id: string;

  clientName: string;

  serviceName: string;

  startsAt: string;

  chargedPriceCents: number;
};

export type DashboardSummary = {
  metrics: DashboardMetrics;

  pendingAppointments:
    DashboardPendingAppointment[];

  timezone: string;

  generatedAt: string;
};