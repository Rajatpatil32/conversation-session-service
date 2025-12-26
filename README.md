
# Conversation Session Service

This project is a backend service built using **NestJS** and **MongoDB** to manage
conversation sessions and their events.

The main goal of this assignment was **not feature richness**, but to demonstrate:
- clear problem-solving
- system thinking
- idempotent APIs
- safe behavior under concurrent requests

---

## Tech Stack

- Node.js
- NestJS
- MongoDB (Mongoose)
- Jest (E2E testing)

---

## Setup Instructions

### Prerequisites

Make sure you have:
- Node.js (v18 or above)
- MongoDB running locally or accessible via URI
- npm

---

### Install Dependencies

```bash
npm install
```

---

### Environment Setup

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://localhost:27017/session-test
PORT=3000
```

---

## How to Run the Project

### Start the Server

```bash
npm run start:dev
```

The API will be available at:

```
http://localhost:3000
```

---

### Run End-to-End Tests

```bash
npm run test:e2e
```

The E2E tests cover:
- session creation (idempotent)
- concurrent session creation
- adding events
- event idempotency
- pagination of events
- session completion

---

## Available APIs

### 1. Create or Get Session
```
POST /sessions
```

### 2. Add Event to Session
```
POST /sessions/:sessionId/events
```

### 3. Get Session with Events (Cursor Pagination)
```
GET /sessions/:sessionId
```

### 4. Complete Session
```
POST /sessions/:sessionId/complete
```

---

## Assumptions Made

1. **Client provides unique `sessionId` and `eventId`**
   - This enables idempotency without storing request hashes.

2. **MongoDB is the source of truth**
   - No in-memory locks or caches are used.

3. **Authentication and authorization are out of scope**
   - The focus is purely backend correctness and design.

4. **Event payload is flexible**
   - Payload is stored as a generic object to keep the system extensible.

5. **No analytics or soft deletes**
   - Intentionally skipped to keep the solution focused.

---

## Notes

- The service is stateless and horizontally scalable
- Database-level guarantees are preferred over application-level locks
- Design decisions prioritize correctness over premature optimization

---

## Final Thoughts

This solution focuses on **judgment and clarity**, not perfection.
The aim was to build something reliable, understandable, and realistic
under real-world constraints.