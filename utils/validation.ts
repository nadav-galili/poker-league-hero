import { z } from 'zod';

// Input sanitization utility
export function sanitizeString(input: string): string {
   if (typeof input !== 'string') return '';

   // Remove potential XSS vectors
   return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>&"']/g, (char) => {
         switch (char) {
            case '<':
               return '&lt;';
            case '>':
               return '&gt;';
            case '&':
               return '&amp;';
            case '"':
               return '&quot;';
            case "'":
               return '&#x27;';
            default:
               return char;
         }
      })
      .trim();
}

// Validation schemas
export const createLeagueSchema = z.object({
   name: z
      .string()
      .min(1, 'League name is required')
      .max(100, 'League name must be less than 100 characters')
      .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'League name contains invalid characters'),
   image: z.string().url('Invalid image URL').optional().or(z.literal('')),
   adminUserEmail: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email must be less than 255 characters'),
});

export const joinLeagueSchema = z.object({
   inviteCode: z
      .string()
      .length(5, 'Invite code must be exactly 5 characters')
      .regex(/^[A-Z0-9]+$/, 'Invite code contains invalid characters'),
});

export const leagueIdSchema = z.object({
   id: z
      .string()
      .regex(/^\d+$/, 'League ID must be a positive integer')
      .transform((val) => parseInt(val, 10))
      .refine(
         (val) => val > 0 && val <= Number.MAX_SAFE_INTEGER,
         'Invalid league ID'
      ),
});

export const statsQuerySchema = z.object({
   type: z
      .enum([
         'top-profit-player',
         'most-active-player',
         'highest-single-game-profit',
         'most-consistent-player',
         'biggest-loser',
      ])
      .optional(),
   year: z
      .string()
      .regex(/^\d{4}$/, 'Year must be a 4-digit number')
      .transform((val) => parseInt(val, 10))
      .refine(
         (val) => val >= 2000 && val <= new Date().getFullYear() + 1,
         'Invalid year'
      )
      .optional(),
});

// Request validation utility
export function validateRequest<T>(
   schema: z.ZodSchema<T>,
   data: unknown
): {
   success: boolean;
   data?: T;
   errors?: string[];
} {
   try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
   } catch (error) {
      if (
         error instanceof z.ZodError &&
         error.errors &&
         Array.isArray(error.errors)
      ) {
         return {
            success: false,
            errors: error.errors.map((err) => {
               const path = Array.isArray(err.path)
                  ? err.path.join('.')
                  : String(err.path || '');
               return path ? `${path}: ${err.message}` : err.message;
            }),
         };
      }
      return { success: false, errors: ['Invalid input data'] };
   }
}

// SQL injection prevention - ensure all inputs are properly parameterized
export function validateDatabaseId(id: any): number | null {
   if (typeof id === 'string' && /^\d+$/.test(id)) {
      const numId = parseInt(id, 10);
      if (numId > 0 && numId <= Number.MAX_SAFE_INTEGER) {
         return numId;
      }
   }
   if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
      return id;
   }
   return null;
}

// Email validation with additional security checks
export function validateEmail(email: string): boolean {
   if (!email || typeof email !== 'string') return false;

   // Basic email regex
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) return false;

   // Additional security checks
   if (email.length > 255) return false; // Prevent buffer overflow attempts
   if (email.includes('..')) return false; // Prevent email spoofing attempts
   if (email.startsWith('.') || email.endsWith('.')) return false;

   return true;
}

// Rate limiting helper
export class RateLimiter {
   private requests: Map<string, { count: number; resetTime: number }> =
      new Map();

   constructor(
      private maxRequests: number = 10,
      private windowMs: number = 60 * 1000 // 1 minute
   ) {}

   isAllowed(identifier: string): boolean {
      const now = Date.now();
      const userRecord = this.requests.get(identifier);

      if (!userRecord || now > userRecord.resetTime) {
         // Reset or create new record
         this.requests.set(identifier, {
            count: 1,
            resetTime: now + this.windowMs,
         });
         return true;
      }

      if (userRecord.count >= this.maxRequests) {
         return false; // Rate limit exceeded
      }

      userRecord.count++;
      return true;
   }

   getRemainingRequests(identifier: string): number {
      const userRecord = this.requests.get(identifier);
      if (!userRecord || Date.now() > userRecord.resetTime) {
         return this.maxRequests;
      }
      return Math.max(0, this.maxRequests - userRecord.count);
   }

   getResetTime(identifier: string): number {
      const userRecord = this.requests.get(identifier);
      if (!userRecord || Date.now() > userRecord.resetTime) {
         return 0;
      }
      return userRecord.resetTime;
   }
}

// Security headers utility
export function getSecurityHeaders(): Record<string, string> {
   return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'",
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
   };
}
