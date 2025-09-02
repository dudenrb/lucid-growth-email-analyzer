export type ParsedHop = {
    by?: string;
    from?: string;
    with?: string;
    id?: string;
    timestamp?: string;
};
export declare function parseReceivingChain(receivedHeaders: string[]): ParsedHop[];
export declare function normalizeHeaders(raw: string): Record<string, string[]>;
