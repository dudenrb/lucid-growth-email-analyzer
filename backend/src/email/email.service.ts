// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { InjectModel } from '@nestjs/mongoose';
// import { ImapFlow, FetchMessageObject } from 'imapflow';
// import { Model } from 'mongoose';
// import { EmailLog, EmailLogDocument } from './schema/email.schema';
// import { detectESP } from './esp-detector';
// import { extractReceivingChain, normalizeHeaders } from './parsers';

// @Injectable()
// export class EmailService {
//   private readonly logger = new Logger(EmailService.name);

//   constructor(
//     private readonly config: ConfigService,
//     @InjectModel(EmailLog.name) private emailModel: Model<EmailLogDocument>,
//   ) {}

//   getConfig() {
//     return {
//       subjectToken: this.config.get('subjectToken'),
//       testAddress: this.config.get('testAddress'),
//       mailbox: this.config.get('imap.mailbox'),
//     };
//   }

//   /**
//    * Connects to IMAP, searches for latest message containing SUBJECT_TOKEN,
//    * extracts headers, receiving chain & ESP, stores in MongoDB.
//    */
//   async scanEmails() {
//     const imap = new ImapFlow({
//       host: this.config.get<string>('imap.host')!,
//       port: this.config.get<number>('imap.port')!,
//       secure: this.config.get<boolean>('imap.secure')!,
//       auth: {
//         user: this.config.get<string>('imap.user')!,
//         pass: this.config.get<string>('imap.pass')!,
//       },
//       logger: false,
//     });

//     const mailbox = this.config.get<string>('imap.mailbox') || 'INBOX';
//     const token = this.config.get<string>('subjectToken') || '';

//     try {
//       await imap.connect();
//       await imap.mailboxOpen(mailbox);

//       // 🔧 use sequence numbers (not UID)
//       const seqs = await imap.search({ subject: token });
//       if (!seqs || seqs.length === 0) {
//         return { found: false, message: `No email found containing token "${token}".` };
//       }

//       const seq = seqs[seqs.length - 1]; // latest
//       const { meta, source } = await this.fetchMessage(imap, seq);

//       const headers = normalizeHeaders(meta.headers);
//       const receivingChain = extractReceivingChain(headers);
//       const esp = detectESP(meta.headers);

//       const doc = await this.emailModel.create({
//         subject: String(meta.subject || ''),
//         from: String(meta.from?.text || ''),
//         to: String(meta.to?.text || ''),
//         headers: meta.headers,
//         receivingChain,
//         esp,
//         raw: { id: meta.messageId, size: source.length },
//       });

//       return { found: true, storedId: doc._id, data: doc.toObject() };
//     } catch (err) {
//       this.logger.error('❌ Scan failed:', err);
//       return { found: false, error: (err as Error).message };
//     } finally {
//       try {
//         await imap.logout();
//       } catch {}
//     }
//   }

//   private async fetchMessage(imap: ImapFlow, seq: number) {
//     const msg = (await imap.fetchOne(seq, {
//       envelope: true,
//       source: true,
//       headers: true,
//     })) as false | FetchMessageObject;

//     if (!msg) throw new Error(`Message with sequence ${seq} not found`);

//     const source = msg.source as Buffer;

//     let headers: Record<string, any> = {};
//     if (msg.headers && msg.headers instanceof Map) {
//       headers = Object.fromEntries(
//         Array.from(
//           (msg.headers as unknown as Map<string, string[]>).entries(),
//         ).map(([k, v]) => [k, v.length > 1 ? v : v[0]]),
//       );
//     }

//     const meta = {
//       subject: msg.envelope?.subject,
//       from: {
//         text: (msg.envelope?.from || []).map((a: any) => `${a.name || ''} <${a.address}>`).join(', '),
//       },
//       to: {
//         text: (msg.envelope?.to || []).map((a: any) => `${a.name || ''} <${a.address}>`).join(', '),
//       },
//       messageId: msg.envelope?.messageId,
//       headers,
//     };

//     return { meta, source };
//   }

//   async latest() {
//     const doc = await this.emailModel.findOne().sort({ createdAt: -1 }).lean();
//     return doc ?? null;
//   }

