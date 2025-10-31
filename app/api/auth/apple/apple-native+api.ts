import { JWT_SECRET } from '@/constants';
import { getDb, users } from '@/db';
import { verifyAndCreateTokens } from '@/utils/apple-auth';
import { eq } from 'drizzle-orm';
import * as jose from 'jose';

/**
 * To verify the identity token, your app server must:
 * Verify the JWS E256 signature using the server's public key
 * Verify the nonce for the authentication
 * Verify that the iss field contains https://appleid.apple.com
 * Verify that the aud field is the developer's client_id
 * Verify that the time is earlier than the exp value of the token
 */
export async function POST(req: Request) {
   const { identityToken, rawNonce, givenName, familyName, email } =
      await req.json();

   try {
      // Verify the token and get initial tokens
      const { accessToken } = await verifyAndCreateTokens({
         identityToken,
         rawNonce,
         givenName,
         familyName,
         email,
      });

      // Decode the access token to get user info
      const tokenPayload = jose.decodeJwt(accessToken) as any;
      const appleUserId = tokenPayload.sub; // Apple's unique user ID

      // Save/update user in database
      let dbUserId: number | null = null;
      try {
         const db = getDb();

         // Check if user exists by Apple ID
         const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.appleId, appleUserId))
            .limit(1);

         let result;
         if (existingUser.length > 0) {
            // Update existing user
            result = await db
               .update(users)
               .set({
                  fullName:
                     givenName && familyName
                        ? `${givenName} ${familyName}`
                        : existingUser[0].fullName,
                  email: email || existingUser[0].email,
                  updatedAt: new Date(),
                  lastLoginAt: new Date(),
               })
               .where(eq(users.appleId, appleUserId))
               .returning();
            dbUserId = result[0]?.id || existingUser[0].id;
         } else {
            // Insert new user
            const newUserResult = await db
               .insert(users)
               .values({
                  email: email || `apple-${appleUserId}@example.com`,
                  fullName:
                     givenName && familyName
                        ? `${givenName} ${familyName}`
                        : 'Apple User',
                  appleId: appleUserId,
                  provider: 'apple',
                  lastLoginAt: new Date(),
               })
               .returning();
            dbUserId = newUserResult[0]?.id;
         }
      } catch (error) {
         console.error('Error saving user to database:', error);
      }

      // Create new tokens with userId included
      const issuedAt = Math.floor(Date.now() / 1000);

      const enhancedAccessToken = await new jose.SignJWT({
         ...tokenPayload,
         userId: dbUserId, // Add the database user ID
      })
         .setProtectedHeader({ alg: 'HS256' })
         .setExpirationTime(issuedAt + 3600) // 1 hour
         .setSubject(appleUserId)
         .setIssuedAt(issuedAt)
         .sign(new TextEncoder().encode(JWT_SECRET));

      const enhancedRefreshToken = await new jose.SignJWT({
         ...tokenPayload,
         userId: dbUserId,
         jti: crypto.randomUUID(),
         type: 'refresh',
      })
         .setProtectedHeader({ alg: 'HS256' })
         .setExpirationTime(issuedAt + 2592000) // 30 days
         .setSubject(appleUserId)
         .setIssuedAt(issuedAt)
         .sign(new TextEncoder().encode(JWT_SECRET));

      return Response.json({
         accessToken: enhancedAccessToken,
         refreshToken: enhancedRefreshToken,
      });
   } catch (error) {
      console.error('Token verification failed:', error);
      return Response.json({ error: 'Invalid token' }, { status: 401 });
   }
}
