import { z } from "zod";

export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(5, "Query must be at least 5 characters")
    .max(30, "Query cannot exceed 30 characters")
    .regex(/^[0-9+]+$/, "Query must only contain numbers and optional leading +"),
  type: z.enum(["bank_account", "whatsapp"]),
});

export type SearchInput = z.infer<typeof searchSchema>;

export const reportSubmissionSchema = z.object({
  identifierType: z.enum(["bank_account", "whatsapp"]),
  identifierValue: z.string().trim().min(5).max(30),
  bankName: z.string().trim().min(2).max(50).optional(),
  chronology: z.string().trim().min(20).max(2000),
  evidenceUrls: z
    .array(z.string().url())
    .min(1, "At least 1 evidence screenshot is required")
    .max(3, "Maximum 3 evidence screenshots allowed"),
});

export type ReportSubmissionInput = z.infer<typeof reportSubmissionSchema>;
