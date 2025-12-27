import { withAuth } from '@/utils/middleware';

export const POST = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const gameId = url.pathname.split('/')[3]; // Extract gameId from /api/games/[gameId]/edit-player
      const { gamePlayerId, totalBuyIns, totalBuyOuts } = await request.json();

      if (!user.userId) {
         return Response.json(
            { error: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (
         !gameId ||
         !gamePlayerId ||
         totalBuyIns === undefined ||
         totalBuyOuts === undefined
      ) {
         return Response.json(
            {
               error: 'Game ID, game player ID, total buy-ins, and total buy-outs are required',
            },
            { status: 400 }
         );
      }

      const buyInAmount = parseFloat(totalBuyIns);
      const buyOutAmount = parseFloat(totalBuyOuts);

      if (buyInAmount < 0 || buyOutAmount < 0) {
         return Response.json({ error: 'Invalid amounts' }, { status: 400 });
      }

      // Import database modules
      const { getDb, games, gamePlayers, cashIns } = await import(
         '../../../../db'
      );
      const { eq, and } = await import('drizzle-orm');
      const db = getDb();

      // Verify game exists
      const gameResult = await db
         .select({
            id: games.id,
            status: games.status,
            leagueId: games.leagueId,
         })
         .from(games)
         .where(eq(games.id, parseInt(gameId)))
         .limit(1);

      if (gameResult.length === 0) {
         return Response.json({ error: 'Game not found' }, { status: 404 });
      }

      // Find the game player record
      const gamePlayerResult = await db
         .select({ id: gamePlayers.id, userId: gamePlayers.userId })
         .from(gamePlayers)
         .where(
            and(
               eq(gamePlayers.gameId, parseInt(gameId)),
               eq(gamePlayers.id, parseInt(gamePlayerId))
            )
         )
         .limit(1);

      if (gamePlayerResult.length === 0) {
         return Response.json(
            { error: 'Player not found in game' },
            { status: 404 }
         );
      }

      const { id: actualGamePlayerId, userId: playerUserId } =
         gamePlayerResult[0];

      // Calculate profit
      const profit = buyOutAmount - buyInAmount;

      // Execute database operations sequentially
      // Note: neon-http driver doesn't support transactions, so operations are sequential
      // Delete existing cash-ins and cash-outs for this player
      await db
         .delete(cashIns)
         .where(
            and(
               eq(cashIns.gamePlayerId, actualGamePlayerId),
               eq(cashIns.gameId, parseInt(gameId))
            )
         );

      // Create new buy-in records if amount > 0
      if (buyInAmount > 0) {
         await db.insert(cashIns).values({
            gameId: parseInt(gameId),
            userId: playerUserId,
            gamePlayerId: actualGamePlayerId,
            amount: buyInAmount.toFixed(2),
            type: 'buy_in',
         });
      }

      // Create new buy-out records if amount > 0
      if (buyOutAmount > 0) {
         await db.insert(cashIns).values({
            gameId: parseInt(gameId),
            userId: playerUserId,
            gamePlayerId: actualGamePlayerId,
            amount: buyOutAmount.toFixed(2),
            type: 'buy_out',
         });
      }

      // Update player's final amount and profit
      await db
         .update(gamePlayers)
         .set({
            finalAmount: buyOutAmount > 0 ? buyOutAmount.toFixed(2) : null,
            profit: profit.toFixed(2),
            // Keep isActive status as is (don't change it)
         })
         .where(eq(gamePlayers.id, actualGamePlayerId));

      return Response.json(
         {
            success: true,
            message: 'Player amounts updated successfully',
            profit: profit.toFixed(2),
         },
         {
            status: 200,
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );
   } catch (error) {
      const errorMessage =
         error instanceof Error
            ? error.message
            : 'Failed to edit player amounts';
      return Response.json(
         {
            error: errorMessage,
         },
         {
            status: 500,
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );
   }
});
