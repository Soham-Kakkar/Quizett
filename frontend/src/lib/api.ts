export interface Quiz {
  question: string;
  answer: string;
  hint?: string;
}

export interface Quizzes {
  [key: string]: Quiz[];
}

const API_BASE = 'http://localhost:5000';

const headers = {
  'Content-Type': 'application/json',
};

export async function checkQuizExists(quizId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/quizzes/exists?quizId=${encodeURIComponent(quizId)}`, { headers });
  if (!response.ok) throw new Error(`Failed to check quiz existence for quiz: ${quizId}`);
  const data = await response.json();
  return data.exists;
}

export async function createQuiz(questions: Quiz[]): Promise<{ quizId: string }> {
  const response = await fetch(`${API_BASE}/quizzes/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ questions }),
  });
  if (!response.ok) throw new Error('Failed to create quiz');
  return response.json();
}

// Returns { count: number }
export async function getQuestionCount(quizId: string): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE}/quizzes/${quizId}/count`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch question count for quiz: ${quizId}`);
  return response.json();
}

// Returns { question: string, hint: string | null }
export async function getQuestion(quizId: string, questionNumber: number): Promise<{ question: string; hint: string | null }> {
  const response = await fetch(`${API_BASE}/questions/${quizId}/${questionNumber}`, { headers });
  if (!response.ok) throw new Error(`Failed to fetch question: ${questionNumber} of quiz: ${quizId}`);
  return response.json();
}

// Expects { answer: string } in body. Returns { correct: boolean, message?: string }
export async function checkAnswer(quizId: string, questionNumber: number, answer: string): Promise<{ correct: boolean, rawScore?: number, message?: string }> {
  const response = await fetch(`${API_BASE}/questions/${quizId}/${questionNumber}/answer`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ answer }),
  });
  if (!response.ok) throw new Error(`Failed to check answer for question: ${questionNumber} of quiz: ${quizId}`);
  return response.json();
}

export async function registerUser(quizId: string, userName: string): Promise<{ message: string, quizId: string, userName: string }> {
  const response = await fetch(`${API_BASE}/quizzes/${encodeURIComponent(quizId)}/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userName }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Registration failed' }));
    const status = response.status;
    throw Object.assign(new Error(err.message || 'Registration failed'), { status });
  }
  return response.json();
}

export async function submitScoreApi(quizId: string, userName: string, answers: Record<string, string>): Promise<{ message: string; rawScore: number; normalized: number }> {
  const response = await fetch(`${API_BASE}/quizzes/${encodeURIComponent(quizId)}/score`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userName, answers }),
  });
  if (!response.ok) throw new Error('Failed to submit score');
  return response.json();
}

export async function getLeaderboardApi(quizId: string): Promise<{ entries: Array<{ username: string; rawScore: number; normalized: number; date: string }> }> {
  const response = await fetch(`${API_BASE}/quizzes/${encodeURIComponent(quizId)}/leaderboard`, { headers });
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
}
