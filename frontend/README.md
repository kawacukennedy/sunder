# Sunder Frontend

The Sunder frontend is a modern, high-performance web application built with Next.js 14, leveraging the App Router for optimal routing and performance.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand (Client State), React Query (Server State)
- **Styling**: Tailwind CSS, CSS Modules
- **UI Components**: Radix UI (base), Custom Lucide-integrated components
- **Editor**: Monaco Editor (for advanced code editing)
- **Real-time**: WebSockets

## 📂 Directory Structure

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks.
- `src/lib/`: Utility functions and shared logic.
- `src/store/`: Zustand state stores (auth, UI, editor, collaboration, AI).
- `public/`: Static assets (images, fonts).

## 🍦 State Management

### Zustand (Client State)
We use Zustand for managing global client-side state. Each store is located in `src/store/` and focuses on a specific domain:
- `authStore.ts`: Authentication state and user profile.
- `uiStore.ts`: Global UI state (modals, sidebars, theme).
- `editorStore.ts`: Code editor state and configurations.
- `collaborationStore.ts`: Real-time session state.
- `aiStore.ts`: AI feature state and history.

### React Query (Server State)
React Query is used for fetching, caching, and synchronizing server state. It handles API requests to the backend, providing automatic loading and error states.

## 🎨 Styling

- **Tailwind CSS**: Primary styling utility.
- **CSS Modules**: Used for complex, component-specific styles that require high isolation.
- **Theming**: Supports Light and Dark modes via a custom theme provider.

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Configure environment variables in `.env.local` (see `.env.example`).
3. Run the development server: `npm run dev`

## 📄 Documentation

- [Project Architecture](../../docs/ARCHITECTURE.md)
- [Frontend Components (Storybook - TBD)](TBD)
