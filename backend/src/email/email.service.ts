import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ImapFlow, FetchMessageObject } from 'imapflow';
import { Model } from 'mongoose';
import { EmailLog, EmailLogDocument } from './schema/email.schema';
import { detectESP } from './esp-detector';
import { extractReceivingChain, normalizeHeaders } from './parsers';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectModel(EmailLog.name) private emailModel: Model<EmailLogDocument>,
  ) {}

  getConfig() {
    return {
      subjectToken: this.config.get('subjectToken'),
      testAddress: this.config.get('testAddress'),
      mailbox: this.config.get('imap.mailbox'),
    };
  }

  /**
   * Connects to IMAP, searches for latest message containing SUBJECT_TOKEN,
   * extracts headers, receiving chain & ESP, stores in MongoDB.
   */
  async scanEmails() {
    const imap = new ImapFlow({
      host: this.config.get<string>('imap.host')!,
      port: this.config.get<number>('imap.port')!,
      secure: this.config.get<boolean>('imap.secure')!,
      auth: {
        user: this.config.get<string>('imap.user')!,
        pass: this.config.get<string>('imap.pass')!,
      },
      logger: false,
    });

    const mailbox = this.config.get<string>('imap.mailbox') || 'INBOX';
    const token = this.config.get<string>('subjectToken') || '';

    try {
      await imap.connect();
      await imap.mailboxOpen(mailbox);

      // 🔧 use sequence numbers (not UID)
      const seqs = await imap.search({ subject: token });
      if (!seqs || seqs.length === 0) {
        return { found: false, message: `No email found containing token "${token}".` };
      }

      const seq = seqs[seqs.length - 1]; // latest
      const { meta, source } = await this.fetchMessage(imap, seq);

      const headers = normalizeHeaders(meta.headers);
      const receivingChain = extractReceivingChain(headers);
      const esp = detectESP(meta.headers);

      const doc = await this.emailModel.create({
        subject: String(meta.subject || ''),
        from: String(meta.from?.text || ''),
        to: String(meta.to?.text || ''),
        headers: meta.headers,
        receivingChain,
        esp,
        raw: { id: meta.messageId, size: source.length },
      });

      return { found: true, storedId: doc._id, data: doc.toObject() };
    } catch (err) {
      this.logger.error('❌ Scan failed:', err);
      return { found: false, error: (err as Error).message };
    } finally {
      try {
        await imap.logout();
      } catch {}
    }
  }

  private async fetchMessage(imap: ImapFlow, seq: number) {
    const msg = (await imap.fetchOne(seq, {
      envelope: true,
      source: true,
      headers: true,
    })) as false | FetchMessageObject;

    if (!msg) throw new Error(`Message with sequence ${seq} not found`);

    const source = msg.source as Buffer;

    let headers: Record<string, any> = {};
    if (msg.headers && msg.headers instanceof Map) {
      headers = Object.fromEntries(
        Array.from(
          (msg.headers as unknown as Map<string, string[]>).entries(),
        ).map(([k, v]) => [k, v.length > 1 ? v : v[0]]),
      );
    }

    const meta = {
      subject: msg.envelope?.subject,
      from: {
        text: (msg.envelope?.from || []).map((a: any) => `${a.name || ''} <${a.address}>`).join(', '),
      },
      to: {
        text: (msg.envelope?.to || []).map((a: any) => `${a.name || ''} <${a.address}>`).join(', '),
      },
      messageId: msg.envelope?.messageId,
      headers,
    };

    return { meta, source };
  }

  async latest() {
    const doc = await this.emailModel.findOne().sort({ createdAt: -1 }).lean();
    return doc ?? null;
  }

  async all() {
    return this.emailModel.find().sort({ createdAt: -1 }).lean();
  }
}
