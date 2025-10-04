import { getDb, leagueMembers } from '../db';
import { and, eq } from 'drizzle-orm';
import { AuthUser } from '@/context/auth';

export interface AuthorizationContext {
   user: AuthUser;
   leagueId: number;
   requiredRole?: 'admin' | 'member';
}

export interface AuthorizationResult {
   authorized: boolean;
   error?: string;
   userRole?: string;
}

/**
 * Check if a user has access to a league
 */
export async function checkLeagueAccess({
   user,
   leagueId,
   requiredRole = 'member',
}: AuthorizationContext): Promise<AuthorizationResult> {
   try {
      if (!user.userId) {
         return {
            authorized: false,
            error: 'User authentication required',
         };
      }

      const db = getDb();

      // Check if user is a member of the league
      const membership = await db
         .select({
            role: leagueMembers.role,
            isActive: leagueMembers.isActive,
         })
         .from(leagueMembers)
         .where(
            and(
               eq(leagueMembers.leagueId, leagueId),
               eq(leagueMembers.userId, user.userId)
            )
         )
         .limit(1);

      if (membership.length === 0) {
         return {
            authorized: false,
            error: 'User is not a member of this league',
         };
      }

      const userMembership = membership[0];

      if (!userMembership.isActive) {
         return {
            authorized: false,
            error: 'User membership is inactive',
         };
      }

      // Check role requirements
      if (requiredRole === 'admin' && userMembership.role !== 'admin') {
         return {
            authorized: false,
            error: 'Admin access required for this operation',
         };
      }

      return {
         authorized: true,
         userRole: userMembership.role,
      };
   } catch (error) {
      console.error('Authorization check failed:', error);
      return {
         authorized: false,
         error: 'Authorization check failed',
      };
   }
}

/**
 * Middleware to enforce league access control
 */
export function withLeagueAuth<T extends Response>(
   handler: (
      req: Request,
      user: AuthUser,
      leagueId: number,
      userRole: string
   ) => Promise<T>,
   options: { requireAdmin?: boolean } = {}
) {
   return async (req: Request, user: AuthUser): Promise<T | Response> => {
      try {
         // Extract league ID from URL
         const url = new URL(req.url);
         const pathParts = url.pathname.split('/');

         let leagueId: number;

         // Handle different URL patterns
         if (pathParts.includes('leagues')) {
            const leagueIndex = pathParts.indexOf('leagues') + 1;
            const leagueIdStr = pathParts[leagueIndex];

            if (
               !leagueIdStr ||
               leagueIdStr === 'create' ||
               leagueIdStr === 'join'
            ) {
               // These endpoints don't require league access check
               return await handler(req, user, 0, '');
            }

            const parsedLeagueId = parseInt(leagueIdStr, 10);
            if (isNaN(parsedLeagueId) || parsedLeagueId <= 0) {
               return Response.json(
                  { error: 'Invalid league ID' },
                  { status: 400 }
               );
            }
            leagueId = parsedLeagueId;
         } else {
            return Response.json(
               { error: 'League ID not found in URL' },
               { status: 400 }
            );
         }

         // Check authorization
         const authResult = await checkLeagueAccess({
            user,
            leagueId,
            requiredRole: options.requireAdmin ? 'admin' : 'member',
         });

         if (!authResult.authorized) {
            return Response.json(
               { error: authResult.error || 'Access denied' },
               { status: 403 }
            );
         }

         return await handler(
            req,
            user,
            leagueId,
            authResult.userRole || 'member'
         );
      } catch (error) {
         console.error('League authorization error:', error);
         return Response.json(
            { error: 'Authorization failed' },
            { status: 500 }
         );
      }
   };
}

/**
 * Check if a league exists and is active
 */
export async function validateLeagueExists(leagueId: number): Promise<{
   exists: boolean;
   active: boolean;
   error?: string;
}> {
   try {
      const { getDb, leagues } = await import('../db');
      const db = getDb();

      const league = await db
         .select({
            id: leagues.id,
            isActive: leagues.isActive,
         })
         .from(leagues)
         .where(eq(leagues.id, leagueId))
         .limit(1);

      if (league.length === 0) {
         return {
            exists: false,
            active: false,
            error: 'League not found',
         };
      }

      return {
         exists: true,
         active: league[0].isActive,
      };
   } catch (error) {
      console.error('League validation error:', error);
      return {
         exists: false,
         active: false,
         error: 'League validation failed',
      };
   }
}

/**
 * Extract and validate league ID from URL path
 */
export function extractLeagueId(url: string): {
   leagueId: number | null;
   error?: string;
} {
   try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname
         .split('/')
         .filter((part) => part.length > 0);

      // Find the league ID in the path
      const leagueIndex = pathParts.findIndex((part) => part === 'leagues');
      if (leagueIndex === -1 || leagueIndex + 1 >= pathParts.length) {
         return { leagueId: null, error: 'League ID not found in URL' };
      }

      const leagueIdStr = pathParts[leagueIndex + 1];

      // Skip if it's a known endpoint path
      if (['create', 'join'].includes(leagueIdStr)) {
         return { leagueId: null };
      }

      const leagueId = parseInt(leagueIdStr, 10);
      if (isNaN(leagueId) || leagueId <= 0) {
         return { leagueId: null, error: 'Invalid league ID format' };
      }

      return { leagueId };
   } catch (error) {
      return { leagueId: null, error: 'Failed to parse URL' };
   }
}
