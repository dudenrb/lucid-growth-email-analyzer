// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
// import { EmailModule } from './email/email.module';
// import { HealthModule } from './health/health.module';
// import { appConfig } from './common/config';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
//     MongooseModule.forRoot(process.env.MONGO_URI as string),
//     EmailModule,
//     HealthModule,
//   ],
// })
// export class AppModule {}


import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lucidgrowth'),
    EmailModule,
  ],
})
export class AppModule {}
