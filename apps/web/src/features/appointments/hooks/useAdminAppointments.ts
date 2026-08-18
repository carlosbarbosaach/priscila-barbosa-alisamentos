"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    getAdminAppointments,
} from "../appointments.api";

export const adminAppointmentsQueryKey = (
    dateKey: string,
) =>
    [
        "admin",
        "appointments",
        dateKey,
    ] as const;

export function useAdminAppointments(
    dateKey: string,
) {
    return useQuery({
        queryKey:
            adminAppointmentsQueryKey(
                dateKey,
            ),

        queryFn: () =>
            getAdminAppointments(
                dateKey,
            ),

        enabled:
            Boolean(
                dateKey,
            ),
    });
}