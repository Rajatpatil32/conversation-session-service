import { Injectable, NotFoundException } from '@nestjs/common';
import { SessionsRepository } from './sessions.repository';

@Injectable()
export class SessionsService {
  constructor(private readonly repo: SessionsRepository) {}

  async createOrGetSession(dto: { sessionId: string, language: string }) {
    return this.repo.upsertSession(dto.sessionId, dto.language);
  }

  async getSessionById(sessionId: string) {
    const session = await this.repo.findBySessionId(sessionId);
    if (!session) throw new NotFoundException();
    return session;
  }

  async completeSession(sessionId: string) {
  const updated = await this.repo.completeSession(sessionId);
  if (updated) return updated;

  const existing = await this.repo.findBySessionId(sessionId);
  if (!existing) throw new NotFoundException();
  return existing;
}

}
