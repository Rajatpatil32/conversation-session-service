import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { ConversationEvent, EventSchema } from './schemas/event.schema';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversationEvent.name, schema: EventSchema },
    ]),
    forwardRef(() => SessionsModule),
  ],
  controllers: [EventsController],
  providers: [EventsRepository],
  exports: [EventsRepository],
})
export class EventsModule {}
