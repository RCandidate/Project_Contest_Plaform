import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from "express";
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(
    '/api/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { message: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(
    '/api/auth/register',
    rateLimit({
      windowMs: 60 * 60 * 1000,
      max: process.env.NODE_ENV === 'production' ? 5 : 100,
      message: { message: 'Слишком много регистраций. Попробуйте через час.' },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(
    '/api/contact-messages',
    (req: any, res: any, next: any) => {
      if (req.method !== 'POST') return next();
      return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: { message: 'Слишком много запросов. Попробуйте позже.' },
        standardHeaders: true,
        legacyHeaders: false,
      })(req, res, next);
    },
  );
  const bankWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 20 : 200,
    message: { message: "Слишком много запросов. Попробуйте позже." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/bank", (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "POST") return next();
    return bankWriteLimiter(req, res, next);
  });
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: process.env.NODE_ENV === "production" ? 200 : 2000,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Backend running on port ${port}`);
}

bootstrap();
