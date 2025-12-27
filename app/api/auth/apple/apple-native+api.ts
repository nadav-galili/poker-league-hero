import { JWT_SECRET } from '@/constants';
import { getDb, users } from '@/db';
import { verifyAndCreateTokens } from '@/utils/apple-auth';
import { eq } from 'drizzle-orm';
import * as jose from 'jose';
import { v4 as uuidv4 } from 'uuid';

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
      let dbUserData: {
         id: number;
         fullName: string | null;
         profileImageUrl: string | null;
         email: string;
      } | null = null;

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
            // Update existing user - preserve custom profile data
            const existing = existingUser[0];
            const updateData: any = {
               email: email || existing.email,
               updatedAt: new Date(),
               lastLoginAt: new Date(),
            };

            // Only update fullName if:
            // 1. User hasn't customized it (null/empty), OR
            // 2. This is first sign-in (givenName/familyName provided) and name is still default
            if (givenName && familyName) {
               // First sign-in - only update if name is null/empty or still default
               const defaultName = `${givenName} ${familyName}`;
               if (
                  !existing.fullName ||
                  existing.fullName.trim() === '' ||
                  existing.fullName === 'Apple User'
               ) {
                  updateData.fullName = defaultName;
               }
            }
            // On subsequent sign-ins (no givenName/familyName), preserve existing name

            result = await db
               .update(users)
               .set(updateData)
               .where(eq(users.appleId, appleUserId))
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
                  email: email || `apple-${appleUserId}@example.com`,
                  fullName:
                     givenName && familyName
                        ? `${givenName} ${familyName}`
                        : 'Apple User',
                  appleId: appleUserId,
                  provider: 'apple',
                  profileImageUrl:
                     'https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/user-images/Gemini%20Generated%20Image%20(3).png',
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
         return Response.json(
            { error: 'Failed to save user to database' },
            { status: 500 }
         );
      }

      // Ensure we have a valid userId before creating tokens
      if (!dbUserId) {
         console.error('User ID not found after database operation');
         return Response.json(
            { error: 'Failed to retrieve user ID' },
            { status: 500 }
         );
      }

      // Create new tokens with userId included and database profile values
      const issuedAt = Math.floor(Date.now() / 1000);
      const defaultProfileImageUrl =
         'https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/user-images/Gemini%20Generated%20Image%20(3).png';

      const enhancedAccessToken = await new jose.SignJWT({
         ...tokenPayload,
         userId: dbUserId, // Add the database user ID
         name: dbUserData?.fullName || tokenPayload.name || 'Apple User', // Use database name if available
         picture: dbUserData?.profileImageUrl || defaultProfileImageUrl, // Use database image if available
         email: dbUserData?.email || tokenPayload.email, // Use database email if available
      })
         .setProtectedHeader({ alg: 'HS256' })
         .setExpirationTime(issuedAt + 3600) // 1 hour
         .setSubject(appleUserId)
         .setIssuedAt(issuedAt)
         .sign(new TextEncoder().encode(JWT_SECRET));

      const enhancedRefreshToken = await new jose.SignJWT({
         ...tokenPayload,
         userId: dbUserId,
         name: dbUserData?.fullName || tokenPayload.name || 'Apple User', // Use database name if available
         picture: dbUserData?.profileImageUrl || defaultProfileImageUrl, // Use database image if available
         email: dbUserData?.email || tokenPayload.email, // Use database email if available
         jti: uuidv4(),
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
