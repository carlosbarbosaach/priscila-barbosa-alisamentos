"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    updateService,
    type UpdateServiceInput,
} from "../services.api";
import { servicesQueryKey } from "../../auth/hooks/useServices";


type UpdateServiceVariables = {
    serviceId: string;
    input: UpdateServiceInput;
};

export function useUpdateService() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            serviceId,
            input,
        }: UpdateServiceVariables) =>
            updateService(serviceId, input),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: servicesQueryKey,
            });
        },
    });
}