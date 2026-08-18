import {
  z,
} from "zod";

const dateKeySchema =
  z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "A data deve utilizar o formato YYYY-MM-DD.",
    );

export const adminReportQuerySchema =
  z.object({
    startDate:
      dateKeySchema,

    endDate:
      dateKeySchema,
  });

export type AdminReportQuery =
  z.infer<
    typeof adminReportQuerySchema
  >;