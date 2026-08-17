"use client";

import { useQuery } from "@tanstack/react-query";

import { getClientServicePrices } from "../client-service-prices.api";

export function clientServicePricesQueryKey(
    clientId: string,
) {
    return [
        "admin",
        "clients",
        clientId,
        "service-prices",
    ] as const;
}

export function useClientServicePrices(
    clientId: string,
    enabled = true,
) {
    return useQuery({
        queryKey:
            clientServicePricesQueryKey(
                clientId,
            ),

        queryFn: () =>
            getClientServicePrices(
                clientId,
            ),

        enabled:
            Boolean(clientId) &&
            enabled,
    });
}