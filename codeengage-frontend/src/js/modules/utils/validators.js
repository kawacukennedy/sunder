/**
 * Validation Utilities
 * 
 * Common validation functions for forms and data.
 */

// Track validation errors for debugging
const VALIDATION_ERRORS = [];

/**
 * Track validation errors
 * @param {string} field - Field name
 * @param {string} value - Field value
 * @param {Array} errors - Validation errors
 */
function trackValidationError(field, value, errors) {
    const errorInfo = {
        field,
        value,
        errors,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    VALIDATION_ERRORS.push(errorInfo);
    
    // Keep only last 50 validation errors
    if (VALIDATION_ERRORS.length > 50) {
        VALIDATION_ERRORS.splice(0, VALIDATION_ERRORS.length - 50);
    }

    // Log for debugging
    console.warn('Validation Error:', errorInfo);
}

/**
 * Get validation error statistics
 * @returns {object} Validation statistics
 */
export function getValidationStats() {
    const fieldCounts = {};
    
    VALIDATION_ERRORS.forEach(error => {
        fieldCounts[error.field] = (fieldCounts[error.field] || 0) + 1;
    });

    return {
        totalErrors: VALIDATION_ERRORS.length,
        byField: fieldCounts,
        recentErrors: VALIDATION_ERRORS.slice(-10),
        generatedAt: new Date().toISOString()
    };
}

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate a username
 * @param {string} username - Username to validate
 * @returns {object} Validation result with isValid and errors
 */
export function validateUsername(username) {
    const errors = [];

    if (!username) {
        trackValidationError('username', username, ['Username is required']);
        return { isValid: false, errors };
    }

    if (username.length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (username.length > 50) {
        errors.push('Username must be less than 50 characters');
    }

    if (!/^[a-zA-Z]/.test(username)) {
        errors.push('Username must start with a letter');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Validate a password
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid, strength, and errors
 */
export function validatePassword(password) {
    const errors = [];
    let strength = 0;

    if (!password) {
        errors.push('Password is required');
        return { isValid: false, strength: 0, errors };
    }

    // Length check
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    } else {
        strength += 1;
    }

    if (password.length >= 12) strength += 1;

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        strength += 1;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        strength += 1;
    }

    // Number check
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        strength += 1;
    }

    // Special character check (optional but adds strength)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength += 1;
    }

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthLabel = strengthLabels[Math.min(strength, 5)];

    return {
        isValid: errors.length === 0,
        strength: Math.min(strength, 5),
        strengthLabel,
        errors
    };
}

/**
 * Validate a snippet
 * @param {object} snippet - Snippet data to validate
 * @returns {object} Validation result with isValid and errors
 */
export function validateSnippet(snippet) {
    const errors = {};

    if (!snippet.title || snippet.title.trim().length === 0) {
        errors.title = 'Title is required';
    } else if (snippet.title.length > 255) {
        errors.title = 'Title must be less than 255 characters';
    }

    if (!snippet.code || snippet.code.trim().length === 0) {
        errors.code = 'Code is required';
    } else if (snippet.code.length > 1024 * 1024) {
        errors.code = 'Code must be less than 1MB';
    }

    if (!snippet.language) {
        errors.language = 'Language is required';
    }

    if (snippet.description && snippet.description.length > 1000) {
        errors.description = 'Description must be less than 1000 characters';
    }

    const validVisibilities = ['public', 'private', 'organization'];
    if (snippet.visibility && !validVisibilities.includes(snippet.visibility)) {
        errors.visibility = 'Invalid visibility option';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 */
export function isValidUrl(url) {
    if (!url) return false;

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if a string is empty or only whitespace
 * @param {string} value - Value to check
 * @returns {boolean} Whether value is empty
 */
export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Validate a date string
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} Whether date is valid
 */
export function isValidDate(dateStr) {
    if (!dateStr) return false;

    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

/**
 * Check if a value is a valid positive integer
 * @param {*} value - Value to check
 * @returns {boolean} Whether value is a valid positive integer
 */
export function isPositiveInteger(value) {
    if (typeof value === 'string') {
        value = parseInt(value, 10);
    }
    return Number.isInteger(value) && value > 0;
}

/**
 * Validate form data against a schema
 * @param {object} data - Form data
 * @param {object} schema - Validation schema
 * @returns {object} Validation result with isValid and errors
 */
export function validateForm(data, schema) {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        if (rules.required && isEmpty(value)) {
            errors[field] = rules.message || `${field} is required`;
            continue;
        }

        if (!isEmpty(value)) {
            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                errors[field] = rules.message || `${field} must be at least ${rules.minLength} characters`;
            }

            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                errors[field] = rules.message || `${field} must be less than ${rules.maxLength} characters`;
            }

            if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                errors[field] = rules.message || `${field} format is invalid`;
            }

            if (rules.email && !isValidEmail(value)) {
                errors[field] = rules.message || 'Invalid email address';
            }

            if (rules.url && !isValidUrl(value)) {
                errors[field] = rules.message || 'Invalid URL';
            }

            if (rules.custom && typeof rules.custom === 'function') {
                const customError = rules.custom(value, data);
                if (customError) {
                    errors[field] = customError;
                }
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

export default {
    isValidEmail,
    validateUsername,
    validatePassword,
    validateSnippet,
    isValidUrl,
    isEmpty,
    isValidDate,
    isPositiveInteger,
    validateForm
};
