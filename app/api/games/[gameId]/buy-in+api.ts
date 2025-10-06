import { withAuth } from '@/utils/middleware';

export const POST = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const gameId = url.pathname.split('/')[3]; // Extract gameId from /api/games/[gameId]/buy-in
      const { playerId, amount } = await request.json();

      if (!user.userId) {
         return Response.json(
            { error: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (!gameId || !playerId || !amount) {
         return Response.json(
            { error: 'Game ID, player ID, and amount are required' },
            { status: 400 }
         );
      }

      const buyInAmount = parseFloat(amount);
      if (buyInAmount <= 0) {
         return Response.json(
            { error: 'Invalid buy-in amount' },
            { status: 400 }
         );
      }

      // Import database modules
      const { getDb, games, gamePlayers, cashIns } = await import(
         '../../../../db'
      );
      const { eq, and } = await import('drizzle-orm');
      const db = getDb();

      // Verify game exists and is active
      const gameResult = await db
         .select({ id: games.id, status: games.status })
         .from(games)
         .where(eq(games.id, parseInt(gameId)))
         .limit(1);

      if (gameResult.length === 0) {
         return Response.json({ error: 'Game not found' }, { status: 404 });
      }

      if (gameResult[0].status !== 'active') {
         return Response.json({ error: 'Game is not active' }, { status: 400 });
      }

      // Find the game player record
      const gamePlayerResult = await db
         .select({ id: gamePlayers.id })
         .from(gamePlayers)
         .where(
            and(
               eq(gamePlayers.gameId, parseInt(gameId)),
               eq(gamePlayers.userId, playerId)
            )
         )
         .limit(1);

      if (gamePlayerResult.length === 0) {
         return Response.json(
            { error: 'Player not found in game' },
            { status: 404 }
         );
      }

      const gamePlayerId = gamePlayerResult[0].id;

      // Create buy-in record
      const newCashIn = await db
         .insert(cashIns)
         .values({
            gameId,
            userId: playerId,
            gamePlayerId,
            amount: buyInAmount.toFixed(2),
            type: 'buy_in',
         })
         .returning();

      return Response.json({
         success: true,
         cashIn: newCashIn[0],
         message: 'Buy-in successful',
      });
   } catch (error) {
      console.error('Error processing buy-in:', error);
      return Response.json(
         { error: 'Failed to process buy-in' },
         { status: 500 }
      );
   }
});
