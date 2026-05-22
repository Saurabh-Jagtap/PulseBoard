export interface OptionSummary {
    optionId: string;
    optionText: string;
    count: number;
    percentage: number;
}
export interface QuestionSummary {
    questionId: string;
    questionText: string;
    isMandatory: boolean;
    options: OptionSummary[];
}
export interface AnalyticsData {
    pollId: string;
    title: string;
    totalResponses: number;
    isPublished: boolean;
    expiresAt: string;
    questions: QuestionSummary[];
}