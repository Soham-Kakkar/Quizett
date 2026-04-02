// questions.controller.ts

import { Request, Response } from 'express';
import quizzesData from '../../quizzes.json';
import { type Quizzes } from '../utils/quiz';

const quizzes = quizzesData as Quizzes;
export const getQuestion = (req: Request, res: Response) => {
    try {
        const quizId = req.params.quizId;
        const questionNumber = req.params.questionNumber;

        if (!quizId) return res.status(400).json({ message: 'Quiz ID is required' });

        if (!questionNumber) return res.status(400).json({ message: 'Question number is required' });

        const quiz = quizzes[quizId as keyof typeof quizzes];

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const qNum = parseInt(questionNumber as string);
        if (isNaN(qNum) || qNum < 1) return res.status(400).json({ message: 'Invalid question number' });
        const question = quiz[qNum - 1];

        if (!question) return res.status(404).json({ message: 'Question not found' });

        return res.json({ question: question.question, hint: question.hint ?? null });

    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkAnswer = (req: Request, res: Response) => {
    try {
        const quizId = req.params.quizId;
        const questionNumber = req.params.questionNumber;
        const { answer } = req.body;

        if (!quizId) return res.status(400).json({ message: 'Quiz ID is required' });

        if (!questionNumber) return res.status(400).json({ message: 'Question number is required' });

        if (!answer) return res.status(400).json({ message: 'Answer is required' });
        
        const quiz = quizzes[quizId as keyof typeof quizzes];

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const qNum = parseInt(questionNumber as string);
        if (isNaN(qNum) || qNum < 1) return res.status(400).json({ message: 'Invalid question number' });
        const question = quiz[qNum - 1];

        if (!question) return res.status(404).json({ message: 'Question not found' });

        const isCorrect = question.answer.toLowerCase() === answer.toLowerCase();

        res.json({ correct: isCorrect });

    } catch (error) {
        console.error('Error checking answer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}