import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiV1Router from './routes/index';

export function createApp() {
  const app = express();
  app.use(cookieParser());

  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  app.use(express.json());
  app.use('/api/v1', apiV1Router);
  return app;
}
