# Sunder

An AI-powered collaborative platform for saving, sharing, discovering, and transforming code snippets with advanced intelligence, real-time collaboration, and developer productivity features.

## 🚀 Vision

Sunder combines AI-paired programming, real-time collaborative editing, code translation across languages, and automated educational content generation into a unified platform that learns from your coding style and makes every developer more productive.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **State Management**: Zustand (Client) & React Query (Server)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Real-time**: WebSockets
- **Deployment**: Render

### Data & Services
- **Database**: PostgreSQL (via Supabase)
- **Object Storage**: Supabase Storage
- **Caching**: Redis
- **AI**: Gemini API / Vertex AI

## 📂 Project Structure

- `frontend/`: Next.js frontend application.
- `backend/`: Express.js backend API.
- `database/`: SQL scripts and schema definitions.
- `specs.json`: Detailed project specifications and requirements.

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for DB and Storage)
- Redis instance

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sunder
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run start
   ```

## 📄 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## ⚖️ License

[MIT License](LICENSE)
