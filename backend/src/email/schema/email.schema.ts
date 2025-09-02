import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmailDocument = HydratedDocument<Email>;

@Schema({ timestamps: true })
export class Hop {
  @Prop() by?: string;
  @Prop() from?: string;
  @Prop() with?: string;
  @Prop() id?: string;
  @Prop() timestamp?: string; // ISO
}

const HopSchema = SchemaFactory.createForClass(Hop);

@Schema({ timestamps: true, collection: 'emails' })
export class Email {
  @Prop() messageId?: string;
  @Prop() from?: string;
  @Prop() to?: string;
  @Prop() subject?: string;
  @Prop() date?: string;
  @Prop({ type: [HopSchema], default: [] }) receivingChain?: Hop[];

  @Prop() espType?: string;
  @Prop() mailbox?: string;

  @Prop() rawHeaders?: string;       // concatenated raw headers
  @Prop() error?: string;            // any parse errors for debugging
}

export const EmailSchema = SchemaFactory.createForClass(Email);
