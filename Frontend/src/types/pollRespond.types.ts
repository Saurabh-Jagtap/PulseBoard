export interface PollOption {
    id: string;
    optionText: string;
}

export interface Question {
    id: string;
    questionText: string;
    isMandatory: boolean;
    options: PollOption[];
}

export interface Poll {
    id: string;
    title: string;
    description?: string;
    isAnonymous: boolean;
    isPublished: boolean;
    isActive: boolean;
    questions: Question[];
    expiresAt: string;
}