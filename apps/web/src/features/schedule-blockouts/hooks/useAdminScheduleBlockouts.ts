"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminScheduleBlockouts,
} from "../schedule-blockouts.api";

type UseAdminScheduleBlockoutsInput = {
  dateKey:
    string | null;
};

export function useAdminScheduleBlockouts(
  input:
    UseAdminScheduleBlockoutsInput,
) {
  return useQuery({
    queryKey: [
      "admin",
      "schedule-blockouts",
      input.dateKey,
    ],

    queryFn: () =>
      getAdminScheduleBlockouts(
        input.dateKey!,
      ),

    /*
     * Não fazemos request enquanto
     * uma data ainda não tiver sido
     * escolhida.
     */
    enabled:
      Boolean(
        input.dateKey,
      ),
  });
}