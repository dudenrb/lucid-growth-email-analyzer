import { EmailsService } from './email.service';
export declare class EmailsController {
    private readonly emailsService;
    constructor(emailsService: EmailsService);
    getAllEmails(): Promise<{
        id: number;
        subject: string;
        body: string;
        receivedAt: Date;
    }[]>;
    getLatestEmail(): Promise<{
        id: number;
        subject: string;
        body: string;
        receivedAt: Date;
    } | {
        message: string;
    }>;
}
