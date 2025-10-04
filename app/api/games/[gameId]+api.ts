import { withAuth } from '@/utils/middleware';

export const GET = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const gameId = parseInt(url.pathname.split('/').pop() || '', 10); // Extract gameId from path

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
      const { getDb, games, gamePlayers, users, cashIns } = await import(
         '../../../db'
      );
      const { eq } = await import('drizzle-orm');
      const db = getDb();

      // Fetch game details with league information
      const gameResult = await db
         .select({
            id: games.id,
            leagueId: games.leagueId,
            createdBy: games.createdBy,
            buyIn: games.buyIn,
            status: games.status,
            startedAt: games.startedAt,
            endedAt: games.endedAt,
         })
         .from(games)
         .where(eq(games.id, gameId))
         .limit(1);

      if (gameResult.length === 0) {
         return Response.json({ error: 'Game not found' }, { status: 404 });
      }

      const game = gameResult[0];

      // Fetch all players in the game with their details and cash-ins/outs
      const playersResult = await db
         .select({
            id: gamePlayers.id,
            userId: users.id,
            fullName: users.fullName,
            profileImageUrl: users.profileImageUrl,
            isActive: gamePlayers.isActive,
            joinedAt: gamePlayers.joinedAt,
            leftAt: gamePlayers.leftAt,
            finalAmount: gamePlayers.finalAmount,
            profit: gamePlayers.profit,
         })
         .from(gamePlayers)
         .innerJoin(users, eq(gamePlayers.userId, users.id))
         .where(eq(gamePlayers.gameId, gameId));

      // Fetch all cash-ins and cash-outs for each player
      const cashInsResult = await db
         .select({
            id: cashIns.id,
            gamePlayerId: cashIns.gamePlayerId,
            userId: cashIns.userId,
            amount: cashIns.amount,
            type: cashIns.type,
            chipCount: cashIns.chipCount,
            notes: cashIns.notes,
            createdAt: cashIns.createdAt,
         })
         .from(cashIns)
         .where(eq(cashIns.gameId, gameId));

      // Group cash-ins by player
      const playerCashIns = cashInsResult.reduce(
         (
            acc: Record<string, typeof cashInsResult>,
            cashIn: (typeof cashInsResult)[0]
         ) => {
            if (!acc[cashIn.gamePlayerId]) {
               acc[cashIn.gamePlayerId] = [];
            }
            acc[cashIn.gamePlayerId].push(cashIn);
            return acc;
         },
         {} as Record<string, typeof cashInsResult>
      );

      // Combine player data with cash-ins
      const playersWithCashIns = playersResult.map(
         (player: (typeof playersResult)[0]) => {
            const playerCashInsList = playerCashIns[player.id] || [];
            const totalBuyIns = playerCashInsList
               .filter((c: (typeof cashInsResult)[0]) => c.type === 'buy_in')
               .reduce(
                  (sum: number, c: (typeof cashInsResult)[0]) =>
                     sum + parseFloat(c.amount),
                  0
               );
            const totalBuyOuts = playerCashInsList
               .filter((c: (typeof cashInsResult)[0]) => c.type === 'buy_out')
               .reduce(
                  (sum: number, c: (typeof cashInsResult)[0]) =>
                     sum + parseFloat(c.amount),
                  0
               );

            return {
               ...player,
               cashIns: playerCashInsList,
               totalBuyIns,
               totalBuyOuts,
               currentProfit: totalBuyOuts - totalBuyIns,
            };
         }
      );

      // Calculate game totals
      const gameTotals = {
         totalBuyIns: playersWithCashIns.reduce(
            (sum: number, p: (typeof playersWithCashIns)[0]) =>
               sum + p.totalBuyIns,
            0
         ),
         totalBuyOuts: playersWithCashIns.reduce(
            (sum: number, p: (typeof playersWithCashIns)[0]) =>
               sum + p.totalBuyOuts,
            0
         ),
         activePlayers: playersWithCashIns.filter(
            (p: (typeof playersWithCashIns)[0]) => p.isActive
         ).length,
         totalPlayers: playersWithCashIns.length,
      };

      return Response.json({
         success: true,
         game: {
            ...game,
            players: playersWithCashIns,
            totals: gameTotals,
         },
      });
   } catch (error) {
      console.error('Error fetching game details:', error);
      return Response.json(
         { error: 'Failed to fetch game details' },
         { status: 500 }
      );
   }
});
