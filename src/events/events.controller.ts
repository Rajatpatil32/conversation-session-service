import { Body, Controller, NotFoundException, Param, Post } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { SessionsService } from '../sessions/sessions.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('sessions/:sessionId/events')
export class EventsController {
  constructor(
    private readonly repo: EventsRepository,
    private readonly sessions: SessionsService,
  ) {}

  @Post()
  async create(
    @Param('sessionId') sessionId: string,
    @Body() body: CreateEventDto,
  ) {
    await this.sessions.getSessionById(sessionId);

    return this.repo.insertEvent(sessionId, {
      eventId: body.eventId,
      type: body.type,
      payload: body.payload,
    });
  }
}
