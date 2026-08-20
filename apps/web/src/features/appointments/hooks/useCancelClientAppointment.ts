"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    cancelClientAppointment,
} from "../appointments.api";

import {
    clientAppointmentsQueryKey,
} from "./useClientAppointments";

export function useCancelClientAppointment() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn:
            cancelClientAppointment,

        onSuccess:
            async () => {
                /*
                 * Atualiza automaticamente:
                 *
                 * /cliente
                 * /cliente/agendamentos
                 *
                 * pois ambas utilizam
                 * useClientAppointments().
                 */
                await queryClient
                    .invalidateQueries({
                        queryKey:
                            clientAppointmentsQueryKey,
                    });
            },
    });
}