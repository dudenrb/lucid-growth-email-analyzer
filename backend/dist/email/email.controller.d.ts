import { EmailService } from './email.service';
export declare class EmailController {
    private readonly svc;
    constructor(svc: EmailService);
    info(): {
        testAddress: string;
        subjectToken: string;
    };
    list(limit?: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schema/email.schema").Email> & import("./schema/email.schema").Email & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    latest(): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schema/email.schema").Email> & import("./schema/email.schema").Email & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
}
