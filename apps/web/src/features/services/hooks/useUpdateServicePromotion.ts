"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    updateServicePromotion,
    type UpdateServicePromotionInput,
} from "../services.api";

import {
    servicesQueryKey,
} from "./useServices";

type UpdateServicePromotionVariables = {
    serviceId:
        string;

    input:
        UpdateServicePromotionInput;
};

export function useUpdateServicePromotion() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            ({
                serviceId,
                input,
            }: UpdateServicePromotionVariables) =>
                updateServicePromotion(
                    serviceId,
                    input,
                ),

        onSuccess:
            async () => {
                /*
                 * Atualiza imediatamente
                 * a listagem de serviços
                 * do ADMIN.
                 */
                await queryClient
                    .invalidateQueries({
                        queryKey:
                            servicesQueryKey,
                    });

                /*
                 * Promoção também afeta
                 * os serviços apresentados
                 * para a cliente.
                 *
                 * Invalidamos consultas
                 * da área cliente sem
                 * depender do nome exato
                 * de cada subquery.
                 */
                await queryClient
                    .invalidateQueries({
                        queryKey: [
                            "client",
                        ],
                    });
            },
    });
}