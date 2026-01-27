/**
 * DOM Utilities
 * 
 * Helper functions for DOM manipulation and event handling.
 */

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Parse HTML string to DocumentFragment
 * @param {string} html - HTML string to parse
 * @returns {DocumentFragment} Parsed DOM fragment
 */
export function parseHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
}

/**
 * Create an element with attributes and children
 * @param {string} tag - Element tag name
 * @param {object} attrs - Element attributes
 * @param {Array|string} children - Child elements or text
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);

    // Set attributes
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            const event = key.slice(2).toLowerCase();
            element.addEventListener(event, value);
        } else if (key === 'dataset' && typeof value === 'object') {
            Object.assign(element.dataset, value);
        } else {
            element.setAttribute(key, value);
        }
    }

    // Add children
    if (typeof children === 'string') {
        element.textContent = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    }

    return element;
}

/**
 * Query a single element
 * @param {string} selector - CSS selector
 * @param {HTMLElement} context - Parent element to search within
 * @returns {HTMLElement|null} Found element or null
 */
export function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Query multiple elements
 * @param {string} selector - CSS selector
 * @param {HTMLElement} context - Parent element to search within
 * @returns {Array<HTMLElement>} Array of found elements
 */
export function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

/**
 * Add event listener with delegation
 * @param {HTMLElement} element - Parent element
 * @param {string} eventType - Event type
 * @param {string} selector - Child selector to match
 * @param {Function} handler - Event handler
 */
export function delegate(element, eventType, selector, handler) {
    element.addEventListener(eventType, (event) => {
        const target = event.target.closest(selector);
        if (target && element.contains(target)) {
            handler.call(target, event, target);
        }
    });
}

/**
 * Load an image and return a promise
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} Promise resolving to loaded image
 */
export function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<void>} Promise that resolves when copied
 */
export async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
    } finally {
        document.body.removeChild(textarea);
    }
}

/**
 * Get scroll position
 * @returns {object} Object with x and y scroll positions
 */
export function getScrollPosition() {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
}

/**
 * Smooth scroll to an element
 * @param {HTMLElement|string} target - Element or selector
 * @param {number} offset - Offset from top
 */
export function scrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;

    if (!element) return;

    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
        top,
        behavior: 'smooth'
    });
}

/**
 * Check if an element is in the viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} threshold - Visibility threshold (0-1)
 * @returns {boolean} Whether element is in viewport
 */
export function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const verticalVisible = rect.top <= windowHeight * (1 - threshold) && rect.bottom >= windowHeight * threshold;
    const horizontalVisible = rect.left <= windowWidth * (1 - threshold) && rect.right >= windowWidth * threshold;

    return verticalVisible && horizontalVisible;
}

/**
 * Add/remove class with toggle
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Force add or remove
 */
export function toggleClass(element, className, force) {
    if (force !== undefined) {
        element.classList.toggle(className, force);
    } else {
        element.classList.toggle(className);
    }
}

/**
 * Set multiple CSS properties at once
 * @param {HTMLElement} element - Target element
 * @param {object} styles - Object of CSS properties
 */
export function setStyles(element, styles) {
    Object.assign(element.style, styles);
}

/**
 * Get computed CSS property value
 * @param {HTMLElement} element - Target element
 * @param {string} property - CSS property name
 * @returns {string} Computed value
 */
export function getStyle(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle interval in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;

    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export default {
    escapeHtml,
    parseHtml,
    createElement,
    $,
    $$,
    delegate,
    loadImage,
    copyToClipboard,
    getScrollPosition,
    scrollTo,
    isInViewport,
    toggleClass,
    setStyles,
    getStyle,
    debounce,
    throttle
};
