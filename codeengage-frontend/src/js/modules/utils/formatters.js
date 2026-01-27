/**
 * Format Utilities
 * 
 * Common formatting functions for dates, numbers, and text.
 */

/**
 * Format a date string to a human-readable format
 * @param {string|Date} dateInput - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput, options = {}) {
    if (!dateInput) return 'Unknown';

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) return 'Invalid date';

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    return date.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date to include time
 * @param {string|Date} dateInput - Date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(dateInput) {
    if (!dateInput) return 'Unknown';

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) return 'Invalid date';

    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param {string|Date} dateInput - Date to format
 * @returns {string} Relative time string
 */
export function formatTimeAgo(dateInput) {
    if (!dateInput) return 'Unknown';

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 0) return 'Just now';
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (seconds < 604800) {
        const days = Math.floor(seconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    if (seconds < 2592000) {
        const weeks = Math.floor(seconds / 604800);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    }
    if (seconds < 31536000) {
        const months = Math.floor(seconds / 2592000);
        return `${months} month${months !== 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(seconds / 31536000);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Format a number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';

    return num.toLocaleString('en-US');
}

/**
 * Format a number in compact notation (e.g., 1.2K, 3.5M)
 * @param {number} num - Number to format
 * @returns {string} Compact formatted string
 */
export function formatCompactNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';

    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }

    return num.toString();
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size string
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    if (typeof bytes !== 'number' || isNaN(bytes)) return 'Unknown';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Format a duration in milliseconds to human-readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(ms) {
    if (typeof ms !== 'number' || isNaN(ms)) return 'Unknown';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    if (seconds > 0) return `${seconds}s`;

    return `${ms}ms`;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 100, suffix = '...') {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Format a percentage value
 * @param {number} value - Value (0-1 or 0-100)
 * @param {boolean} isDecimal - Whether value is in decimal form (0-1)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, isDecimal = false, decimals = 0) {
    if (typeof value !== 'number' || isNaN(value)) return '0%';

    const percentage = isDecimal ? value * 100 : value;
    return percentage.toFixed(decimals) + '%';
}

/**
 * Capitalize the first letter of a string
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert a string to title case
 * @param {string} text - Text to convert
 * @returns {string} Title-cased text
 */
export function titleCase(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Convert camelCase or snake_case to Title Case
 * @param {string} text - Text to convert
 * @returns {string} Human-readable text
 */
export function humanize(text) {
    if (!text) return '';
    return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^\s/, '')
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
}

export default {
    formatDate,
    formatDateTime,
    formatTimeAgo,
    formatNumber,
    formatCompactNumber,
    formatBytes,
    formatDuration,
    truncate,
    formatPercentage,
    capitalize,
    titleCase,
    humanize
};
