// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug'] });

  // Allow CORS for your frontend domain (set FRONTEND_URL in Render/Vercel)
  const frontendUrl = process.env.FRONTEND_URL || '*';
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);
  Logger.log(`NestJS server listening on port ${port}`);
}
bootstrap();
