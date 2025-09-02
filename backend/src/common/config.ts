import * as dotenv from 'dotenv';
dotenv.config();

export const cfg = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI!,
  imap: {
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT || '993', 10),
    secure: process.env.IMAP_SECURE === 'true',
    user: process.env.IMAP_USER!,
    pass: process.env.IMAP_PASS!,
    mailbox: process.env.MAILBOX || 'INBOX',
  },
  subjectToken: process.env.SUBJECT_TOKEN || 'NIK TEST',
  testAddress: process.env.TEST_ADDRESS || process.env.IMAP_USER!,
};
