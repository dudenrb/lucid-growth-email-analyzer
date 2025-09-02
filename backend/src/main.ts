import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { cfg } from './common/config';
import cors from 'cors'; // ✅ fixed import

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Enable CORS
  app.use(cors());

  await app.listen(cfg.port);
  console.log(`🚀 API running at http://localhost:${cfg.port}`);
}
bootstrap();
