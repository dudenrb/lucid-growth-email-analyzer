// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument } from 'mongoose';

// export type EmailLogDocument = HydratedDocument<EmailLog>;

// @Schema({ timestamps: true, collection: 'email_logs' })
// export class EmailLog {
//   @Prop({ required: true }) subject!: string;
//   @Prop({ required: true }) from!: string;
//   @Prop({ required: true }) to!: string;
//   @Prop({ type: Object }) headers!: Record<string, any>;
//   @Prop({ type: [String], default: [] }) receivingChain!: string[];
//   @Prop({ default: '' }) esp!: string;
//   @Prop({ type: Object }) raw!: any;
// }

// export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);



import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema({ timestamps: true })
export class Email {
  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true })
  from!: string;

  @Prop({ required: true })
  to!: string;

  @Prop({ required: true, unique: true })
  messageId!: string;

  @Prop({ type: [String], default: [] })
  receivingChain!: string[];

  @Prop({ required: true })
  esp!: string;

  @Prop({
    type: Object,
    default: {},
  })
  raw!: {
    id: string;
    size: number;
    headersText?: string;
  };

  @Prop({ default: Date.now })
  receivedAt!: Date;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
