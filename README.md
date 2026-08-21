# InteractPro

InteractPro is a real-time chat application for developers. Beyond
one-to-one messaging, it includes a live collaborative code editor and an
AI-powered search feature that answers questions about your own chat
history, citing the real messages it drew from. The whole stack is written
in TypeScript with end-to-end type safety from the database to the UI.

## What it does

- **Direct messaging.** One-to-one real-time chat with instant delivery,
  no page refresh. Messages can be plain text or syntax-highlighted code
  snippets (10+ languages, via PrismJS).
- **Collaborative code editor.** Multiple people can open the same code
  session and edit it together live — every keystroke syncs to every
  participant in real time, with no merge conflicts even if two people type
  in the same spot at the same moment. Sessions persist: closing every tab
  and reopening the session later restores the exact content.
- **AI chat search.** Ask a plain-English question (e.g. "how do we handle
  auth?") and get an answer generated from your own conversation history,
  with the specific source messages cited. If nothing relevant exists, it
  says so instead of guessing. This feature is optional — the app runs
  fully without it if no AI key is configured, it just disables the search
  panel.
- **Profile management.** Users set a first/last name and an optional
  profile picture (stored via Cloudinary) after signing up.
- **Persistent navigation shell.** A single app-wide layout with a nav rail
  for switching between Chats, Code Sessions, and Profile without a full
  page reload.

## How it's built

### Client (`Client/`)

React 18 + TypeScript + Vite. Routing is handled by React Router; global
UI state (which chat is open, the current user, contact lists) lives in a
Zustand store. Server data — everything that isn't purely local UI
state — is fetched through tRPC's React Query integration, which gives
typed hooks like `trpc.chat.getMessages.useQuery(...)` with caching and
automatic refetching built in.

The UI is built on shadcn/ui-style primitives (Radix UI underneath) styled
with Tailwind CSS using a custom design-token system defined in
`Client/src/index.css` — a warm dark palette with a coral accent, Plus
Jakarta Sans for UI text and JetBrains Mono for code. There's no light
theme; the app is intentionally dark-only. Motion/micro-interactions use
`framer-motion`.

### Server (`Server/`)

A single Express process (run via `tsx`, so both `.ts` and `.js` files load
natively with no separate build step) exposes three things on one HTTP
server:

1. **tRPC API** at `/trpc` — the primary API surface. Routers: `auth`
   (signup/login/logout/profile, JWT in an httpOnly cookie), `chat`
   (contact search, message history, DM list), `codeSession` (create/list/
   join/delete collaborative sessions), `ai` (semantic search and RAG
   query). See `Server/trpc/routers/`.
2. **Socket.io** — used specifically for pushing new chat messages to
   connected clients. This exists as a separate channel from tRPC on
   purpose: tRPC is request/response, so it has no way for the server to
   notify a browser about an *incoming* message without being asked; a
   persistent socket connection does. Each connected user is mapped to
   their socket ID (`Server/socket.js`) so a sent message can be pushed to
   both sender and recipient, then persisted to Postgres, then queued for
   background embedding (see AI section below).
3. **`y-socket.io`** — a second, independent real-time layer purely for the
   collaborative editor. It exists separately from the chat socket because
   collaborative editing needs a CRDT merge protocol (via Yjs), not just
   message delivery — two people editing the same character at the same
   time must always converge to identical text, which plain
   broadcast-the-message logic can't guarantee. On disconnect, the
   document's current text and full CRDT state get snapshotted to Postgres
   (`Server/yjs/index.mjs`), so a session survives everyone leaving.

A small legacy REST layer still exists alongside tRPC for two things that
predate it and haven't been ported: `/api/upload-image` (Cloudinary profile
picture upload via multer) and a couple of other routes under `/api/*`
(`Server/routes/`, `Server/controllers/`). Everything else goes through
tRPC.

### Database

PostgreSQL with the `pgvector` extension, accessed through Prisma. Schema
(`Server/prisma/schema.prisma`):

- `User` — account + profile (email, password hash, name, image, a random
  display color used for editor cursors).
- `Message` — one row per chat message; `senderId`/`recipientId` for DMs,
  `messageType` distinguishes text vs. code (with an optional `language`),
  optionally has one `Embedding` attached.
- `CodeSession` — a collaborative editor document: name, language, live
  `content` (kept in sync for quick reads), a binary `snapshot` (the raw
  Yjs CRDT state, so editing can resume exactly where it left off), and an
  owner.
