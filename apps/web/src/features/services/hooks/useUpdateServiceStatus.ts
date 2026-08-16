"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";


import { servicesQueryKey } from "../../services/hooks/useServices";
import { updateServiceStatus } from "../../services/services.api";

type UpdateServiceStatusVariables = {
    serviceId: string;
    active: boolean;
};

export function useUpdateServiceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            serviceId,
            active,
        }: UpdateServiceStatusVariables) =>
            updateServiceStatus(
                serviceId,
                active,
            ),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: servicesQueryKey,
            });
        },
    });
}