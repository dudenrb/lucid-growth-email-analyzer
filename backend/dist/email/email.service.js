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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_schema_1 = require("./schema/email.schema");
const config_1 = require("../common/config");
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
const esp_detector_1 = require("./esp-detector");
const parsers_1 = require("./parsers");
let EmailService = EmailService_1 = class EmailService {
    constructor(emailModel) {
        this.emailModel = emailModel;
        this.log = new common_1.Logger(EmailService_1.name);
    }
    async onModuleInit() {
        await this.connectImap();
        await this.fetchRecent();
        this.startIdle();
    }
    async fetchRecent() {
        var _a, e_1, _b, _c;
        try {
            const lock = await this.client.getMailboxLock(config_1.cfg.imap.mailbox);
            try {
                const exists = this.client.mailbox && typeof this.client.mailbox === 'object' && 'exists' in this.client.mailbox
                    ? this.client.mailbox.exists
                    : 0;
                if (exists > 0) {
                    const seq = `${Math.max(1, exists - 9)}:${exists}`;
                    const fetched = await this.client.fetch(seq, {
                        source: true,
                        envelope: true,
                        internalDate: true,
                    });
                    try {
                        for (var _d = true, fetched_1 = __asyncValues(fetched), fetched_1_1; fetched_1_1 = await fetched_1.next(), _a = fetched_1_1.done, !_a; _d = true) {
                            _c = fetched_1_1.value;
                            _d = false;
                            const f = _c;
                            await this.handleMessage(f);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = fetched_1.return)) await _b.call(fetched_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            }
            finally {
                lock.release();
            }
        }
        catch (err) {
            this.log.error('❌ fetchRecent error', err);
        }
    }
    async onModuleDestroy() {
        var _a;
        try {
            await ((_a = this.client) === null || _a === void 0 ? void 0 : _a.logout());
        }
        catch (_b) { }
    }
    async connectImap() {
        this.client = new imapflow_1.ImapFlow({
            host: config_1.cfg.imap.host,
            port: config_1.cfg.imap.port,
            secure: config_1.cfg.imap.secure,
            auth: { user: config_1.cfg.imap.user, pass: config_1.cfg.imap.pass },
            logger: false,
        });
        try {
            await this.client.connect();
            await this.client.mailboxOpen(config_1.cfg.imap.mailbox);
            this.log.log(`✅ IMAP connected -> ${config_1.cfg.imap.user}/${config_1.cfg.imap.mailbox}`);
        }
        catch (err) {
            throw new Error(`IMAP connection failed: ${String(err)}`);
        }
    }
    startIdle() {
        (async () => {
            this.client.on('exists', async () => {
                var _a, e_2, _b, _c;
                const lock = await this.client.getMailboxLock(config_1.cfg.imap.mailbox);
                try {
                    if (this.client.mailbox &&
                        typeof this.client.mailbox === 'object' &&
                        'exists' in this.client.mailbox) {
                        const { exists } = this.client.mailbox;
                        const seq = `${exists}:*`;
                        const fetched = await this.client.fetch(seq, {
                            source: true,
                            envelope: true,
                            internalDate: true,
                        });
                        try {
                            for (var _d = true, fetched_2 = __asyncValues(fetched), fetched_2_1; fetched_2_1 = await fetched_2.next(), _a = fetched_2_1.done, !_a; _d = true) {
                                _c = fetched_2_1.value;
                                _d = false;
                                const f = _c;
                                await this.handleMessage(f);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (!_d && !_a && (_b = fetched_2.return)) await _b.call(fetched_2);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                finally {
                    lock.release();
                }
            });
            try {
                await this.client.idle();
            }
            catch (err) {
                this.log.error('❌ IMAP idle loop error', err);
            }
        })().catch((e) => this.log.error('❌ idle loop crash', e));
    }
    async handleMessage(f) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            const source = f.source;
            const parsed = await (0, mailparser_1.simpleParser)(source);
            const subject = parsed.subject || '';
            this.log.debug(`Processing subject: ${parsed.subject}`);
            if (!subject.includes(config_1.cfg.subjectToken))
                return;
            const from = ((_a = parsed.from) === null || _a === void 0 ? void 0 : _a.text) ||
                ((_d = (_c = (_b = parsed.from) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.map((v) => v.address).join(', ')) !== null && _d !== void 0 ? _d : '');
            const to = ((_e = parsed.to) === null || _e === void 0 ? void 0 : _e.text) ||
                ((_h = (_g = (_f = parsed.to) === null || _f === void 0 ? void 0 : _f.value) === null || _g === void 0 ? void 0 : _g.map((v) => v.address).join(', ')) !== null && _h !== void 0 ? _h : '');
            const headersRaw = parsed.headerLines
                .map((h) => `${h.key}: ${h.line.replace(/^[^:]+:\s*/, '')}`)
                .join('\r\n');
            const headers = (0, parsers_1.normalizeHeaders)(headersRaw);
            const received = headers['received'] || [];
            const chain = (0, parsers_1.parseReceivingChain)(received);
            const espType = (0, esp_detector_1.detectEsp)(headers);
            const doc = await this.emailModel.create({
                messageId: parsed.messageId,
                from,
                to,
                subject,
                date: (_k = (_j = parsed.date) === null || _j === void 0 ? void 0 : _j.toISOString) === null || _k === void 0 ? void 0 : _k.call(_j),
                receivingChain: chain,
                espType,
                mailbox: config_1.cfg.imap.mailbox,
                rawHeaders: headersRaw,
            });
            this.log.log(`📩 Stored test email: ${doc._id} | ESP=${espType} | hops=${chain.length}`);
        }
        catch (e) {
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
            .findOne({ subject: { $regex: config_1.cfg.subjectToken, $options: 'i' } })
            .sort({ createdAt: -1 })
            .lean();
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(email_schema_1.Email.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmailService);
//# sourceMappingURL=email.service.js.map