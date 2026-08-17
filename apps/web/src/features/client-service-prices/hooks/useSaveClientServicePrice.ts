"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    saveClientServicePrice,
    type SaveClientServicePriceInput,
} from "../client-service-prices.api";

import { clientServicePricesQueryKey } from "./useClientServicePrices";

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
            await queryClient.invalidateQueries({
                queryKey:
                    clientServicePricesQueryKey(
                        variables.clientId,
                    ),
            });
        },
    });
}