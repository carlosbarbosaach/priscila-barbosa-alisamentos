"use client";

import { useQuery } from "@tanstack/react-query";

import { getAllClientServicePrices } from "../client-service-prices.api";

export const allClientServicePricesQueryKey = [
    "admin",
    "client-service-prices",
] as const;

export function useAllClientServicePrices() {
    return useQuery({
        queryKey: allClientServicePricesQueryKey,
        queryFn: getAllClientServicePrices,
    });
}