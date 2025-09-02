import { HydratedDocument } from 'mongoose';
export type EmailDocument = HydratedDocument<Email>;
export declare class Hop {
    by?: string;
    from?: string;
    with?: string;
    id?: string;
    timestamp?: string;
}
export declare class Email {
    messageId?: string;
    from?: string;
    to?: string;
    subject?: string;
    date?: string;
    receivingChain?: Hop[];
    espType?: string;
    mailbox?: string;
    rawHeaders?: string;
    error?: string;
}
export declare const EmailSchema: import("mongoose").Schema<Email, import("mongoose").Model<Email, any, any, any, import("mongoose").Document<unknown, any, Email> & Email & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Email, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Email>> & import("mongoose").FlatRecord<Email> & {
    _id: import("mongoose").Types.ObjectId;
}>;
