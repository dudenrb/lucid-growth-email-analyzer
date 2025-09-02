"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReceivingChain = parseReceivingChain;
exports.normalizeHeaders = normalizeHeaders;
const dayjs_1 = __importDefault(require("dayjs"));
const RECEIVED_RE = /from\s+([^;()\n]+)?\s*by\s+([^;()\n]+)?(?:\s+with\s+([^;()\n]+))?(?:\s+id\s+([^;()\n]+))?;(.+)$/i;
function parseReceivingChain(receivedHeaders) {
    return receivedHeaders
        .map((line) => {
        var _a, _b, _c, _d;
        const rx = RECEIVED_RE.exec(line.replace(/\r?\n\s+/g, ' '));
        return rx
            ? {
                from: (_a = rx[1]) === null || _a === void 0 ? void 0 : _a.trim(),
                by: (_b = rx[2]) === null || _b === void 0 ? void 0 : _b.trim(),
                with: (_c = rx[3]) === null || _c === void 0 ? void 0 : _c.trim(),
                id: (_d = rx[4]) === null || _d === void 0 ? void 0 : _d.trim(),
                timestamp: rx[5]
                    ? (0, dayjs_1.default)(rx[5].trim()).toISOString()
                    : undefined,
            }
            : undefined;
    })
        .filter((hop) => hop !== undefined);
}
function normalizeHeaders(raw) {
    const map = {};
    for (const line of raw.split(/\r?\n(?!\s)/)) {
        const m = /^([^:]+):\s*([\s\S]*)$/.exec(line);
        if (!m)
            continue;
        const k = m[1].toLowerCase();
        const v = m[2];
        map[k] = map[k] || [];
        map[k].push(v);
    }
    return map;
}
//# sourceMappingURL=parsers.js.map