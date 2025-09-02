import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { cfg } from './common/config';
import { EmailModule } from './email/email.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [MongooseModule.forRoot(cfg.mongoUri), EmailModule],
  controllers: [HealthController],
})
export class AppModule {}
