// quiz.controller.ts

import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import quizzesData from '../../quizzes.json';
import path from 'path';
import fs from 'fs';
import { Quizzes } from '@/utils/quiz';

const quizzes = quizzesData as Quizzes;
const quizzesFile = path.resolve(__dirname, '../../quizzes.json');
const leaderboardsFile = path.resolve(__dirname, '../../leaderboards.json');

export const checkQuizExists = (req: Request, res: Response) => {
  try {
    const quizId = req.query.quizId as string;
    if (!quizId) return res.status(400).json({ message: 'Quiz ID is required' });

    const quiz = quizzes[quizId as keyof typeof quizzes];
    
    if (!quiz) return res.json({ exists: false });
    return res.json({ exists: true });
  } catch (error) {
    console.error('Error checking quiz existence:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

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

export const questionCount = (req: Request, res: Response) => {
    try {
        const quizId = req.params.quizId;
        if (!quizId) return res.status(400).json({ message: 'Quiz ID is required' });
        const quiz = quizzes[quizId as keyof typeof quizzes];
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        res.json({ count: quiz.length });
    } catch (error) {
        console.error('Error fetching question count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const registerForQuiz = (req: Request, res: Response) => {
  try {
    const quizId = req.params.quizId as string;
    const userName = req.body.userName as string;

    if (!quizId) return res.status(400).json({ message: "Quiz ID is required" });
    if (!userName) return res.status(400).json({ message: "Username is required" });

    const quiz = quizzes[quizId];
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Read leaderboards.json and use it to store registered users and leaderboard entries
    let data = {} as any;
    try {
      const raw = fs.readFileSync(leaderboardsFile, 'utf8');
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      data = {};
    }

    if (!data[quizId]) data[quizId] = { users: [], entries: [] };

    if (data[quizId].users.some((u: any) => u.username === userName)) {
      return res.status(400).json({ message: 'User already registered for this quiz' });
    }

    data[quizId].users.push({ username: userName });
    fs.writeFileSync(leaderboardsFile, JSON.stringify(data, null, 2), 'utf8');

    res.status(201).json({ message: 'User registered successfully', quizId, userName });
  } catch (error) {
    console.error("Error registering for quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const submitScore = (req: Request, res: Response) => {
  try {
    const quizId = req.params.quizId as string;
    const { userName, answers } = req.body as { userName: string; answers: Record<string, string> };

    if (!quizId) return res.status(400).json({ message: 'Quiz ID is required' });
    if (!userName) return res.status(400).json({ message: 'Username is required' });
    if (!answers || typeof answers !== 'object') return res.status(400).json({ message: 'Answers are required' });

    const quiz = quizzes[quizId as keyof typeof quizzes];
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Read leaderboards
    let data = {} as any;
    try {
      const raw = fs.readFileSync(leaderboardsFile, 'utf8');
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      data = {};
    }

    if (!data[quizId]) data[quizId] = { users: [], entries: [] };

    // If user not registered, auto-register them
    if (!data[quizId].users.some((u: any) => u.username === userName)) {
      data[quizId].users.push({ username: userName });
    }

    // Compute raw score: server checks each submitted text answer against the canonical answer
    // Each question in quizzes may have a `points` property; default to 1 when unspecified.
    let rawScore = 0;
    for (const [qNumStr, given] of Object.entries(answers)) {
      const qIndex = parseInt(qNumStr, 10) - 1; // client uses 1-based numbering
      if (isNaN(qIndex) || qIndex < 0) continue;
      const q = quiz[qIndex];
      if (!q) continue;
      const points = (q as any).points && typeof (q as any).points === 'number' ? (q as any).points : 1;
      const givenTxt = String(given || '').trim().toLowerCase();
      const correctTxt = String(q.answer || '').trim().toLowerCase();
      if (givenTxt && givenTxt === correctTxt) rawScore += points;
    }

    const date = new Date().toISOString();

    // Determine baseline submission time for penalty. Use a recent baseline (last hour)
    // to avoid huge penalties from very old leaderboard entries.
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const nowTs = new Date(date).getTime();
    let firstTimestamp: number;
    if (Array.isArray(data[quizId].entries) && data[quizId].entries.length > 0) {
      // consider only entries within the last hour to compute baseline
      const recentTimes = data[quizId].entries
        .map((e: any) => new Date(e.date).getTime())
        .filter((t: number) => !isNaN(t) && nowTs - t <= ONE_HOUR_MS);
      if (recentTimes.length > 0) {
        firstTimestamp = Math.min(...recentTimes);
      } else {
        // no recent entries -> treat this submission as the first
        firstTimestamp = nowTs;
      }
    } else {
      firstTimestamp = nowTs;
    }

    const minutesLater = Math.max(0, (nowTs - firstTimestamp) / 60000);
    // use fractional minutes for penalty
    const normalized = rawScore - 0.5 * minutesLater;

    const entry = { username: userName, rawScore, normalized, date };
    data[quizId].entries.push(entry);

    // sort: normalized desc, then rawScore desc, then earliest date
    data[quizId].entries.sort((a: any, b: any) => {
      if (b.normalized !== a.normalized) return b.normalized - a.normalized;
      if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    // keep top 100
    data[quizId].entries = data[quizId].entries.slice(0, 100);

    fs.writeFileSync(leaderboardsFile, JSON.stringify(data, null, 2), 'utf8');

    res.json({ message: 'Score submitted', entry });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const getLeaderboard = (req: Request, res: Response) => {
  try {
    const quizId = req.params.quizId as string;
    if (!quizId) return res.status(400).json({ message: 'Quiz ID is required' });
    const quiz = quizzes[quizId as keyof typeof quizzes];
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let data = {} as any;
    try {
      const raw = fs.readFileSync(leaderboardsFile, 'utf8');
      data = raw ? JSON.parse(raw) : {};
    } catch (e) {
      data = {};
    }

    const entries = (data[quizId] && data[quizId].entries) ? data[quizId].entries : [];
    return res.json({ entries });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}