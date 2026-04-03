export interface Quiz {
    id?: number;
    question: string;
    answer: string;
    hint?: string;
    points?: number;
}

export interface Quizzes {
    [key: string]: Quiz[];
}