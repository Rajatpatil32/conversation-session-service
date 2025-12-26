import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { EventsRepository } from '../events/events.repository';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessions: SessionsService,
    private readonly eventsRepo: EventsRepository,
  ) { }

  @Post()
  create(@Body() body: { sessionId: string, language: string }) {
    return this.sessions.createOrGetSession(body);
  }

  @Post(':sessionId/events')
  async addEvent(
    @Param('sessionId') sessionId: string,
    @Body() body: any,
  ) {
    const session = await this.sessions.getSessionById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.eventsRepo.insertEvent(sessionId, body);
  }


  @Get(':sessionId')
  async get(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit = 10,
    @Query('cursor') cursor?: string,
  ) {
    const session = await this.sessions.getSessionById(sessionId);

    const events = await this.eventsRepo.findBySessionIdCursor(
      sessionId,
      Number(limit),
      cursor,
    );

    return {
      session,
      events,
      pageInfo: {
        nextCursor: events.length
          ? events[events.length - 1].timestamp.toISOString()
          : null,
      },
    };
  }

  @Post(':sessionId/complete')
  complete(@Param('sessionId') sessionId: string) {
    return this.sessions.completeSession(sessionId);
  }
}
