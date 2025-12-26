# Design Decisions – Conversation Session Service

This document explains the key design decisions made while implementing the
Conversation Session Service, with a focus on correctness, reliability, and
real-world backend constraints.

---

## 1. How did you ensure idempotency?

Idempotency was handled primarily at the database level rather than in-memory
logic.

- **Session creation** uses an atomic `findOneAndUpdate` with `upsert: true`
  on `sessionId`. This ensures that repeated or retried requests return the
  same session instead of creating duplicates.
- **Event creation** requires a client-provided `eventId`. A unique compound
  index on `(sessionId, eventId)` ensures the same event cannot be inserted
  more than once, even if the request is retried or sent concurrently.
- **Session completion** updates the session only if it is not already
  completed. Repeated calls return the existing completed state.

This approach makes all write operations naturally idempotent without relying
on request tracking or locks.

---

## 2. How does your design behave under concurrent requests?

Concurrency safety is achieved using MongoDB’s atomic operations and indexes.

- Concurrent session creation requests are handled safely by the upsert
  operation, which guarantees only one document is created.
- Concurrent event inserts for the same event are prevented by the unique
  index, allowing the database to enforce correctness.
- No application-level locking is used, which avoids bottlenecks and keeps the
  system horizontally scalable.

The system remains consistent even when multiple requests hit the same
endpoint at the same time.

---

## 3. What MongoDB indexes did you choose and why?

The following indexes were chosen:

- **Unique index on `sessions.sessionId`**
  - Prevents duplicate sessions
  - Enables fast lookups by session ID

- **Unique compound index on `events.sessionId + events.eventId`**
  - Enforces event-level idempotency
  - Prevents duplicate events under retries or concurrency

- **Index on `events.sessionId + events.timestamp`**
  - Supports efficient cursor-based pagination
  - Avoids performance issues with offset-based pagination

Indexes were chosen to guarantee correctness first and performance second.

---

## 4. How would you scale this system for millions of sessions per day?

If the system needed to scale further, I would:

- Shard MongoDB by `sessionId` to distribute load evenly
- Move completed sessions to cold storage to reduce hot data size
- Introduce read replicas for high-volume read endpoints
- Add async processing (e.g., Kafka / SQS) for non-critical event handling
- Add API rate-limiting and request validation at the gateway level

The current design already supports horizontal scaling because it avoids
stateful services and locking.

---

## 5. What did you intentionally keep out of scope, and why?

The following were intentionally kept out of scope to keep the solution focused:

- Authentication and authorization
- Event schema validation beyond basic structure
- Soft deletes and archival policies
- Observability (metrics, tracing, alerts)
- Multi-region replication

These features are important in production but were excluded to focus on the
core requirements: correctness, idempotency, and concurrency safety.

---

## Summary

This design prioritizes correctness under retries and concurrency, uses the
database as the source of truth, and avoids unnecessary complexity. The system
is easy to reason about, test, and scale incrementally.
