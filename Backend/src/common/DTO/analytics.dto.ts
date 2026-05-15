import { z } from "zod";

// used to type the analytics query params if needed
export const analyticsQuerySchema = z.object({
  pollId: z.string(),
});

export type AnalyticsQueryDTO = z.infer<typeof analyticsQuerySchema>;