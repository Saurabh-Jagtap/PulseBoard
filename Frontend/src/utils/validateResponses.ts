import type { Poll } from "../types/pollRespond.types";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateResponses(
  poll: Poll,
  answers: Record<string, string>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const question of poll.questions) {
    if (
      question.isMandatory &&
      !answers[question.id]
    ) {
      errors[question.id] =
        "This question is required";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}