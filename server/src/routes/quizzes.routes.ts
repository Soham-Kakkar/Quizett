import { 
        checkQuizExists, 
        createQuiz, 
        questionCount, 
        registerForQuiz,
        submitScore,
        getLeaderboard
    } from "@/controllers/quiz.controller";
import { Router } from "express";

const router = Router();

router.get('/exists', checkQuizExists);
router.post('/create', createQuiz);
router.get('/:quizId/count', questionCount);
router.post('/:quizId/register', registerForQuiz);
router.post('/:quizId/score', submitScore);
router.get('/:quizId/leaderboard', getLeaderboard);

export default router;