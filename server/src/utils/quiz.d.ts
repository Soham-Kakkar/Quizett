export interface Quiz {
    question: string;
    answer: string;
    hint?: string;
}

export interface Quizzes {
    [key: string]: Quiz[];
}