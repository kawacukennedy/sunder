# Sunder Backend

The Sunder backend is a Node.js/Express application that handles API requests, real-time collaboration via WebSockets, and integrates with AI services and Supabase.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18.17.0
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: WebSockets
- **Caching**: Redis
- **Auth**: JWT-based with Supabase Auth integration

## 📂 Directory Structure

- `routes/`: Express route handlers for various features (auth, snippets, ai, etc.).
- `lib/`: Utility libraries for AI, WebSockets, and auditing.
- `middleware/`: Custom middleware (e.g., authentication).
- `index.js`: Main entry point and server configuration.
- `verify_endpoints.js`: Utility script for testing API endpoints.

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in the following:

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: development/production
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: For administrative tasks
- `JWT_SECRET`: Secret for signing JWT tokens
- `REDIS_URL`: Connection string for Redis
- `GEMINI_API_KEY`: API key for Google Gemini
- `FRONTEND_URL`: URL of the frontend application for CORS

## 🔌 API Routes

Detailed documentation for each route can be found in the respective files under `routes/`.

- `/auth`: Authentication and session management.
- `/snippets`: CRUD operations for code snippets.
- `/ai`: AI features like translation and pairing.
- `/collaboration`: Real-time session management.
- `/organizations`: Organization and membership management.
- `/profiles`: User profile operations.
- `/challenges`: Gamification elements.
- `/leaderboard`: Global and organization leaderboards.

## 💬 Real-time Collaboration

Real-time features are implemented using the `ws` library. WebSocket logic is handled in `lib/websocket.js` and integrated with the Express server in `index.js`.

For more details on the architecture, see [ARCHITECTURE.md](../docs/ARCHITECTURE.md).
