import { ImapFlow } from 'imapflow';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,   // from .env
    port: Number(process.env.IMAP_PORT!),
    secure: process.env.IMAP_SECURE === 'true',
    auth: {
      user: process.env.IMAP_USER!,
      pass: process.env.IMAP_PASS!,
    },
    logger: false,
  });

  try {
    await client.connect();
    console.log("✅ IMAP connected successfully");
    await client.logout();
  } catch (err) {
    console.error("❌ IMAP connection error:", err);
  }
}

run();
