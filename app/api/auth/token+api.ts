import {
   COOKIE_MAX_AGE,
   COOKIE_NAME,
   COOKIE_OPTIONS,
   GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET,
   GOOGLE_REDIRECT_URI,
   JWT_SECRET,
   REFRESH_COOKIE_NAME,
   REFRESH_COOKIE_OPTIONS,
   REFRESH_TOKEN_EXPIRY,
} from '@/constants';

import * as jose from 'jose';
import { getDb, users } from '@/db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
   try {
      const body = (await request.formData()) as unknown as {
         get(name: string): any;
      };
      const code = body.get('code') as string;
      const platform = (body.get('platform') as string) || 'native';

      if (!code) {
         console.error('Missing authorization code');
         return Response.json({ error: 'missing auth code' }, { status: 400 });
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
         method: 'POST',
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
            code: code,
         }),
      });

      const data = await response.json();

      if (!data.id_token) {
         console.error('Missing ID token from Google:', data);
         return Response.json({ error: 'missing id token' }, { status: 400 });
      }

      // Decode JWT token
      const userInfo = jose.decodeJwt(data.id_token) as any;

      // Insert/update user in database
      let dbUserId: number | null = null;
      let dbUserData: {
         id: number;
         fullName: string | null;
         profileImageUrl: string | null;
         email: string;
      } | null = null;

      try {
         const db = getDb();

         // Check if user exists
         const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.googleId, userInfo.sub))
            .limit(1);

         let result;
         if (existingUser.length > 0) {
            // Update existing user - preserve custom profile data
            const existing = existingUser[0];
            const updateData: any = {
               updatedAt: new Date(),
               lastLoginAt: new Date(),
            };

            // Only update fullName if it's null/empty (preserve user customizations)
            if (!existing.fullName || existing.fullName.trim() === '') {
               updateData.fullName = userInfo.name;
            }

            // Only update profileImageUrl if it's null/empty or still using default Google image (preserve user customizations)
            if (
               !existing.profileImageUrl ||
               existing.profileImageUrl === userInfo.picture ||
               existing.profileImageUrl.includes('googleusercontent.com')
            ) {
               updateData.profileImageUrl = userInfo.picture;
            }

            result = await db
               .update(users)
               .set(updateData)
               .where(eq(users.googleId, userInfo.sub))
               .returning({
                  id: users.id,
                  fullName: users.fullName,
                  profileImageUrl: users.profileImageUrl,
                  email: users.email,
               });
            dbUserId = result[0]?.id || existingUser[0].id;
            dbUserData = result[0] || null;
         } else {
            // Insert new user
            const newUserResult = await db
               .insert(users)
               .values({
                  email: userInfo.email,
                  fullName: userInfo.name,
                  googleId: userInfo.sub,
                  profileImageUrl: userInfo.picture,
                  provider: 'google',
                  lastLoginAt: new Date(),
               })
               .returning({
                  id: users.id,
                  fullName: users.fullName,
                  profileImageUrl: users.profileImageUrl,
                  email: users.email,
               });
            dbUserId = newUserResult[0]?.id;
            dbUserData = newUserResult[0] || null;
         }
      } catch (error) {
         console.error('Error saving user to database:', error);
         // dbUserData remains null if DB operation failed
      }

      const { exp, ...userInfoWithoutExp } = userInfo as any;
      //use id
      const sub = (userInfo as { sub: string }).sub;
      const issuedAt = Math.floor(Date.now() / 1000);

      // Enhanced user info with database values (preserves custom profile data)
      // Use data from RETURNING clause if available, otherwise fall back to OAuth data
      const enhancedUserInfo = {
         ...userInfoWithoutExp,
         userId: dbUserId, // Add the database user ID
         name: dbUserData?.fullName || userInfo.name, // Use database name if available
         picture: dbUserData?.profileImageUrl || userInfo.picture, // Use database image if available
         email: dbUserData?.email || userInfo.email, // Use database email if available
      };

      ///create access token short lived
      const accessToken = await new jose.SignJWT(enhancedUserInfo)
         .setProtectedHeader({ alg: 'HS256' })
         // Use deterministic absolute exp (issuedAt + COOKIE_MAX_AGE seconds)
         .setExpirationTime(issuedAt + COOKIE_MAX_AGE)
         .setSubject(sub)
         .setIssuedAt(issuedAt)
         .sign(new TextEncoder().encode(JWT_SECRET));

      // create refresh token (rotated by /api/auth/refresh)
      const refreshToken = await new jose.SignJWT({
         ...enhancedUserInfo,
         jti: uuidv4(),
         type: 'refresh',
      })
         .setProtectedHeader({ alg: 'HS256' })
         .setExpirationTime(REFRESH_TOKEN_EXPIRY)
         .setIssuedAt(issuedAt)
         .sign(new TextEncoder().encode(JWT_SECRET));

      if (platform === 'web') {
         const response = Response.json({
            success: true,
            issuedAt: issuedAt,
            expiresAt: issuedAt + COOKIE_MAX_AGE,
         });

         ///set the access token in an HTTTP-only cookie
         response.headers.set(
            'Set-Cookie',
            `${COOKIE_NAME}=${accessToken};Max-Age=${COOKIE_OPTIONS.maxAge};Path=${
               COOKIE_OPTIONS.path
            };${COOKIE_OPTIONS.httpOnly ? 'HttpOnly;' : ''}${
               COOKIE_OPTIONS.secure ? 'Secure;' : ''
            } SameSite=${COOKIE_OPTIONS.sameSite};`
         );

         // set refresh token cookie
         response.headers.append(
            'Set-Cookie',
            `${REFRESH_COOKIE_NAME}=${refreshToken};Max-Age=${
               REFRESH_COOKIE_OPTIONS.maxAge
            };Path=${REFRESH_COOKIE_OPTIONS.path};${
               REFRESH_COOKIE_OPTIONS.httpOnly ? 'HttpOnly;' : ''
            }${REFRESH_COOKIE_OPTIONS.secure ? 'Secure;' : ''} SameSite=${
               REFRESH_COOKIE_OPTIONS.sameSite
            };`
         );

         return response;
      }

      return Response.json({
         accessToken,
         refreshToken,
      });
   } catch (error) {
      console.error('Error in auth route:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
   }
}
