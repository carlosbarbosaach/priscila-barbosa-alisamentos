"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAppointmentAvailability,
} from "../appointments.api";

type UseAppointmentAvailabilityInput = {
  serviceId: string | null;

  dateKey: string | null;
};

export function useAppointmentAvailability(
  input: UseAppointmentAvailabilityInput,
) {
  return useQuery({
    queryKey: [
      "client",
      "appointment-availability",
      input.serviceId,
      input.dateKey,
    ],

    queryFn: () =>
      getAppointmentAvailability({
        serviceId:
          input.serviceId!,

        dateKey:
          input.dateKey!,
      }),

    /*
     * Não fazemos request enquanto
     * serviço e data não tiverem
     * sido escolhidos.
     */
    enabled:
      Boolean(
        input.serviceId &&
          input.dateKey,
      ),
  });
}