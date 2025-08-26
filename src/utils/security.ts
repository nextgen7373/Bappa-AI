// Security utilities for frontend protection

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove dangerous HTML tags and attributes
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<[^>]*\s+on\w+\s*=/gi
  ];

  let sanitized = input;
  
  // Remove dangerous patterns
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // HTML entity encoding for remaining special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized.trim();
};

/**
 * Validate user ID format (UUID v4)
 */
export const isValidUserId = (userId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
};

/**
 * Validate message content
 */
export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message is required' };
  }

  if (message.length > 1000) {
    return { isValid: false, error: 'Message too long (max 1000 characters)' };
  }

  if (message.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  // Check for dangerous content
  const dangerousContent = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of dangerousContent) {
    if (pattern.test(message)) {
      return { isValid: false, error: 'Message contains invalid content' };
    }
  }

  return { isValid: true };
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Check if the current environment is secure (HTTPS)
 */
export const isSecureEnvironment = (): boolean => {
  if (typeof window === 'undefined') return true; // Server-side
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

/**
 * Sanitize URL to prevent open redirect attacks
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Only allow same-origin or trusted domains
    const allowedDomains = [
      window.location.hostname,
      'localhost',
      '127.0.0.1'
    ];
    
    if (!allowedDomains.includes(parsed.hostname)) {
      return '/'; // Redirect to home if external domain
    }
    
    return parsed.toString();
  } catch {
    return '/'; // Invalid URL, redirect to home
  }
};

/**
 * Rate limiting helper for frontend
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canAttempt(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}
