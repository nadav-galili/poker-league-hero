import { createLeague } from '@/services/leagueUtils';
import { withAuth } from '@/utils/middleware';
import {
   secureResponse,
   validateRequestSecurity,
   withRateLimit,
} from '@/utils/rateLimiting';
import { captureException } from '@/utils/sentry';
import {
   createLeagueSchema,
   sanitizeNameString,
   sanitizeString,
   validateEmail,
   validateRequest,
} from '@/utils/validation';

export const POST = withAuth(
   withRateLimit(async (request: Request, user) => {
      try {
         // Validate request security
         const securityCheck = validateRequestSecurity(request);
         if (!securityCheck.valid) {
            return secureResponse(
               { error: securityCheck.error },
               { status: 400 }
            );
         }

         // Parse and validate request body
         let body;
         try {
            body = await request.json();
         } catch (error) {
            // Capture actual errors
            captureException(error as Error, {
               function: 'parseRequestBody',
               screen: 'CreateLeague',
               body: body,
            });
            console.error('Error parsing request body:', error);
            return secureResponse(
               { error: 'Invalid JSON payload' },
               { status: 400 }
            );
         }

         // Validate input schema
         const validation = validateRequest(createLeagueSchema, body);
         if (!validation.success) {
            return secureResponse(
               {
                  error: 'Invalid input data',
                  details: validation.errors || ['Invalid input'],
               },
               { status: 400 }
            );
         }

         const validatedData = validation.data as {
            name: string;
            image?: string;
            adminUserEmail: string;
         };

         // Additional email validation for security
         if (!validateEmail(validatedData.adminUserEmail)) {
            return secureResponse(
               { error: 'Invalid email format' },
               { status: 400 }
            );
         }

         // Sanitize inputs
         const sanitizedData = {
            name: sanitizeNameString(validatedData.name),
            image: validatedData.image
               ? sanitizeString(validatedData.image)
               : undefined,
            adminUserEmail: validatedData.adminUserEmail.toLowerCase().trim(),
         };

         // Additional validation
         if (!sanitizedData.name) {
            return secureResponse(
               { error: 'League name cannot be empty after sanitization' },
               { status: 400 }
            );
         }

         // Create league with sanitized data
         const league = await createLeague(sanitizedData);

         console.log('League created successfully:', league.id);

         return secureResponse(
            {
               league: {
                  id: league.id,
                  name: league.name,
                  inviteCode: league.inviteCode,
                  imageUrl: league.imageUrl,
                  createdAt: league.createdAt,
               },
               message: 'League created successfully',
            },
            { status: 201 }
         );
      } catch (error) {
         console.error('Error creating league:', error);

         // Don't expose sensitive error information
         const errorMessage =
            error instanceof Error && error.message.includes('User not found')
               ? 'Admin user not found'
               : 'Failed to create league';

         return secureResponse(
            { error: errorMessage },
            {
               status:
                  error instanceof Error &&
                  error.message.includes('User not found')
                     ? 404
                     : 500,
            }
         );
      }
   }, 'createLeague')
);
