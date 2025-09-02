"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
const email_schema_1 = require("./schema/email.schema");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let EmailService = EmailService_1 = class EmailService {
    constructor(emailModel) {
        this.emailModel = emailModel;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.IMAP_HOST = process.env.IMAP_HOST;
        this.IMAP_USER = process.env.IMAP_USER;
        this.IMAP_PASS = process.env.IMAP_PASS;
        this.IMAP_PORT = Number(process.env.IMAP_PORT || '993');
        if (!this.IMAP_HOST || !this.IMAP_USER || !this.IMAP_PASS) {
            throw new Error('Missing IMAP configuration. Ensure IMAP_HOST, IMAP_USER and IMAP_PASS are set.');
        }
        this.imap = new imap_1.default({
            user: process.env.IMAP_USER || '',
            password: process.env.IMAP_PASS || '',
            host: process.env.IMAP_HOST || '',
            port: Number(process.env.IMAP_PORT) || 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
        });
    }
    connectIMAP() {
        return new Promise((resolve, reject) => {
            this.imap.once('ready', () => {
                this.logger.log('IMAP ready');
                resolve();
            });
            this.imap.once('error', (err) => {
                this.logger.error('IMAP connection error', err);
                reject(err);
            });
            this.imap.connect();
        });
    }
    async scanLatestEmail() {
        const SUBJECT_TOKEN = process.env.SUBJECT_TOKEN || '';
        try {
            await this.connectIMAP();
            return await new Promise((resolve, reject) => {
                this.imap.openBox('INBOX', false, (openErr) => {
                    if (openErr) {
                        this.imap.end();
                        this.logger.error('OpenBox error', openErr);
                        return reject(openErr);
                    }
                    const searchCriteria = SUBJECT_TOKEN ? [['HEADER', 'SUBJECT', SUBJECT_TOKEN]] : ['UNSEEN'];
                    this.imap.search(searchCriteria, (searchErr, results) => {
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
                        const seq = results[results.length - 1];
                        const f = this.imap.fetch(seq, { bodies: '' });
                        f.on('message', (msg, seqno) => {
                            msg.on('body', (stream) => {
                                (async () => {
                                    try {
                                        const parsed = await (0, mailparser_1.simpleParser)(stream);
                                        const subject = parsed.subject || '';
                                        const from = parsed.from?.text || '';
                                        const to = !parsed.to ? '' :
                                            Array.isArray(parsed.to)
                                                ? parsed.to.map((a) => a.text).join(', ')
                                                : parsed.to.text;
                                        const messageId = parsed.messageId || '';
                                        const headersMap = parsed.headers instanceof Map ? parsed.headers : undefined;
                                        const headersText = this.headersToText(headersMap);
                                        const receivingChain = this.extractReceivingChain(headersText);
                                        const esp = this.detectEsp(headersText, from);
                                        if (messageId) {
                                            const existing = await this.emailModel.findOne({ messageId }).lean();
                                            if (existing) {
                                                this.logger.log('Message already stored (duplicate)');
                                                await this.closeImapSafe();
                                                return resolve({ found: true, duplicate: true, data: existing });
                                            }
                                        }
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
                                    }
                                    catch (parseErr) {
                                        this.logger.error('Error parsing message', parseErr);
                                        await this.closeImapSafe();
                                        return reject(parseErr);
                                    }
                                })();
                            });
                        });
                        f.once('error', (fetchErr) => {
                            this.logger.error('Fetch error', fetchErr);
                            this.imap.end();
                            return reject(fetchErr);
                        });
                        f.once('end', () => {
                            this.logger.log('Fetch end');
                        });
                    });
                });
            });
        }
        catch (err) {
            this.logger.error('scanLatestEmail error', err);
            await this.closeImapSafe();
            throw new common_1.InternalServerErrorException(err?.message || 'Scan failed');
        }
    }
    async closeImapSafe() {
        return new Promise((resolve) => {
            try {
                this.imap.once('end', () => resolve());
                try {
                    this.imap.end();
                }
                catch {
                    resolve();
                }
            }
            catch {
                resolve();
            }
        });
    }
    headersToText(hdrs) {
        if (!hdrs)
            return '';
        const out = [];
        hdrs.forEach((value, key) => {
            if (Array.isArray(value)) {
                value.forEach((v) => out.push(`${key}: ${v}`));
            }
            else {
                out.push(`${key}: ${value}`);
            }
        });
        return out.join('\r\n');
    }
    extractReceivingChain(headersText) {
        if (!headersText)
            return [];
        const lines = headersText.split(/\r?\n/);
        const blocks = [];
        let current = null;
        for (const line of lines) {
            if (/^received\s*:/i.test(line)) {
                if (current)
                    blocks.push(current.trim());
                current = line;
            }
            else if (current && /^\s+/.test(line)) {
                current += ' ' + line.trim();
            }
            else {
                if (current) {
                    blocks.push(current.trim());
                    current = null;
                }
            }
        }
        if (current)
            blocks.push(current.trim());
        return blocks.map((b) => b.replace(/^received:\s*/i, '').trim()).reverse();
    }
    detectEsp(headersText, fromText) {
        const h = (headersText || '').toLowerCase();
        const f = (fromText || '').toLowerCase();
        if (h.includes('sendgrid') || h.includes('x-sg-'))
            return 'SendGrid';
        if (h.includes('amazonses') || h.includes('x-amzn-'))
            return 'Amazon SES';
        if (h.includes('mailgun') || h.includes('x-mailgun'))
            return 'Mailgun';
        if (h.includes('sparkpost') || h.includes('x-msys'))
            return 'SparkPost';
        if (h.includes('zoho'))
            return 'Zoho';
        if (h.includes('postmark'))
            return 'Postmark';
        if (f.includes('gmail.com') || h.includes('google.com') || h.includes('x-gm-'))
            return 'Gmail';
        if (f.includes('outlook.com') || h.includes('office365') || h.includes('microsoft.com'))
            return 'Outlook/Office365';
        return 'Unknown';
    }
    async getLatest() {
        return this.emailModel.findOne().sort({ createdAt: -1 }).lean();
    }
    async getAll() {
        return this.emailModel.find().sort({ createdAt: -1 }).lean();
    }
    async scanLatestTestEmail() {
        return this.scanLatestEmail();
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(email_schema_1.Email.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmailService);
//# sourceMappingURL=email.service.js.map