import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = ConversationEvent & Document;

export enum eventStatus {
  USER_SPEECH = 'user_speech',
  BOT_SPEECH = 'bot_speech',
  SYSTEM = 'system'
}

@Schema({ timestamps: false })
export class ConversationEvent {
  @Prop({ required: true, index: true })
  sessionId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop({ enum: eventStatus })
  type: eventStatus;

  @Prop({ type: Object, default: {} })
  payload: Record<string, any>;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const EventSchema =
  SchemaFactory.createForClass(ConversationEvent);

EventSchema.index(
  { sessionId: 1, eventId: 1 },
  { unique: true },
);
