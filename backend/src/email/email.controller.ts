// import { Controller, Get, Post } from '@nestjs/common';
// import { EmailService } from './email.service';

// @Controller('email')
// export class EmailController {
//   constructor(private readonly emailService: EmailService) {}

//   @Get('config')
//   getConfig() {
//     return this.emailService.getConfig();
//   }

//   @Post('scan')
//   async scanEmails() {
//     return this.emailService.scanEmails();
//   }
//   @Get('latest')
//   async latest() {
//     return this.emailService.latest();
//   }

//   @Get('all')
//   async all() {
//     return this.emailService.all();
//   }
// }






// src/email/email.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('config')
  getConfig() {
    return {
      testAddress: process.env.TEST_ADDRESS || process.env.IMAP_USER || '',
      subjectToken: process.env.SUBJECT_TOKEN || '',
    };
  }

  @Post('scan')
  async scan() {
    return this.emailService.scanLatestEmail();
  }

  @Get('latest')
  async latest() {
    return this.emailService.getLatest();
  }

  @Get('all')
  async all() {
    return this.emailService.getAll();
  }
}
