import type { QuestionInput } from "../types/createPoll.types";

interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validatePoll(
    title: string,
    expiresAt: string,
    questions: QuestionInput[]
): ValidationResult {
    if (!title.trim()) {
        return {
            isValid: false,
            error: "Title is required",
        };
    }

    if (!expiresAt) {
        return {
            isValid: false,
            error: "Expiry date is required",
        };
    }

    if (new Date(expiresAt) <= new Date()) {
        return {
            isValid: false,
            error: "Expiry must be in the future",
        };
    }

    for (const question of questions) {
        if (!question.questionText.trim()) {
            return {
                isValid: false,
                error: "All questions need text",
            };
        }

        if (question.options.length < 2) {
            return {
                isValid: false,
                error: "Each question needs at least 2 options",
            };
        }

        if (
            question.options.some(
                (option) => !option.optionText.trim()
            )
        ) {
            return {
                isValid: false,
                error: "All options need text",
            };
        }
    }

    return {
        isValid: true,
    };
}