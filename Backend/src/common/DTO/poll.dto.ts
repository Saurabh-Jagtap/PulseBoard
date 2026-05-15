import { z } from "zod";

const createOptionSchema = z.object({
  optionText: z.string().min(1, "Option text is required"),
  displayOrder: z.number().int().min(0),
});

const createQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  isMandatory: z.boolean().default(false),
  displayOrder: z.number().int().min(0),
  options: z
    .array(createOptionSchema)
    .min(2, "Each question needs at least 2 options"),
});

export const createPollSchema = z.object({
  title: z.string().min(3, "Title too short").max(200, "Title too long"),
  description: z.string().max(1000).optional(),
  isAnonymous: z.boolean().default(false),
  expiresAt: z.string().datetime({ message: "Invalid expiry datetime" }),
  questions: z.array(createQuestionSchema).min(1, "Add at least one question"),
});

export const updatePollSchema = createPollSchema.partial();

// inferred types —> used service function params and route handlers
export type CreatePollDTO = z.infer<typeof createPollSchema>;
export type UpdatePollDTO = z.infer<typeof updatePollSchema>;