"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    saveClientServicePrice,
    type SaveClientServicePriceInput,
} from "../client-service-prices.api";

import {
    allClientServicePricesQueryKey,
} from "./useAllClientServicePrices";

import {
    clientServicePricesQueryKey,
} from "./useClientServicePrices";

type SaveClientServicePriceVariables = {
    clientId: string;
    serviceId: string;
    input: SaveClientServicePriceInput;
};

export function useSaveClientServicePrice() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            clientId,
            serviceId,
            input,
        }: SaveClientServicePriceVariables) =>
            saveClientServicePrice(
                clientId,
                serviceId,
                input,
            ),

        onSuccess: async (
            _price,
            variables,
        ) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey:
                        clientServicePricesQueryKey(
                            variables.clientId,
                        ),
                }),

                queryClient.invalidateQueries({
                    queryKey:
                        allClientServicePricesQueryKey,
                }),
            ]);
        },
    });
}