- `SessionParticipant` — join table between users and code sessions, one
  row per (session, user) pair, carrying that user's assigned cursor color.
- `Embedding` — a 768-dimension vector column (`Unsupported("vector(768)")`
  in Prisma, since Prisma has no native vector type) holding the semantic
  embedding of a message's text, used for AI search. Prisma can't manage
  this column type directly, so it's created via raw SQL
  (`Server/prisma/migrations/manual/`) and queried with `$queryRaw`
  (`Server/lib/ai/embeddings.mjs`) using pgvector's cosine-distance
  operator (`<=>`) against an HNSW index.

### AI search (RAG)

When a message is sent, it's embedded in the background (Gemini's
`gemini-embedding-001` model, 768 dimensions to match the schema) and
stored alongside it — this never blocks or fails the send itself
(`Server/lib/ai/ingest.mjs` swallows embedding errors). When a user asks a
question through the AI panel, the question itself gets embedded, pgvector
finds the closest real messages *by meaning* (not keyword match), and those
are handed to `gemini-2.5-flash` as the only context it's allowed to answer
from, with instructions to cite which numbered message it used for each
part of the answer. Vector search is always scoped to the querying user's
own messages (`WHERE m.sender_id = userId OR m.recipient_id = userId` in
`Server/lib/ai/embeddings.mjs`) — one user's private conversations are never
searchable by another user, even indirectly through the AI feature.

## Tech Stack

| Layer | Technology |
|---|---|
| Client | React 18.3, TypeScript, Vite 5.3, Tailwind CSS 3.4, Zustand 4.5, TanStack React Query 5.101 |
| API | tRPC 11.18 (end-to-end types, no REST boilerplate or manual API contracts) |
| Real-time chat | Socket.io 4.8 |
| Collaborative editor | Yjs 13.6 (CRDT) + `y-socket.io` 1.1 + CodeMirror 6 (`y-codemirror.next`) |
| Database | PostgreSQL 16 + pgvector, via Prisma 6.19 |
| AI | Google Gemini (`gemini-embedding-001` for search, `gemini-2.5-flash` for generation), via `@google/genai` 2.17 |
| Auth | JWT in an httpOnly, `SameSite=None`, `Secure` cookie (safe for a cross-domain client/API split) |
| Media | Cloudinary (profile picture uploads) |
| Testing | Vitest 2.1, Supertest — 71 automated server-side tests covering auth, chat, code sessions, and AI |
| Dev environment | Docker Compose (Postgres), `tsx` (server, no build step), Vite dev server (client) |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL) — or any hosted Postgres with the `pgvector` extension available
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) — optional; the app runs fully without one, with AI search disabled

### Setup

```bash
git clone <repo-url>
cd InteractPro-ChatApplication

# start the database
docker compose up -d

# server
cd Server
cp .env.example .env   # fill in JWT_KEY at minimum; GEMINI_API_KEY is optional
npm install
npx prisma db push
npm run dev

# client, in a second terminal
cd Client
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

### Running the tests

```bash
cd Server
npm test
```

## Project Structure

```
Client/
  src/
    pages/               top-level routed screens (Auth, Chat, Profile, CodeSession...)
    pages/chat-components/  the chat screen's sub-components (sidebar, header, message list, composer)
    components/shell/    the persistent app shell + nav rail
    components/ui/       shared design-system primitives (button, dialog, input, etc.)
    components/ai/       the AI ask panel
    components/editor/   the collaborative CodeMirror editor
    lib/trpc.ts           tRPC client setup
    store/store.ts         Zustand global state
Server/
  trpc/routers/          auth, chat, codeSession, ai — the primary API surface
  socket.js               Socket.io setup for chat message push
  yjs/                    y-socket.io setup + CRDT snapshot persistence
  lib/ai/                 Gemini client, embedding storage/search, background ingestion
  routes/, controllers/   the small legacy REST surface (profile image upload)
  prisma/                 schema + manual pgvector SQL
  tests/                  71 Vitest tests
docker-compose.yml        local PostgreSQL + pgvector
```

## Known Limitations

- **Dark theme only.** No light-mode toggle — every component uses a fixed
  dark palette rather than switchable theme tokens.
- File attachments in chat are not implemented — the UI element exists but
  isn't wired to an upload flow (profile pictures, which use a separate
  upload path, do work).
- `/session/:id` currently renders the session list alongside the editor,
  but there's no cross-linking from a specific chat to a related code
  session — code sessions and chats are separate, parallel features rather
  than integrated into one thread.
