import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 * Useful for handling conditional classes in Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Standardized fetch wrapper for Sunder API requests.
 * Automatically injects auth token from localStorage.
 * @param {string} endpoint - API path (e.g., '/auth/login').
 * @param {RequestInit} [options={}] - Standard fetch options.
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} if response is not ok.
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const authStorage = localStorage.getItem('sunder-auth');
    const token = authStorage ? JSON.parse(authStorage).state.token : null;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || errorData.message || 'API request failed';
        const error = new Error(message) as any;
        error.data = errorData;
        error.status = response.status;
        throw error;
    }

    return response.json();
}

/**
 * Formats a date into a human-readable relative string (e.g., "2m", "1h", "3d").
 * @param {Date|string|number} date - The date to format.
 * @returns {string} Relative time string.
 */
export function formatRelativeTime(date: Date | string | number) {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    return then.toLocaleDateString();
}
