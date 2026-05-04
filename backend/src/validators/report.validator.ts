import { z } from "zod";

export const reportSettingSchema = z.object({
  isEnabled: z.boolean().default(true),
});

export const updateReportSettingSchema = reportSettingSchema.partial();

export type UpdateReportSettingType = z.infer<typeof updateReportSettingSchema>;

export const generateManualReportSchema = z.object({
  email: z.string().email().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type GenerateManualReportType = z.infer<typeof generateManualReportSchema>;
