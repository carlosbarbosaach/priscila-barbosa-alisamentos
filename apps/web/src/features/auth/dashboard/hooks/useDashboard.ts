"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../services/dashboard.api";

export const dashboardQueryKey = [
    "admin",
    "dashboard",
] as const;

export function useDashboard() {
    return useQuery({
        queryKey: dashboardQueryKey,
        queryFn: getDashboard,
    });
}