import { getDb, users } from '@/db';
import { withAuth } from '@/utils/middleware';
import {
   secureResponse,
   validateRequestSecurity,
   withRateLimit,
} from '@/utils/rateLimiting';
import { captureException } from '@/utils/sentry';
import { validateDatabaseId } from '@/utils/validation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Input validation schema
const updateProfileSchema = z.object({
   fullName: z
      .string()
      .min(1, 'Name must be at least 1 character')
      .max(100, 'Name must be less than 100 characters')
      .trim()
      .optional(),
   profileImageUrl: z
      .union([z.string().url('Invalid image URL'), z.null()])
      .optional(),
});

export const PUT = withAuth(
   withRateLimit(async (request: Request, user) => {
      try {
         const securityCheck = validateRequestSecurity(request);
         if (!securityCheck.valid) {
            return secureResponse(
               { error: securityCheck.error },
               { status: 400 }
            );
         }

         if (!user.userId) {
            return secureResponse(
               { error: 'User authentication required' },
               { status: 401 }
            );
         }

         const validatedUserId = validateDatabaseId(user.userId);
         if (!validatedUserId) {
            return secureResponse(
               { error: 'Invalid user ID format' },
               { status: 400 }
            );
         }

         // Parse and validate request body
         const body = await request.json();
         console.log(
            '📝 Update profile request body:',
            JSON.stringify(body, null, 2)
         );
         const validationResult = updateProfileSchema.safeParse(body);

         if (!validationResult.success) {
            console.error(
               '❌ Validation errors:',
               validationResult.error.errors
            );
            return secureResponse(
               {
                  error: 'Validation failed',
                  details: validationResult.error.errors,
               },
               { status: 400 }
            );
         }

         const { fullName, profileImageUrl } = validationResult.data;

         // Normalize fullName - trim and check if it's actually provided
         const normalizedFullName = fullName?.trim() || undefined;

         if (!normalizedFullName && profileImageUrl === undefined) {
            return secureResponse(
               { error: 'No fields to update provided' },
               { status: 400 }
            );
         }

         // Validate fullName length if provided
         if (normalizedFullName && normalizedFullName.length < 1) {
            return secureResponse(
               { error: 'Name must be at least 1 character' },
               { status: 400 }
            );
         }

         if (normalizedFullName && normalizedFullName.length > 100) {
            return secureResponse(
               { error: 'Name must be less than 100 characters' },
               { status: 400 }
            );
         }

         const db = getDb();

         // Check if user exists
         const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, validatedUserId))
            .limit(1);

         if (!existingUser.length) {
            return secureResponse({ error: 'User not found' }, { status: 404 });
         }

         // Prepare update data
         const updateData: Partial<typeof users.$inferInsert> = {
            updatedAt: new Date(),
         };

         if (normalizedFullName) {
            updateData.fullName = normalizedFullName;
         }

         if (profileImageUrl !== undefined) {
            updateData.profileImageUrl = profileImageUrl;
         }

         // Update user
         const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, validatedUserId))
            .returning();

         console.log(`✅ User ${validatedUserId} profile updated successfully`);

         return secureResponse(
            {
               success: true,
               user: updatedUser,
               message: 'Profile updated successfully',
            },
            { status: 200 }
         );
      } catch (error) {
         console.error('❌ Unexpected error in update user endpoint:', error);
         const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

         captureException(new Error('Failed to update user profile'), {
            function: 'updateUser',
            screen: 'UpdateUser',
            request: request,
            user: user,
            error: errorMessage,
         });

         return secureResponse(
            {
               error: 'Failed to update user profile',
               details: errorMessage,
            },
            { status: 500 }
         );
      }
   }, 'general')
);
