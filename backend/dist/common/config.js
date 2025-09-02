"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const appConfig = () => ({
    port: parseInt(process.env.PORT || '4000', 10),
    mongoUri: process.env.MONGO_URI,
    imap: {
        host: process.env.IMAP_HOST,
        port: parseInt(process.env.IMAP_PORT || '993', 10),
        secure: String(process.env.IMAP_SECURE).toLowerCase() !== 'false',
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASS,
        mailbox: process.env.MAILBOX || 'INBOX',
    },
    subjectToken: process.env.SUBJECT_TOKEN || '',
    testAddress: process.env.TEST_ADDRESS || '',
});
exports.appConfig = appConfig;
//# sourceMappingURL=config.js.map