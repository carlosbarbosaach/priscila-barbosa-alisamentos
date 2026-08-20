"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    getServices,
} from "../services.api";

export const servicesQueryKey = [
    "admin",
    "services",
] as const;

export function useServices() {
    return useQuery({
        queryKey:
            servicesQueryKey,

        queryFn:
            getServices,
    });
}