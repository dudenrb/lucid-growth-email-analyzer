"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHeaders = normalizeHeaders;
exports.toArray = toArray;
exports.extractReceivingChain = extractReceivingChain;
function normalizeHeaders(h) {
    const out = {};
    Object.keys(h || {}).forEach(k => {
        out[k.toLowerCase()] = h[k];
    });
    return out;
}
function toArray(v) {
    if (!v)
        return [];
    return Array.isArray(v) ? v : [v];
}
function extractReceivingChain(headers) {
    const h = normalizeHeaders(headers);
    const received = toArray(h['received']);
    const chain = received
        .slice()
        .reverse()
        .map((line) => line
        .replace(/\s+/g, ' ')
        .replace(/;/g, ' ;')
        .trim());
    return chain;
}
//# sourceMappingURL=parsers.js.map