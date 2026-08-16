export type DashboardMetrics = {
    appointmentsToday: number;
    pendingApproval: number;
    confirmedToday: number;
    cancelledToday: number;
};

export type DashboardSummary = {
    metrics: DashboardMetrics;
    timezone: string;
    generatedAt: string;
};