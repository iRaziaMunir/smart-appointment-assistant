# Smart Appointment Assistant

A full-stack assessment prototype for booking appointments through an AI-assisted chatbot, with manual form fallback.

**Stack:** React (Vite) · Node.js · Express · PostgreSQL · Prisma · Mistral AI

## Live Demo

https://smart-appointment-assistant-fronten.vercel.app/

## Assessment Coverage

| Requirement | Implementation |
|-------------|----------------|
| React frontend with chatbot UI | `frontend/src/components/ChatPanel.jsx` |
| Near-real-time chat | Request/response with optimistic UI updates |
| JWT authentication | `backend/src/routes/authRoutes.js` |
| Appointment booking UI | Chat confirmation form + manual booking tab |
| Express REST API | Auth, chat, appointments routes |
| Middleware (validation, logging, rate limit) | `backend/src/middleware/` |
| AI integration (Mistral + fallback) | `backend/src/services/ai/` |
| PostgreSQL schema | `backend/prisma/schema.prisma` |
| AI interaction logging | `ai_interaction_logs` table |

## Architecture

```
┌──────────────────┐   REST + JWT    ┌───────────────────────────────┐
│  React Frontend  │ ◄──────────────►│  Express Backend              │
│  pages/          │                 │  routes → controllers →       │
│  components/     │                 │  services → repositories      │
│  apiClient.js    │                 │                               │
└──────────────────┘                 └───────────────┬───────────────┘
                                                     │ Prisma ORM
                                                     ▼
                                     ┌───────────────────────────────┐
                                     │  PostgreSQL                   │
                                     │  users, appointments, chat_*  │
                                     └───────────────────────────────┘
                                                     │
                                                     ▼
                                     ┌───────────────────────────────┐
                                     │  Mistral API (optional)       │
                                     │  Rule-based fallback          │
                                     └───────────────────────────────┘
```

Backend follows **routes → controllers → services → repositories** (HTTP, business logic, and data access stay separated). Frontend uses **pages** for screens and **components** for reusable UI.

### AI Flow (Important)

1. User sends a chat message
2. Backend calls Mistral (or rule-based fallback)
3. AI extracts structured booking draft — **never creates appointments**
4. Backend validates extracted fields
5. Partial draft stored in `chat_sessions.booking_state`
6. When complete, user confirms via form
7. Backend validates again and inserts into `appointments`

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- (Optional) [Mistral API key](https://console.mistral.ai/)

### 1. Backend + database

```bash
# Create an empty local database (once)
createdb appointment_booking

cd backend
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, and optionally MISTRAL_API_KEY
npm install
npm run db:push
```

Server:

```bash
npm run dev
```

→ `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

→ `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Validate token and return profile |
| POST | `/api/chat/sessions` | Start chat session |
| GET | `/api/chat/sessions/:id/messages` | Get chat history |
| POST | `/api/chat/sessions/:id/messages` | Send message, get AI reply |
| GET | `/api/appointments` | List user appointments |
| GET | `/api/appointments/:id` | Get single appointment |
| POST | `/api/appointments` | Create appointment (manual form) |
| POST | `/api/appointments/from-chat/:sessionId` | Confirm booking from chat |

All JSON responses use **camelCase** at the API boundary.

## Design Decisions

### Layered backend + Prisma
- Routes → Controllers → Services → Repositories keeps concerns separated
- Schema lives in `backend/prisma/schema.prisma` (single source of truth)
- Easier to test, maintain, and extend for SaaS features

### Request/response chat (not WebSockets)
- Simpler infrastructure for a prototype
- Optimistic UI updates provide near-real-time feel
- Sufficient for appointment booking conversations

### AI never writes to appointments
- LLM only extracts intent and structured fields
- Backend validates all output before exposing `readyToBook`
- User must confirm via form — clear guardrail

### Rule-based fallback
- Works without Mistral API key for local dev and demos
- Automatically used if API key is missing or provider fails

### JWT in localStorage
- Simple SPA integration for assessment scope
- Production would prefer httpOnly cookies + refresh tokens

### Optional multi-tenancy
- `business_id` columns reserved for future SaaS expansion
- Not wired in UI for this prototype

## Assumptions & Limitations

- Single timezone (no conversion)
- No email notifications or calendar sync
- No admin panel or role-based access
- In-memory rate limiting (resets on server restart)
- No automated test suite (assessment prototype scope)
- Not production-hardened

## Deployment

### Database (Neon)
1. Create a managed PostgreSQL instance
2. Copy the connection string into backend `DATABASE_URL`
3. From `backend/`, run `npm run db:push`

### Backend (Vercel)
1. Root directory: `backend`
2. Entry: serverless function `api/index.js` (rewrites via `vercel.json`)
3. Env: `DATABASE_URL`, `JWT_SECRET`, `MISTRAL_API_KEY`, `CORS_ORIGIN`, `NODE_ENV=production`
4. Prisma Client is generated on install (`postinstall` / `db:generate`)

### Frontend (Vercel)
1. Root directory: `frontend`
2. Env: `VITE_API_URL=https://your-backend-url/api`
3. Build: `npm run build`

## Project Structure

```
appointment-booking/
├── backend/
│   ├── api/index.js               # Vercel serverless entry
│   ├── prisma/schema.prisma
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       │   └── ai/
│       ├── repositories/
│       ├── validations/
│       ├── middleware/
│       └── utils/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── styles/
│       ├── services/
│       ├── context/
│       └── utils/
└── README.md
```
