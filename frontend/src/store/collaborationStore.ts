import { create } from 'zustand';

/**
 * State and actions for real-time collaboration sessions and WebSockets.
 */
interface CollaborationState {
    /** The active session token, if any. */
    activeSession: string | null;
    /** List of participants currently joined in the session. */
    participants: any[];
    /** Map of user IDs to their cursor positions and colors. */
    cursorPositions: Record<string, any>;
    /** Current state of the WebSocket connection. */
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    /** Messages exchanged in the session's neural chat. */
    chatMessages: any[];
    /** Indicates if the current session is being recorded. */
    isRecording: boolean;
    /** URL of the session recording (if available). */
    recordingUrl: string | null;
    /** Sets the active session token. */
    setSession: (token: string | null) => void;
    /** Updates the participants list. */
    setParticipants: (participants: any[] | ((prev: any[]) => any[])) => void;
    /** Updates a specific user's cursor position. */
    updateCursor: (userId: string, position: any) => void;
    setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
    /** Adds a message to the session chat. */
    addChatMessage: (message: any) => void;
    setRecording: (isRecording: boolean, url?: string | null) => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
    activeSession: null,
    participants: [],
    cursorPositions: {},
    connectionStatus: 'disconnected',
    chatMessages: [],
    isRecording: false,
    recordingUrl: null,
    setSession: (token: string | null) => set({ activeSession: token }),
    setParticipants: (update: any[] | ((prev: any[]) => any[])) => set((state) => ({
        participants: typeof update === 'function' ? update(state.participants) : update
    })),
    updateCursor: (userId: string, position: any) => set((state) => ({
        cursorPositions: { ...state.cursorPositions, [userId]: position }
    })),
    setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => set({ connectionStatus: status }),
    addChatMessage: (message: any) => set((state) => ({
        chatMessages: [...state.chatMessages, { ...message, timestamp: new Date() }]
    })),
    setRecording: (isRecording: boolean, url: string | null = null) => set({ isRecording, recordingUrl: url }),
}));
