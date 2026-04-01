import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '@/config';
import questionsRouter from '@/routes/questions.routes';
import errorHandler from '@/middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.frontendUri ?? 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.set('trust proxy', 1);

app.use('/questions', questionsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});