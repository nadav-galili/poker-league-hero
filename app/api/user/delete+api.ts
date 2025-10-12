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

export const PUT = withAuth(
   withRateLimit(async (request: Request, user) => {
      try {
         const securityCheck = validateRequestSecurity(request);
         if (!securityCheck.valid) {
            captureException(
               new Error(securityCheck.error ?? 'Invalid request'),
               {
                  function: 'validateRequestSecurity',
                  screen: 'DeleteUser',
                  request: request,
                  user: user,
               }
            );
            return secureResponse(
               { error: securityCheck.error },
               { status: 400 }
            );
         }

         if (!user.userId) {
            captureException(new Error('User authentication required'), {
               function: 'checkUserAuthentication',
               screen: 'DeleteUser',
               request: request,
               user: user,
            });
            return secureResponse(
               { error: 'User authentication required' },
               { status: 401 }
            );
         }

         const validatedUserId = validateDatabaseId(user.userId);
         if (!validatedUserId) {
            captureException(new Error('Invalid user ID format'), {
               function: 'validateDatabaseId',
               screen: 'DeleteUser',
               request: request,
               user: user,
            });
            return secureResponse(
               { error: 'Invalid user ID format' },
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
            captureException(new Error('User not found'), {
               function: 'checkUserExists',
               screen: 'DeleteUser',
               request: request,
               user: user,
            });
            return secureResponse({ error: 'User not found' }, { status: 404 });
         }

         // Perform soft delete by nullifying PII fields
         await db
            .update(users)
            .set({
               fullName: 'Anonymous Player',
               email: null,
               profileImageUrl: null,
               firstName: null,
               lastName: null,
               isDeleted: true,
               updatedAt: new Date(),
            })
            .where(eq(users.id, validatedUserId));

         console.log(
            `✅ User ${validatedUserId} data soft deleted successfully`
         );

         return secureResponse(
            {
               success: true,
               message: 'Personal data deleted successfully',
            },
            { status: 200 }
         );
      } catch (error) {
         console.error('❌ Unexpected error in delete user endpoint:', error);
         const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
         const errorStack = error instanceof Error ? error.stack : '';

         console.error('Error details:', {
            message: errorMessage,
            stack: errorStack,
            userId: user.userId,
         });

         captureException(new Error('Failed to delete user data'), {
            function: 'deleteUser',
            screen: 'DeleteUser',
            request: request,
            user: user,
            error: errorMessage,
         });

         return secureResponse(
            {
               error: 'Failed to delete user data',
               details: errorMessage,
               timestamp: new Date().toISOString(),
            },
            { status: 500 }
         );
      }
   }, 'general')
);
