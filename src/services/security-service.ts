
/**
 * Security utilities and validation functions
 */

export const securityService = {
  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput: (input: string): string => {
    if (!input) return '';
    
    // Remove potentially dangerous HTML tags and attributes
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<form[^>]*>.*?<\/form>/gi,
      /on\w+\s*=/gi, // Remove event handlers
      /javascript:/gi,
      /data:text\/html/gi,
    ];
    
    let sanitized = input;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  },

  /**
   * Validate calendar input data
   */
  validateCalendarData: (data: any) => {
    const errors: string[] = [];
    
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Calendar name is required');
    }
    
    if (data.name && data.name.length > 100) {
      errors.push('Calendar name too long');
    }
    
    if (data.description && data.description.length > 500) {
      errors.push('Description too long');
    }
    
    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push('Invalid color format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate event input data
   */
  validateEventData: (data: any) => {
    const errors: string[] = [];
    
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Event title is required');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('Event title too long');
    }
    
    if (data.description && data.description.length > 1000) {
      errors.push('Event description too long');
    }
    
    if (!data.start || !data.end) {
      errors.push('Start and end times are required');
    }
    
    if (data.start && data.end && new Date(data.start) >= new Date(data.end)) {
      errors.push('End time must be after start time');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Rate limiting for AI requests
   */
  rateLimiter: (() => {
    const requests = new Map<string, number[]>();
    const RATE_LIMIT = 10; // requests per minute
    const WINDOW_MS = 60000; // 1 minute
    
    return {
      isAllowed: (userId: string = 'anonymous'): boolean => {
        const now = Date.now();
        const userRequests = requests.get(userId) || [];
        
        // Remove old requests outside the window
        const recentRequests = userRequests.filter(time => now - time < WINDOW_MS);
        
        if (recentRequests.length >= RATE_LIMIT) {
          return false;
        }
        
        recentRequests.push(now);
        requests.set(userId, recentRequests);
        return true;
      }
    };
  })(),
};
