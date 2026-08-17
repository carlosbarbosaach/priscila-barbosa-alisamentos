"use client";

import { useQuery } from "@tanstack/react-query";

import { getClients } from "../clients.api";

export const clientsQueryKey = [
    "admin",
    "clients",
] as const;

export function useClients() {
    return useQuery({
        queryKey: clientsQueryKey,
        queryFn: getClients,
    });
}