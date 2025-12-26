import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConversationSession,
  SessionDocument,
  SessionStatus,
} from './schemas/session.schema';

export class SessionsRepository {
  constructor(
    @InjectModel(ConversationSession.name)
    private readonly model: Model<SessionDocument>,
  ) {}

  async upsertSession(sessionId: string, language: string) {
    return this.model.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: {
          sessionId,
          status: SessionStatus.INITIATED,
          startedAt: new Date(),
          language: language
        },
      },
      { upsert: true, new: true },
    );
  }

  async findBySessionId(sessionId: string) {
    return this.model.findOne({ sessionId });
  }

  async completeSession(sessionId: string) {
  return this.model.findOneAndUpdate(
    {
      sessionId,
      status: { $ne: SessionStatus.COMPLETED },
    },
    {
      $set: {
        status: SessionStatus.COMPLETED,
        endedAt: new Date(),
      },
    },
    { new: true },
  );
}

}
