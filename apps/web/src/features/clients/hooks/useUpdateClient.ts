"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    updateClient,
    type UpdateClientInput,
} from "../clients.api";

import {
    clientsQueryKey,
} from "./useClients";

type UpdateClientVariables = {
    clientId: string;
    input: UpdateClientInput;
};

export function useUpdateClient() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            clientId,
            input,
        }: UpdateClientVariables) =>
            updateClient(
                clientId,
                input,
            ),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey:
                    clientsQueryKey,
            });
        },
    });
}