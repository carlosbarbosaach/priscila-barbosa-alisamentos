import type { DashboardSummary } from "@priscila/shared";

import { apiFetch } from "@/services/api/api-client";

export async function getDashboard(): Promise<DashboardSummary> {
    return apiFetch<DashboardSummary>(
        "/admin/dashboard/",
    );
}