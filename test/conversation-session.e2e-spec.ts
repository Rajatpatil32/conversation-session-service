import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import mongoose from 'mongoose';
import { AppModule } from '../src/app.module';

describe('Conversation Session Service (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
    await app.close();
  });

  /**
   * -----------------------------
   * POST /sessions
   * -----------------------------
   */
  describe('POST /sessions', () => {
    it('creates a session (idempotent)', async () => {
      const payload = { sessionId: 's-1', language: 'en' };

      const r1 = await request(app.getHttpServer())
        .post('/sessions')
        .send(payload);

      const r2 = await request(app.getHttpServer())
        .post('/sessions')
        .send(payload);

      expect(r1.status).toBe(201);
      expect(r2.status).toBe(201);
      expect(r1.body.sessionId).toBe('s-1');
      expect(r1.body._id).toBe(r2.body._id);
    });

    it('is safe under concurrent requests', async () => {
  const agent = request.agent(app.getHttpServer());

  const payload = { sessionId: 'concurrent-session' };

  const [r1, r2] = await Promise.all([
    agent.post('/sessions').send(payload),
    agent.post('/sessions').send(payload),
  ]);

  expect(r1.status).toBe(201);
  expect(r2.status).toBe(201);
  expect(r1.body._id).toBe(r2.body._id);
});

  });

  /**
   * -----------------------------
   * POST /sessions/:id/events
   * -----------------------------
   */
  describe('POST /sessions/:id/events', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/sessions')
        .send({ sessionId: 'event-session' });
    });

    it('adds an event to a session', async () => {
      const res = await request(app.getHttpServer())
        .post('/sessions/event-session/events')
        .send({
          eventId: 'e-1',
          type: 'user_speech',
          payload: { text: 'Hello' },
        });

      expect(res.status).toBe(201);
      expect(res.body.eventId).toBe('e-1');
    });

    it('returns 404 if session does not exist', async () => {
      const res = await request(app.getHttpServer())
        .post('/sessions/invalid/events')
        .send({
          eventId: 'e-x',
          type: 'system',
          payload: {},
        });

      expect(res.status).toBe(404);
    });
  });

  /**
   * -----------------------------
   * GET /sessions/:id
   * -----------------------------
   */
  describe('GET /sessions/:id', () => {
    it('returns session with events (pagination)', async () => {
      const res = await request(app.getHttpServer())
        .get('/sessions/event-session?limit=10');

      expect(res.status).toBe(200);
      expect(res.body.session.sessionId).toBe('event-session');
      expect(Array.isArray(res.body.events)).toBe(true);
    });
  });

  /**
   * -----------------------------
   * POST /sessions/:id/complete
   * -----------------------------
   */
  describe('POST /sessions/:id/complete', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/sessions')
        .send({ sessionId: 'complete-session' });
    });

    it('completes a session', async () => {
      const res = await request(app.getHttpServer())
        .post('/sessions/complete-session/complete');

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('completed');
      expect(res.body.endedAt).toBeDefined();
    });

    it('is idempotent on repeated calls', async () => {
      const first = await request(app.getHttpServer())
        .post('/sessions/complete-session/complete');

      const second = await request(app.getHttpServer())
        .post('/sessions/complete-session/complete');

      expect(first.body.endedAt).toBe(second.body.endedAt);
    });

    it('returns 404 for non-existing session', async () => {
      const res = await request(app.getHttpServer())
        .post('/sessions/no-session/complete');

      expect(res.status).toBe(404);
    });
  });
});
