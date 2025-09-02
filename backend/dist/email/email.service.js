"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const imapflow_1 = require("imapflow");
const mongoose_2 = require("mongoose");
const email_schema_1 = require("./schema/email.schema");
const esp_detector_1 = require("./esp-detector");
const parsers_1 = require("./parsers");
let EmailService = EmailService_1 = class EmailService {
    constructor(config, emailModel) {
        this.config = config;
        this.emailModel = emailModel;
        this.logger = new common_1.Logger(EmailService_1.name);
    }
    getConfig() {
        return {
            subjectToken: this.config.get('subjectToken'),
            testAddress: this.config.get('testAddress'),
            mailbox: this.config.get('imap.mailbox'),
        };
    }
    async scanEmails() {
        const imap = new imapflow_1.ImapFlow({
            host: this.config.get('imap.host'),
            port: this.config.get('imap.port'),
            secure: this.config.get('imap.secure'),
            auth: {
                user: this.config.get('imap.user'),
                pass: this.config.get('imap.pass'),
            },
            logger: false,
        });
        const mailbox = this.config.get('imap.mailbox') || 'INBOX';
        const token = this.config.get('subjectToken') || '';
        try {
            await imap.connect();
            await imap.mailboxOpen(mailbox);
            const seqs = await imap.search({ subject: token });
            if (!seqs || seqs.length === 0) {
                return { found: false, message: `No email found containing token "${token}".` };
            }
            const seq = seqs[seqs.length - 1];
            const { meta, source } = await this.fetchMessage(imap, seq);
            const headers = (0, parsers_1.normalizeHeaders)(meta.headers);
            const receivingChain = (0, parsers_1.extractReceivingChain)(headers);
            const esp = (0, esp_detector_1.detectESP)(meta.headers);
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
        }
        catch (err) {
            this.logger.error('❌ Scan failed:', err);
            return { found: false, error: err.message };
        }
        finally {
            try {
                await imap.logout();
            }
            catch { }
        }
    }
    async fetchMessage(imap, seq) {
        const msg = (await imap.fetchOne(seq, {
            envelope: true,
            source: true,
            headers: true,
        }));
        if (!msg)
            throw new Error(`Message with sequence ${seq} not found`);
        const source = msg.source;
        let headers = {};
        if (msg.headers && msg.headers instanceof Map) {
            headers = Object.fromEntries(Array.from(msg.headers.entries()).map(([k, v]) => [k, v.length > 1 ? v : v[0]]));
        }
        const meta = {
            subject: msg.envelope?.subject,
            from: {
                text: (msg.envelope?.from || []).map((a) => `${a.name || ''} <${a.address}>`).join(', '),
            },
            to: {
                text: (msg.envelope?.to || []).map((a) => `${a.name || ''} <${a.address}>`).join(', '),
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
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(email_schema_1.EmailLog.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model])
], EmailService);
//# sourceMappingURL=email.service.js.map