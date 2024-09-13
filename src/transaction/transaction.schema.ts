// src/transaction/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop({ required: true })
  transaction_id: string;

  @Prop({ required: true })
  transaction_note: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
