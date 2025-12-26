import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SessionStatus {
  INITIATED = 'initiated',
  COMPLETED = 'completed',
  ACTIVE = 'active',
  Failed = 'failed'
}

@Schema({ timestamps: true })
export class ConversationSession {
  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ required: true})
  language: string;

  @Prop({ enum: SessionStatus })
  status: SessionStatus;

  @Prop({ type: Date })
  startedAt: Date;

  @Prop({ type: Date, required: false })
  endedAt?: Date;
}

export type SessionDocument = ConversationSession & Document;
export const SessionSchema = SchemaFactory.createForClass(ConversationSession);
