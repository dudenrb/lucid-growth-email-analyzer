import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailsService {
  private emails = [
    {
      id: 1,
      subject: 'Welcome!',
      body: 'This is the first email in the system.',
      receivedAt: new Date('2025-09-01T09:00:00'),
    },
    {
      id: 2,
      subject: 'Weekly Update',
      body: 'Here is your weekly summary.',
      receivedAt: new Date('2025-09-02T10:30:00'),
    },
  ];

  findAll() {
    return this.emails;
  }

  findLatest() {
    if (this.emails.length === 0) {
      return { message: 'No emails available' };
    }
    return this.emails[this.emails.length - 1];
  }
}
