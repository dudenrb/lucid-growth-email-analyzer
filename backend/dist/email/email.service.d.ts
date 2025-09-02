export declare class EmailsService {
    private emails;
    findAll(): {
        id: number;
        subject: string;
        body: string;
        receivedAt: Date;
    }[];
    findLatest(): {
        id: number;
        subject: string;
        body: string;
        receivedAt: Date;
    } | {
        message: string;
    };
}
