/**
 * Utils Index
 * 
 * Export all utility modules from a single entry point.
 */

export * from './formatters.js';
export * from './validators.js';
export * from './dom.js';
export * from './storage.js';

// Default exports as named exports
export { default as formatters } from './formatters.js';
export { default as validators } from './validators.js';
export { default as dom } from './dom.js';
export { default as storage } from './storage.js';

// Convenience re-exports of commonly used functions
export {
    formatDate,
    formatTimeAgo,
    formatNumber,
    formatBytes,
    truncate
} from './formatters.js';

export {
    isValidEmail,
    validatePassword,
    validateSnippet,
    isEmpty
} from './validators.js';

export {
    escapeHtml,
    $,
    $$,
    copyToClipboard,
    debounce,
    throttle
} from './dom.js';

export {
    getLocal,
    setLocal,
    removeLocal,
    getWithExpiry,
    setWithExpiry
} from './storage.js';
