import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './schema/email.schema';
export declare class EmailService implements OnModuleInit, OnModuleDestroy {
    private emailModel;
    private readonly log;
    private client;
    constructor(emailModel: Model<EmailDocument>);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connectImap;
    private startIdle;
    private handleMessage;
    list(limit?: number): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Email> & Email & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    latestBySubjectToken(): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Email> & Email & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
}
