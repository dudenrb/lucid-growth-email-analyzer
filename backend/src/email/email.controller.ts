import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { cfg } from '../common/config';

@Controller('api')
export class EmailController {
  constructor(private readonly svc: EmailService) {}

  @Get('config')
  info() {
    return {
      testAddress: cfg.testAddress,
      subjectToken: cfg.subjectToken,
    };
  }

  @Get('emails')
  list(@Query('limit') limit = '20') {
    return this.svc.list(parseInt(limit, 10));
  }

  @Get('emails/latest')
  latest() {
    return this.svc.latestBySubjectToken();
  }
}
