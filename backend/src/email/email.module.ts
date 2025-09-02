// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { EmailController } from './email.controller';
// import { EmailService } from './email.service';
// import { EmailLog, EmailLogSchema } from './schema/email.schema';

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: EmailLog.name, schema: EmailLogSchema }]),
//   ],
//   controllers: [EmailController],
//   providers: [EmailService],
// })
// export class EmailModule {}











import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { Email, EmailSchema } from './schema/email.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }])],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
