import dayjs from 'dayjs';

export type ParsedHop = {
  by?: string;
  from?: string;
  with?: string;
  id?: string;
  timestamp?: string;
};

const RECEIVED_RE =
  /from\s+([^;()\n]+)?\s*by\s+([^;()\n]+)?(?:\s+with\s+([^;()\n]+))?(?:\s+id\s+([^;()\n]+))?;(.+)$/i;

export function parseReceivingChain(receivedHeaders: string[]): ParsedHop[] {
  return receivedHeaders
    .map((line) => {
      const rx = RECEIVED_RE.exec(line.replace(/\r?\n\s+/g, ' '));
      return rx
        ? {
            from: rx[1]?.trim(),
            by: rx[2]?.trim(),
            with: rx[3]?.trim(),
            id: rx[4]?.trim(),
            timestamp: rx[5]
              ? dayjs(rx[5].trim()).toISOString()
              : undefined,
          }
        : undefined;
    })
    .filter((hop): hop is NonNullable<typeof hop> => hop !== undefined);
}

export function normalizeHeaders(raw: string): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const line of raw.split(/\r?\n(?!\s)/)) {
    const m = /^([^:]+):\s*([\s\S]*)$/.exec(line);
    if (!m) continue;
    const k = m[1].toLowerCase();
    const v = m[2];
    map[k] = map[k] || [];
    map[k].push(v);
  }
  return map;
}
