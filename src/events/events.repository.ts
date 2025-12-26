import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationEvent, EventDocument } from './schemas/event.schema';

export class EventsRepository {
  constructor(
    @InjectModel(ConversationEvent.name)
    private readonly model: Model<EventDocument>,
  ) {}

  /**
   * IDEMPOTENT insert
   */
  async insertEvent(
    sessionId: string,
    body: {
      eventId: string;
      type: string;
      payload?: any;
    },
  ) {
    try {
      return await this.model.create({
        sessionId,
        eventId: body.eventId,
        type: body.type,
        payload: body.payload ?? {},
        timestamp: new Date(),
      });
    } catch (err: any) {
      if (err.code === 11000) {
        return await this.model.findOne({
          sessionId,
          eventId: body.eventId,
        });
      }
      throw err;
    }
  }

  async findBySessionIdCursor(
    sessionId: string,
    limit: number,
    cursor?: string,
  ) {
    const query: any = { sessionId };

    if (cursor) {
      query.timestamp = { $gt: new Date(cursor) };
    }

    return this.model
      .find(query)
      .sort({ timestamp: 1 })
      .limit(limit);
  }
}
