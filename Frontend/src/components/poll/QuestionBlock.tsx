import type { Question } from "../../types/pollRespond.types";

export interface QuestionBlockProps {
  question: Question;
  index: number;
  selectedAnswer?: string;
  fieldError?: string;
  isSignedIn: boolean;
  isAnonymous: boolean;
  onSelect: (
    questionId: string,
    optionId: string
  ) => void;
}

