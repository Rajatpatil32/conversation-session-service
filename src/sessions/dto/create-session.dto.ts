import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
