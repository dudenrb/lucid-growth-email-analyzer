import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') || 4000);

  app.enableCors({
    origin:
      config.get('CORS_ORIGIN')?.split(',').map((s: string) => s.trim()) ?? true,
    credentials: true,
  });

  // 👇 Add this to see actual errors in the console
  app.useGlobalFilters({
    catch(exception: any, host: any) {
      console.error('Unhandled Exception:', exception);
      throw exception;
    },
  } as any);

  await app.listen(port);
  console.log(`API running on :${port}`);
}
bootstrap();
