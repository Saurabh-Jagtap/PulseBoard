export interface OptionInput {
  optionText: string;
  displayOrder: number;
}

export interface QuestionInput {
  questionText: string;
  isMandatory: boolean;
  displayOrder: number;
  options: OptionInput[];
}
