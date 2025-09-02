// src/email/email.controller.ts
import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('latest')
  async latest() {
    // return a sample or real latest parsed email
    return this.emailService.getLatestParsedEmail();
  }
}
