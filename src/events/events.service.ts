import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly repo: EventsRepository,
    private readonly sessionsService: SessionsService,
  ) {}

  /**
   * Create event (IDEMPOTENT)
   */
  async createEvent(
    sessionId: string,
    body: {
      eventId: string;
      type: string;
      payload?: any;
    },
  ) {
    await this.sessionsService.getSessionById(sessionId);

    return this.repo.insertEvent(sessionId, {
      eventId: body.eventId,
      type: body.type,
      payload: body.payload,
    });
  }

  /**
   * Cursor-based pagination
   */
  async getEventsBySession(
    sessionId: string,
    limit: number,
    cursor?: string,
  ) {
    await this.sessionsService.getSessionById(sessionId);

    return this.repo.findBySessionIdCursor(sessionId, limit, cursor);
  }
}
