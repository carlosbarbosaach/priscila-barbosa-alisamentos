"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    getClientBookableServices,
} from "../appointments.api";

export const clientBookableServicesQueryKey =
    [
        "client",
        "bookable-services",
    ] as const;

export function useClientBookableServices() {
    return useQuery({
        queryKey:
            clientBookableServicesQueryKey,

        queryFn:
            getClientBookableServices,
    });
}