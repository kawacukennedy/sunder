import { create } from 'zustand';

interface CollaborationState {
    activeSession: string | null;
    participants: any[];
    cursorPositions: Record<string, any>;
    connectionStatus: 'connecting' | 'connected' | 'disconnected';
    chatMessages: any[];
    isRecording: boolean;
    recordingUrl: string | null;
    setSession: (token: string | null) => void;
    setParticipants: (participants: any[]) => void;
    updateCursor: (userId: string, position: any) => void;
    setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected') => void;
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
    setSession: (token) => set({ activeSession: token }),
    setParticipants: (participants) => set({ participants }),
    updateCursor: (userId, position) => set((state) => ({
        cursorPositions: { ...state.cursorPositions, [userId]: position }
    })),
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, { ...message, timestamp: new Date() }]
    })),
    setRecording: (isRecording, url = null) => set({ isRecording, recordingUrl: url }),
}));
