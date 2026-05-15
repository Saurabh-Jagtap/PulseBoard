import { z } from "zod";

const answerSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
});

export const submitResponseSchema = z.object({
  answers: z
    .array(answerSchema)
    .min(1, "At least one answer is required")
    .refine(
      (arr) => new Set(arr.map((a) => a.questionId)).size === arr.length,
      { message: "Each question can only be answered once" }
    ),
  sessionToken: z.string().optional(),
});

export type SubmitResponseDTO = z.infer<typeof submitResponseSchema>;