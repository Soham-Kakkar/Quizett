import { checkAnswer, getQuestion } from "@/controllers/questions.controller";
import { Router } from "express";

const router = Router();

router.get('/:quizId/:questionNumber', getQuestion);
router.post('/:quizId/:questionNumber/answer', checkAnswer);

export default router;