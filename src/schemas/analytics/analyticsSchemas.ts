import { z } from "zod";

import { ANALYTICS_DATE_RANGE_OPTIONS } from "@/constants/analytics";

export const analyticsDateRangeSchema = z.coerce
  .number()
  .int()
  .refine((value) => ANALYTICS_DATE_RANGE_OPTIONS.includes(value as (typeof ANALYTICS_DATE_RANGE_OPTIONS)[number]), {
    message: "Invalid date range",
  })
  .default(30)
  .transform((value) => value as (typeof ANALYTICS_DATE_RANGE_OPTIONS)[number]);

export const analyticsFiltersSchema = z.object({
  days: analyticsDateRangeSchema,
});

export type AnalyticsFiltersInput = z.infer<typeof analyticsFiltersSchema>;
