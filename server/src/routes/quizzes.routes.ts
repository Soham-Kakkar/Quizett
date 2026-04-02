import { createQuiz } from "@/controllers/quiz.controller";
import { Router } from "express";

const router = Router();

router.post('/create', createQuiz);

export default router;