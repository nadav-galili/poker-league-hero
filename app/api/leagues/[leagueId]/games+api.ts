import { withAuth } from '@/utils/middleware';
import { and, eq, inArray, sql } from 'drizzle-orm';
import {
   anonymousPlayers,
   cashIns,
   gamePlayers,
   games,
   getDb,
   leagueMembers,
   users,
} from '../../../../db';

export const GET = withAuth(async (request: Request, user) => {
   console.log('📡 [LeagueGamesAPI] Fetching games...');
   try {
      const url = new URL(request.url);
      // Robust way to extract leagueId from path: /api/leagues/[id]/games
      const pathSegments = url.pathname.split('/');
      const leagueIndex = pathSegments.indexOf('leagues');
      const leagueId =
         leagueIndex !== -1 && pathSegments[leagueIndex + 1]
            ? parseInt(pathSegments[leagueIndex + 1], 10)
            : null;

      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const offset = (page - 1) * limit;

      if (!leagueId) {
         return Response.json(
            { success: false, message: 'League ID is required' },
            { status: 400 }
         );
      }

      if (!user.userId) {
         return Response.json(
            { success: false, message: 'User not authenticated' },
            { status: 401 }
         );
      }

      const db = getDb();

      // Check if user is a member of the league
      const membership = await db
         .select()
         .from(leagueMembers)
         .where(
            and(
               eq(leagueMembers.leagueId, leagueId),
               eq(leagueMembers.userId, user.userId),
               eq(leagueMembers.isActive, true)
            )
         )
         .limit(1);

      if (membership.length === 0) {
         return Response.json(
            { success: false, message: 'User is not a member of this league' },
            { status: 403 }
         );
      }

      // Fetch all games (active and completed) with creator info
      // Order: active games first (by startedAt DESC), then completed games (by endedAt DESC)
      const gamesResult = await db
         .select({
            id: games.id,
            leagueId: games.leagueId,
            buyIn: games.buyIn,
            startedAt: games.startedAt,
            endedAt: games.endedAt,
            status: games.status,
            createdBy: games.createdBy,
            creatorName: users.fullName,
            creatorImage: users.profileImageUrl,
         })
         .from(games)
         .leftJoin(users, eq(games.createdBy, users.id))
         .where(eq(games.leagueId, leagueId))
         .orderBy(
            // Order by status first (active games first), then by date
            sql`CASE WHEN ${games.status} = 'active' THEN 0 ELSE 1 END ASC`,
            sql`CASE WHEN ${games.status} = 'active' THEN ${games.startedAt} ELSE COALESCE(${games.endedAt}, ${games.startedAt}) END DESC`
         )
         .limit(limit)
         .offset(offset);

      if (gamesResult.length === 0) {
         return Response.json({
            success: true,
            games: [],
            hasMore: false,
         });
      }

      const gameIds = gamesResult.map((g) => g.id);

      // Fetch players for these games
      const playersResult = await db
         .select({
            id: gamePlayers.id,
            gameId: gamePlayers.gameId,
            userId: users.id,
            anonymousPlayerId: anonymousPlayers.id,
            fullName: users.fullName,
            profileImageUrl: users.profileImageUrl,
            anonymousName: anonymousPlayers.name,
            profit: gamePlayers.profit,
            finalAmount: gamePlayers.finalAmount,
         })
         .from(gamePlayers)
         .leftJoin(users, eq(gamePlayers.userId, users.id))
         .leftJoin(
            anonymousPlayers,
            eq(gamePlayers.anonymousPlayerId, anonymousPlayers.id)
         )
         .where(inArray(gamePlayers.gameId, gameIds));

      // Fetch cash-ins for total buy-ins calculation
      const cashInsResult = await db
         .select({
            gameId: cashIns.gameId,
            gamePlayerId: cashIns.gamePlayerId,
            amount: cashIns.amount,
            type: cashIns.type,
         })
         .from(cashIns)
         .where(
            and(inArray(cashIns.gameId, gameIds), eq(cashIns.type, 'buy_in'))
         );

      // OPTIMIZATION: Create a map for O(1) lookups instead of O(N) filtering
      const cashInsMap = new Map<number, number>();
      for (const ci of cashInsResult) {
         const current = cashInsMap.get(ci.gamePlayerId) || 0;
         cashInsMap.set(ci.gamePlayerId, current + parseFloat(ci.amount));
      }

      // Process and assemble data
      const processedGames = gamesResult.map((game) => {
         // Get players for this game
         const gamePlayersList = playersResult.filter(
            (p) => p.gameId === game.id
         );

         // Process players with buy-in totals
         const processedPlayers = gamePlayersList.map((player) => {
            // OPTIMIZATION: Use the map lookup
            const totalBuyIns = cashInsMap.get(player.id) || 0;

            return {
               id: player.id,
               userId: player.userId,
               fullName:
                  player.fullName || player.anonymousName || 'Unknown Player',
               profileImageUrl: player.profileImageUrl,
               profit: player.profit ? parseFloat(player.profit) : 0,
               totalBuyIns: totalBuyIns,
            };
         });

         // Sort players by profit DESC
         processedPlayers.sort((a, b) => b.profit - a.profit);

         return {
            ...game,
            players: processedPlayers,
         };
      });

      // Check if there are more games
      // We can do a count query or just fetch limit + 1, but separate count is cleaner for pagination UI if needed later
      // For now, simple check: if we got 'limit' items, assume there might be more (or check count)
      const totalCountResult = await db
         .select({ count: sql<number>`count(*)` })
         .from(games)
         .where(eq(games.leagueId, leagueId));

      const totalCount = Number(totalCountResult[0]?.count || 0);
      const hasMore = offset + gamesResult.length < totalCount;

      return Response.json(
         {
            success: true,
            games: processedGames,
            hasMore,
            total: totalCount,
         },
         {
            headers: {
               'Cache-Control':
                  'no-store, no-cache, must-revalidate, proxy-revalidate',
               Pragma: 'no-cache',
               Expires: '0',
            },
         }
      );
   } catch (error) {
      console.error('Error fetching league games:', error);
      return Response.json(
         { success: false, message: 'Failed to fetch league games' },
         { status: 500 }
      );
   }
});
