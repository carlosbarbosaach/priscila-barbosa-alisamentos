"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    getClientAppointments,
} from "../appointments.api";

export const clientAppointmentsQueryKey =
    [
        "client",
        "appointments",
    ] as const;

export function useClientAppointments() {
    return useQuery({
        queryKey:
            clientAppointmentsQueryKey,

        queryFn:
            getClientAppointments,
    });
}