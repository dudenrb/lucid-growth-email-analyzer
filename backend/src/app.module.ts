// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // reads .env in dev, and env vars in production
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lucidgrowth'),
    EmailModule,
    HealthModule,
  ],
})
export class AppModule {}
