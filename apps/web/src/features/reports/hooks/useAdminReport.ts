"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminReport,
} from "../reports.api";

type UseAdminReportInput = {
  startDate: string;

  endDate: string;
};

export function useAdminReport(
  input:
    UseAdminReportInput,
) {
  return useQuery({
    queryKey: [
      "admin",
      "reports",
      input.startDate,
      input.endDate,
    ],

    queryFn: () =>
      getAdminReport(
        input,
      ),
  });
}