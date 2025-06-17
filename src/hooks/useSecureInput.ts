
import { useCallback } from 'react';
import { securityService } from '@/services/security-service';

export function useSecureInput() {
  const sanitizeAndValidate = useCallback((value: string, maxLength: number = 500) => {
    if (!value) return { sanitized: '', isValid: true, error: null };
    
    if (value.length > maxLength) {
      return {
        sanitized: value.slice(0, maxLength),
        isValid: false,
        error: `Input too long (max ${maxLength} characters)`
      };
    }
    
    const sanitized = securityService.sanitizeInput(value);
    
    return {
      sanitized,
      isValid: true,
      error: null
    };
  }, []);
  
  return { sanitizeAndValidate };
}
