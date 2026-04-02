// quiz.controller.ts

import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import quizzesData from '../../quizzes.json';
import path from 'path';
import fs from 'fs';
import { Quizzes } from '@/utils/quiz';

const quizzes = quizzesData as Quizzes;
const quizzesFile = path.resolve(__dirname, '../../quizzes.json');
export const createQuiz = (req: Request, res: Response) => {
    try {
        const questions = req.body.questions;
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Questions are required and must be a non-empty array' });
        }

        const data = fs.readFileSync(quizzesFile, 'utf8');
        const quizId = nanoid(8);
        quizzes[quizId as keyof typeof quizzes] = questions;
        fs.writeFileSync(quizzesFile, JSON.stringify(quizzes, null, 2), 'utf8');

        res.status(201).json({ message: 'Quiz created successfully', quizId });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Error creating quiz' });
    }
};