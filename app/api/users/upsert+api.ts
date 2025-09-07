import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
   try {
      const { getDb, users } = await import('../../../db');

      const body = await request.json();
      const {
         email,
         fullName,
         firstName,
         lastName,
         profileImageUrl,
         googleId,
      } = body;

      if (!email || !fullName || !googleId) {
         return Response.json(
            { error: 'Missing required fields: email, fullName, googleId' },
            { status: 400 }
         );
      }

      const db = getDb();

      // Check if user exists
      const existingUser = await db
         .select()
         .from(users)
         .where(eq(users.googleId, googleId))
         .limit(1);

      let result;
      if (existingUser.length > 0) {
         // Update existing user
         result = await db
            .update(users)
            .set({
               fullName,
               firstName,
               lastName,
               profileImageUrl,
               updatedAt: new Date(),
               lastLoginAt: new Date(),
            })
            .where(eq(users.googleId, googleId))
            .returning();
      } else {
         // Insert new user
         result = await db
            .insert(users)
            .values({
               email,
               fullName,
               firstName,
               lastName,
               profileImageUrl,
               googleId,
               provider: 'google',
               lastLoginAt: new Date(),
            })
            .returning();
      }

      return Response.json({
         user: result[0],
         message: existingUser.length > 0 ? 'User updated' : 'User created',
      });
   } catch (error) {
      console.error('Error upserting user:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
   }
}
