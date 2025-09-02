import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './schema/email.schema';
import { cfg } from '../common/config';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { detectEsp } from './esp-detector';
import { normalizeHeaders, parseReceivingChain } from './parsers';

@Injectable()
export class EmailService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(EmailService.name);
  private client!: ImapFlow;

  async getLatestParsedEmail() {
    // TODO: implement logic
    // Example placeholder
    return { message: 'Latest parsed email not yet implemented' };
  }
  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {}

async onModuleInit() {
  await this.connectImap();
  await this.fetchRecent();   // fetch last 10 emails on startup
  this.startIdle();
}

  // Fetch recent emails after connecting to IMAP
  private async fetchRecent() {
    try {
      const lock = await this.client.getMailboxLock(cfg.imap.mailbox);
      try {
        // Fetch last 10 messages
        const exists = this.client.mailbox && typeof this.client.mailbox === 'object' && 'exists' in this.client.mailbox
          ? (this.client.mailbox as any).exists
          : 0;
        if (exists > 0) {
          const seq = `${Math.max(1, exists - 9)}:${exists}`;
          const fetched = await this.client.fetch(seq, {
            source: true,
            envelope: true,
            internalDate: true,
          });
          for await (const f of fetched) await this.handleMessage(f);
        }
      } finally {
        lock.release();
      }
    } catch (err) {
      this.log.error('❌ fetchRecent error', err);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client?.logout();
    } catch {}
  }

  private async connectImap() {
    this.client = new ImapFlow({
      host: cfg.imap.host,
      port: cfg.imap.port,
      secure: cfg.imap.secure,
      auth: { user: cfg.imap.user, pass: cfg.imap.pass },
      logger: false,
    });

    try {
      await this.client.connect();
      await this.client.mailboxOpen(cfg.imap.mailbox);
      this.log.log(
        `✅ IMAP connected -> ${cfg.imap.user}/${cfg.imap.mailbox}`,
      );
    } catch (err) {
      throw new Error(`IMAP connection failed: ${String(err)}`);
    }
  }

  private startIdle() {
    (async () => {
      this.client.on('exists', async () => {
        const lock = await this.client.getMailboxLock(cfg.imap.mailbox);
        try {
          if (
            this.client.mailbox &&
            typeof this.client.mailbox === 'object' &&
            'exists' in this.client.mailbox
          ) {
            const { exists } = this.client.mailbox;
            const seq = `${exists}:*`;
            const fetched = await this.client.fetch(seq, {
              source: true,
              envelope: true,
              internalDate: true,
            });
            for await (const f of fetched) await this.handleMessage(f);
          }
        } finally {
          lock.release();
        }
      });

      try {
        await this.client.idle();
      } catch (err) {
        this.log.error('❌ IMAP idle loop error', err);
      }
    })().catch((e) => this.log.error('❌ idle loop crash', e));
  }

  private async handleMessage(f: any) {
    try {
      const source = f.source as Buffer;
      const parsed = await simpleParser(source);
      const subject = parsed.subject || '';
      this.log.debug(`Processing subject: ${parsed.subject}`);

      if (!subject.includes(cfg.subjectToken)) return;

      // normalize addresses
      const from =
        (parsed.from as any)?.text ||
        ((parsed.from as any)?.value
          ?.map((v: any) => v.address)
          .join(', ') ?? '');

      const to =
        (parsed.to as any)?.text ||
        ((parsed.to as any)?.value
          ?.map((v: any) => v.address)
          .join(', ') ?? '');

      const headersRaw = parsed.headerLines
        .map(
          (h: { key: string; line: string }) =>
            `${h.key}: ${h.line.replace(/^[^:]+:\s*/, '')}`,
        )
        .join('\r\n');

      const headers = normalizeHeaders(headersRaw);
      const received = headers['received'] || [];
      const chain = parseReceivingChain(received);
      const espType = detectEsp(headers);

      const doc = await this.emailModel.create({
        messageId: parsed.messageId,
        from,
        to,
        subject,
        date: parsed.date?.toISOString?.(),
        receivingChain: chain,
        espType,
        mailbox: cfg.imap.mailbox,
        rawHeaders: headersRaw,
      });

      this.log.log(
        `📩 Stored test email: ${doc._id} | ESP=${espType} | hops=${chain.length}`,
      );
    } catch (e: any) {
      this.log.error('❌ handleMessage error', e);
      await this.emailModel.create({ error: String(e) });
    }
  }

  async list(limit = 20) {
    return this.emailModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async latestBySubjectToken() {
    return this.emailModel
      .findOne({ subject: { $regex: cfg.subjectToken, $options: 'i' } })
      .sort({ createdAt: -1 })
      .lean();
  }
}
