import { IsString, IsObject, IsEnum } from 'class-validator';

export class CreateEventDto {
  @IsString()
  eventId: string;

  @IsString()
  type: string;

  @IsObject()
  payload: Record<string, any>;
}
