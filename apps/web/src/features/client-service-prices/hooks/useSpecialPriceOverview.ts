"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    getSpecialPriceOverview,
} from "../client-service-prices.api";

export const specialPriceOverviewQueryKey = [
    "admin",
    "client-service-prices",
    "overview",
] as const;

export function useSpecialPriceOverview() {
    return useQuery({
        queryKey:
            specialPriceOverviewQueryKey,

        queryFn:
            getSpecialPriceOverview,
    });
}