import { Controller, Get } from '@nestjs/common';
import { EmailsService } from './email.service';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  // GET /emails → return all emails
  @Get()
  async getAllEmails() {
    return this.emailsService.findAll();
  }

  // GET /emails/latest → return the most recent email
  @Get('latest')
  async getLatestEmail() {
    return this.emailsService.findLatest();
  }
}
