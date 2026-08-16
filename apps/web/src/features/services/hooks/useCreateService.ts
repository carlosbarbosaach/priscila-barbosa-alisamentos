"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";



import { servicesQueryKey } from "../../services/hooks/useServices";
import { createService, CreateServiceInput } from "../../services/services.api";

export function useCreateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            input: CreateServiceInput,
        ) => createService(input),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: servicesQueryKey,
            });
        },
    });
}