// Helpers to parse "Received" headers & normalize header names

export function normalizeHeaders(h: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  Object.keys(h || {}).forEach(k => {
    out[k.toLowerCase()] = h[k];
  });
  return out;
}

export function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// Extract a readable receiving chain from "Received" headers
export function extractReceivingChain(headers: Record<string, any>): string[] {
  const h = normalizeHeaders(headers);
  const received = toArray<string>(h['received']);

  // Gmail puts most-recent first; we reverse to show source -> destination
  const chain = received
    .slice()
    .reverse()
    .map((line) =>
      line
        .replace(/\s+/g, ' ')
        .replace(/;/g, ' ;')
        .trim()
    );

  return chain;
}
