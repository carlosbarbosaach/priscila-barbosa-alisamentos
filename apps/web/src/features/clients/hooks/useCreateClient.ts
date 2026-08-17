"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createClient,
    type CreateClientInput,
} from "../clients.api";

import { clientsQueryKey } from "./useClients";

export function useCreateClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            input: CreateClientInput,
        ) => createClient(input),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: clientsQueryKey,
            });
        },
    });
}