import { withAuth } from '@/utils/middleware';

export const POST = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const gameId = url.pathname.split('/')[3]; // Extract gameId from /api/games/[gameId]/end-game

      if (!user.userId) {
         return Response.json(
            { error: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (!gameId) {
         return Response.json(
            { error: 'Game ID is required' },
            { status: 400 }
         );
      }

      // Import database modules
      const { getDb, games, gamePlayers } = await import('../../../../db');
      const { eq, and } = await import('drizzle-orm');
      const db = getDb();

      // Verify game exists and is active
      const gameResult = await db
         .select({
            id: games.id,
            status: games.status,
            createdBy: games.createdBy,
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

      // Optional: Check if user has permission to end the game (is the creator)
      if (game.createdBy !== user.userId) {
         return Response.json(
            { error: 'Only the game creator can end the game' },
            { status: 403 }
         );
      }

      // Validation: Check if all players are cashed out (not active)
      const activePlayers = await db
         .select({ id: gamePlayers.id, userId: gamePlayers.userId })
         .from(gamePlayers)
         .where(
            and(
               eq(gamePlayers.gameId, parseInt(gameId)),
               eq(gamePlayers.isActive, true)
            )
         );

      if (activePlayers.length > 0) {
         return Response.json(
            {
               error: 'Cannot end game while players are still active. All players must be cashed out first.',
               activePlayersCount: activePlayers.length,
            },
            { status: 400 }
         );
      }

      // Update game status to 'completed' and set endedAt timestamp
      const updatedGame = await db
         .update(games)
         .set({
            status: 'completed',
            endedAt: new Date(),
         })
         .where(eq(games.id, parseInt(gameId)))
         .returning();

      return Response.json({
         success: true,
         game: updatedGame[0],
         message: 'Game ended successfully',
      });
   } catch (error) {
      console.error('Error ending game:', error);
      return Response.json({ error: 'Failed to end game' }, { status: 500 });
   }
});