//   async all() {
//     return this.emailModel.find().sort({ createdAt: -1 }).lean();
//   }
// }


// src/email/email.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { Email, EmailDocument } from './schema/email.schema';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private imap: Imap;

  // Read env once and validate
  private readonly IMAP_HOST: string;
  private readonly IMAP_USER: string;
  private readonly IMAP_PASS: string;
  private readonly IMAP_PORT: number;

  constructor(@InjectModel(Email.name) private emailModel: Model<EmailDocument>) {
    // Validate env vars early
    this.IMAP_HOST = process.env.IMAP_HOST as string;
    this.IMAP_USER = process.env.IMAP_USER as string;
    this.IMAP_PASS = process.env.IMAP_PASS as string;
    this.IMAP_PORT = Number(process.env.IMAP_PORT || '993');

    if (!this.IMAP_HOST || !this.IMAP_USER || !this.IMAP_PASS) {
      throw new Error(
        'Missing IMAP configuration. Ensure IMAP_HOST, IMAP_USER and IMAP_PASS are set.',
      );
    }

    // Create IMAP client (typed values)
    this.imap = new Imap({
  user: process.env.IMAP_USER || '',
  password: process.env.IMAP_PASS || '',
  host: process.env.IMAP_HOST || '',
  port: Number(process.env.IMAP_PORT) || 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }, // 👈 allow self-signed certs
});

  }

  // Helper: connect to IMAP (promise)
  private connectIMAP(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.logger.log('IMAP ready');
        resolve();
      });
      this.imap.once('error', (err: Error) => {
        this.logger.error('IMAP connection error', err);
        reject(err);
      });
      this.imap.connect();
    });
  }

  // Scan for latest matching test email (unseen or by subject token)
  async scanLatestEmail(): Promise<any> {
    // Optional subject token filtering
    const SUBJECT_TOKEN = process.env.SUBJECT_TOKEN || '';

    try {
      await this.connectIMAP();

      return await new Promise<any>((resolve, reject) => {
        // open mailbox (read-only false so we can fetch everything)
        this.imap.openBox('INBOX', false, (openErr: Error | null) => {
          if (openErr) {
            this.imap.end();
            this.logger.error('OpenBox error', openErr);
            return reject(openErr);
          }

          // Build search criteria
          // If SUBJECT_TOKEN provided, search header subject; else search ALL or UNSEEN
          const searchCriteria = SUBJECT_TOKEN ? [['HEADER', 'SUBJECT', SUBJECT_TOKEN]] : ['UNSEEN'];

          this.imap.search(searchCriteria as any, (searchErr: Error | null, results: number[]) => {
            if (searchErr) {
              this.imap.end();
              this.logger.error('IMAP search error', searchErr);
              return reject(searchErr);
            }

            if (!results || results.length === 0) {
              this.logger.log('No matching messages found');
              this.imap.end();
              return resolve({ found: false });
            }

            // pick latest sequence (highest number)
            const seq = results[results.length - 1];
            const f = this.imap.fetch(seq, { bodies: '' });

            f.on('message', (msg: any, seqno: number) => {
              msg.on('body', (stream: NodeJS.ReadableStream) => {
                // Use promise form of simpleParser to avoid callback typing mismatch
                (async () => {
                  try {
                    const parsed: ParsedMail = await simpleParser(stream as any);

                    const subject = parsed.subject || '';
                    const from = parsed.from?.text || '';
                    const to =
                      !parsed.to ? '' :
                        Array.isArray(parsed.to)
                          ? parsed.to.map((a) => a.text).join(', ')
                          : parsed.to.text;
                    const messageId = parsed.messageId || '';
                    const headersMap = parsed.headers instanceof Map ? parsed.headers : undefined;
                    const headersText = this.headersToText(headersMap);
                    const receivingChain = this.extractReceivingChain(headersText);
                    const esp = this.detectEsp(headersText, from);

                    // Prevent duplicates by messageId if available
                    if (messageId) {
                      const existing = await this.emailModel.findOne({ messageId }).lean();
                      if (existing) {
                        // return existing doc info (flag as duplicate)
                        this.logger.log('Message already stored (duplicate)');
                        await this.closeImapSafe();
                        return resolve({ found: true, duplicate: true, data: existing });
                      }
                    }

                    // Build new document
                    const doc = await this.emailModel.create({
                      subject,
                      from,
                      to,
                      messageId,
                      receivingChain,
                      esp,
                      raw: { id: messageId, size: parsed.text?.length || 0, headersText },
                      receivedAt: parsed.date ? new Date(parsed.date) : new Date(),
                    });

                    await this.closeImapSafe();
                    return resolve({ found: true, duplicate: false, data: doc.toObject() });
                  } catch (parseErr) {
                    this.logger.error('Error parsing message', parseErr);
                    await this.closeImapSafe();
                    return reject(parseErr);
                  }
                })();
              });
            });

            f.once('error', (fetchErr: Error) => {
              this.logger.error('Fetch error', fetchErr);
              this.imap.end();
              return reject(fetchErr);
            });

            f.once('end', () => {
              this.logger.log('Fetch end');
              // we'll close in parser or after resolve
            });
          });
        });
      });
    } catch (err: any) {
      this.logger.error('scanLatestEmail error', err);
      // if imap is still open, close gracefully
      await this.closeImapSafe();
      throw new InternalServerErrorException(err?.message || 'Scan failed');
    }
  }

  // Close imap safely if connected
  private async closeImapSafe(): Promise<void> {
    return new Promise((resolve) => {
      try {
        this.imap.once('end', () => resolve());
        try {
          this.imap.end();
        } catch {
          resolve();
        }
      } catch {
        resolve();
      }
    });
  }

  // Convert headers Map -> unfolded text
  private headersToText(hdrs?: Map<string, any>): string {
    if (!hdrs) return '';
    const out: string[] = [];
    hdrs.forEach((value: any, key: string) => {
      if (Array.isArray(value)) {
        value.forEach((v) => out.push(`${key}: ${v}`));
      } else {
        out.push(`${key}: ${value}`);
      }
    });
    return out.join('\r\n');
  }

  // Extract Received: blocks from raw headers text (returns array of hops)
  private extractReceivingChain(headersText: string): string[] {
    if (!headersText) return [];
    const lines = headersText.split(/\r?\n/);
    const blocks: string[] = [];
    let current: string | null = null;

    for (const line of lines) {
      if (/^received\s*:/i.test(line)) {
        if (current) blocks.push(current.trim());
        current = line;
      } else if (current && /^\s+/.test(line)) {
        current += ' ' + line.trim();
      } else {
        if (current) {
          blocks.push(current.trim());
          current = null;
        }
      }
    }
    if (current) blocks.push(current.trim());

    // shorten/normalize for display
    return blocks.map((b) => b.replace(/^received:\s*/i, '').trim()).reverse(); // reverse to show earliest first
  }

  // Simple heuristics to detect sender ESP
  private detectEsp(headersText: string, fromText: string): string {
    const h = (headersText || '').toLowerCase();
    const f = (fromText || '').toLowerCase();

    if (h.includes('sendgrid') || h.includes('x-sg-')) return 'SendGrid';
    if (h.includes('amazonses') || h.includes('x-amzn-')) return 'Amazon SES';
    if (h.includes('mailgun') || h.includes('x-mailgun')) return 'Mailgun';
    if (h.includes('sparkpost') || h.includes('x-msys')) return 'SparkPost';
    if (h.includes('zoho')) return 'Zoho';
    if (h.includes('postmark')) return 'Postmark';
    if (f.includes('gmail.com') || h.includes('google.com') || h.includes('x-gm-')) return 'Gmail';
    if (f.includes('outlook.com') || h.includes('office365') || h.includes('microsoft.com')) return 'Outlook/Office365';
    return 'Unknown';
  }

  // DB helpers
  async getLatest() {
    return this.emailModel.findOne().sort({ createdAt: -1 }).lean();
  }

  async getAll() {
    return this.emailModel.find().sort({ createdAt: -1 }).lean();
  }

  // alias used by some controllers
  async scanLatestTestEmail() {
    return this.scanLatestEmail();
  }
}
