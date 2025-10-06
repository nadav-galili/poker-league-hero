import { withAuth } from '@/utils/middleware';

export const POST = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const gameId = url.pathname.split('/')[3]; // Extract gameId from /api/games/[gameId]/add-player
      const { playerId, buyInAmount } = await request.json();

      if (!user.userId) {
         return Response.json(
            { error: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (!gameId || !playerId) {
         return Response.json(
            { error: 'Game ID and player ID are required' },
            { status: 400 }
         );
      }

      // Import database modules
      const { getDb, games, gamePlayers, cashIns, leagueMembers } =
         await import('../../../../db');
      const { eq, and } = await import('drizzle-orm');
      const db = getDb();

      // Verify game exists and is active
      const gameResult = await db
         .select({
            id: games.id,
            status: games.status,
            leagueId: games.leagueId,
            buyIn: games.buyIn,
         })
         .from(games)
         .where(eq(games.id, parseInt(gameId)))
         .limit(1);

      if (gameResult.length === 0) {
         return Response.json({ error: 'Game not found' }, { status: 404 });
      }

      const game = gameResult[0];
      if (game.status !== 'active') {
         return Response.json({ error: 'Game is not active' }, { status: 400 });
      }

      // Verify player is a member of the league
      const leagueMemberResult = await db
         .select({ id: leagueMembers.id })
         .from(leagueMembers)
         .where(
            and(
               eq(leagueMembers.leagueId, game.leagueId),
               eq(leagueMembers.userId, playerId),
               eq(leagueMembers.isActive, true)
            )
         )
         .limit(1);

      if (leagueMemberResult.length === 0) {
         return Response.json(
            { error: 'Player is not a member of this league' },
            { status: 400 }
         );
      }

      // Check if player is already in the game
      const existingPlayerResult = await db
         .select({ id: gamePlayers.id, isActive: gamePlayers.isActive })
         .from(gamePlayers)
         .where(
            and(
               eq(gamePlayers.gameId, parseInt(gameId)),
               eq(gamePlayers.userId, playerId)
            )
         )
         .limit(1);

      if (existingPlayerResult.length > 0) {
         if (existingPlayerResult[0].isActive) {
            return Response.json(
               { error: 'Player is already active in this game' },
               { status: 400 }
            );
         } else {
            // Reactivate the player
            await db
               .update(gamePlayers)
               .set({ isActive: true, leftAt: null })
               .where(eq(gamePlayers.id, existingPlayerResult[0].id));

            return Response.json({
               success: true,
               message: 'Player reactivated in game',
            });
         }
      }

      // Add player to game
      const newGamePlayer = await db
         .insert(gamePlayers)
         .values({
            gameId,
            userId: playerId,
            isActive: true,
         })
         .returning();

      const gamePlayerId = newGamePlayer[0].id;

      // Create initial buy-in if buyInAmount provided, otherwise use game's default buy-in
      const initialBuyIn = buyInAmount
         ? parseFloat(buyInAmount)
         : parseFloat(game.buyIn);

      if (initialBuyIn > 0) {
         await db.insert(cashIns).values({
            gameId,
            userId: playerId,
            gamePlayerId,
            amount: initialBuyIn.toFixed(2),
            type: 'buy_in',
         });
      }

      return Response.json({
         success: true,
         gamePlayer: newGamePlayer[0],
         message: 'Player added to game successfully',
      });
   } catch (error) {
      console.error('Error adding player to game:', error);
      return Response.json(
         { error: 'Failed to add player to game' },
         { status: 500 }
      );
   }
});
