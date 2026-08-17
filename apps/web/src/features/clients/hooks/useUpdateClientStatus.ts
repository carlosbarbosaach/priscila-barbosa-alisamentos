"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { updateClientStatus } from "../clients.api";

import {
    clientsQueryKey,
} from "./useClients";

type UpdateClientStatusVariables = {
    clientId: string;
    active: boolean;
};

export function useUpdateClientStatus() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            clientId,
            active,
        }: UpdateClientStatusVariables) =>
            updateClientStatus(
                clientId,
                active,
            ),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey:
                    clientsQueryKey,
            });
        },
    });
}