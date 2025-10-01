import { RateLimiter, getSecurityHeaders } from './validation';

// Create different rate limiters for different endpoints
const createLeagueRateLimiter = new RateLimiter(3, 60 * 1000); // 3 requests per minute
const joinLeagueRateLimiter = new RateLimiter(5, 60 * 1000); // 5 requests per minute
const generalApiRateLimiter = new RateLimiter(30, 60 * 1000); // 30 requests per minute

export interface RateLimitConfig {
   maxRequests: number;
   windowMs: number;
   identifier?: string;
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: Request, userId?: number): string {
   const forwardedFor = request.headers.get('x-forwarded-for');
   const realIp = request.headers.get('x-real-ip');
   const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

   // Use user ID if available, otherwise fall back to IP
   return userId ? `user:${userId}` : `ip:${clientIp}`;
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit<T extends Response>(
   handler: (req: Request, ...args: any[]) => Promise<T>,
   endpoint: 'createLeague' | 'joinLeague' | 'general' = 'general'
) {
   return async (req: Request, ...args: any[]): Promise<T | Response> => {
      try {
         // Select appropriate rate limiter
         let rateLimiter: RateLimiter;
         switch (endpoint) {
            case 'createLeague':
               rateLimiter = createLeagueRateLimiter;
               break;
            case 'joinLeague':
               rateLimiter = joinLeagueRateLimiter;
               break;
            default:
               rateLimiter = generalApiRateLimiter;
               break;
         }

         // Extract user ID if available from args (typically from auth middleware)
         const user = args.find(
            (arg) => arg && typeof arg === 'object' && 'userId' in arg
         );
         const userId = user?.userId;

         const identifier = getClientIdentifier(req, userId);

         // Check rate limit
         if (!rateLimiter.isAllowed(identifier)) {
            const resetTime = rateLimiter.getResetTime(identifier);
            const resetTimeSeconds = Math.ceil((resetTime - Date.now()) / 1000);

            return Response.json(
               {
                  error: 'Too many requests. Please try again later.',
                  retryAfter: resetTimeSeconds,
               },
               {
                  status: 429,
                  headers: {
                     ...getSecurityHeaders(),
                     'Retry-After': resetTimeSeconds.toString(),
                     'X-RateLimit-Limit': rateLimiter['maxRequests'].toString(),
                     'X-RateLimit-Remaining': rateLimiter
                        .getRemainingRequests(identifier)
                        .toString(),
                     'X-RateLimit-Reset': Math.ceil(
                        resetTime / 1000
                     ).toString(),
                  },
               }
            );
         }

         // Proceed with request
         const response = await handler(req, ...args);

         // Add rate limit headers to successful responses
         if (response instanceof Response) {
            const remaining = rateLimiter.getRemainingRequests(identifier);
            const resetTime = rateLimiter.getResetTime(identifier);

            // Clone response to add headers
            const headers = new Headers(response.headers);
            headers.set(
               'X-RateLimit-Limit',
               rateLimiter['maxRequests'].toString()
            );
            headers.set('X-RateLimit-Remaining', remaining.toString());
            headers.set(
               'X-RateLimit-Reset',
               Math.ceil(resetTime / 1000).toString()
            );

            // Add security headers
            Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
               if (!headers.has(key)) {
                  headers.set(key, value);
               }
            });

            return new Response(response.body, {
               status: response.status,
               statusText: response.statusText,
               headers,
            }) as T;
         }

         return response;
      } catch (error) {
         console.error('Rate limiting error:', error);
         return Response.json(
            { error: 'Internal server error' },
            { status: 500, headers: getSecurityHeaders() }
         ) as T;
      }
   };
}

/**
 * Enhanced security response wrapper
 */
export function secureResponse(
   data: any,
   options: { status?: number; headers?: Record<string, string> } = {}
): Response {
   const { status = 200, headers = {} } = options;

   const secureHeaders = {
      ...getSecurityHeaders(),
      ...headers,
   };

   return Response.json(data, {
      status,
      headers: secureHeaders,
   });
}

/**
 * Validate request size and content type
 */
export function validateRequestSecurity(request: Request): {
   valid: boolean;
   error?: string;
} {
   // Check content length (prevent large payloads)
   const contentLength = request.headers.get('content-length');
   if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      // 10MB limit
      return {
         valid: false,
         error: 'Request payload too large',
      };
   }

   // Check content type for POST/PUT requests
   if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
         return {
            valid: false,
            error: 'Invalid content type',
         };
      }
   }

   return { valid: true };
}
