import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  frontendUri: process.env.FRONTEND_URI || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
};
