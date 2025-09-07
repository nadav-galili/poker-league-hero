import { COOKIE_NAME, JWT_SECRET } from '@/constants';
import * as jose from 'jose';

export async function GET(request: Request) {
   try {
      const cookieHeader = request.headers.get('cookie');
      if (!cookieHeader) {
         return Response.json({ error: 'Not authenticated' }, { status: 401 });
      }

      const cookies: Record<string, Record<string, string>> = {};

      cookieHeader.split(';').forEach(async (cookie) => {
         const trimmedCookie = cookie.trim();
         if (trimmedCookie.includes('=')) {
            const [key, value] = trimmedCookie.split('=');
            const cookieName = key.trim();

            if (!cookies[cookieName]) {
               cookies[cookieName] = { value: value };
            } else {
               cookies[cookieName].value = value;
            }
         } else if (trimmedCookie.toLocaleLowerCase() === 'httponly') {
            const lastCookieName = Object.keys(cookies).pop();
            if (lastCookieName) {
               cookies[lastCookieName].httpOnly = 'true';
            }
         } else if (trimmedCookie.toLocaleLowerCase() === 'expires=') {
            const lastCookieName = Object.keys(cookies).pop();
            if (lastCookieName) {
               cookies[lastCookieName].expires = trimmedCookie.substring(8);
            }
         } else if (trimmedCookie.toLowerCase().startsWith('max-age')) {
            const lastCookieName = Object.keys(cookies).pop();
            if (lastCookieName) {
               cookies[lastCookieName].maxAge = trimmedCookie.substring(8);
            }
         }
      });
      if (!cookies[COOKIE_NAME] || !cookies[COOKIE_NAME].value) {
         return Response.json(
            {
               error: 'Not authenticated',
            },
            { status: 401 }
         );
      }

      const token = cookies[COOKIE_NAME].value;
      try {
         const verified = await jose.jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET)
         );
         let cookieExpiration: number | null = null;
         if (cookies[COOKIE_NAME].maxAge) {
            const maxAge = parseInt(cookies[COOKIE_NAME].maxAge, 10);
            const issuedAt =
               (verified.payload.iat as number) ||
               Math.floor(Date.now() / 1000);
            cookieExpiration = issuedAt + maxAge;
         }

         return Response.json({
            ...verified.payload,
            cookieExpiration,
         });
      } catch (error) {
         console.log('🚀 ~ GET ~ error:', error);
         return Response.json({ error: 'Invalid token' }, { status: 401 });
      }
   } catch (e) {
      console.error('Session error:', e);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
}
