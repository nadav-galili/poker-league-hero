import { withAuth } from '@/utils/middleware';

export const POST = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const gameId = url.pathname.split('/')[3]; // Extract gameId from /api/games/[gameId]/add-anonymous-player
      const { name, buyInAmount } = await request.json();

      if (!user.userId) {
         return Response.json(
            { error: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (!gameId || !name) {
         return Response.json(
            { error: 'Game ID and player name are required' },
            { status: 400 }
         );
      }

      // Import database modules
      const { getDb, games, gamePlayers, cashIns, anonymousPlayers } =
         await import('../../../../db');
      const { eq } = await import('drizzle-orm');
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

      // Create anonymous player
      const newAnonymousPlayer = await db
         .insert(anonymousPlayers)
         .values({
            leagueId: game.leagueId,
            name: name,
         })
         .returning();

      const anonymousPlayerId = newAnonymousPlayer[0].id;

      // Add player to game
      const newGamePlayer = await db
         .insert(gamePlayers)
         .values({
            gameId: parseInt(gameId),
            anonymousPlayerId: anonymousPlayerId,
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
            gameId: parseInt(gameId),
            gamePlayerId,
            amount: initialBuyIn.toFixed(2),
            type: 'buy_in',
         });
      }

      return Response.json({
         success: true,
         gamePlayer: newGamePlayer[0],
         message: 'Anonymous player added to game successfully',
      });
   } catch (error) {
      return Response.json(
         { error: 'Failed to add anonymous player to game' },
         { status: 500 }
      );
   }
});
