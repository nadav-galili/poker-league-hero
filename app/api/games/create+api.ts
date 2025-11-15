import { withAuth } from '@/utils/middleware';

export const POST = withAuth(async (request: Request, user) => {
   try {
      console.log('📡 [GameAPI] Received game creation request');
      const { leagueId, selectedPlayerIds, buyIn } = await request.json();

      console.log('📡 [GameAPI] Request data parsed:', {
         leagueId,
         selectedPlayerIds,
         buyIn,
         userId: user.userId,
      });

      if (!user.userId) {
         console.warn('📡 [GameAPI] User not authenticated');
         return Response.json(
            { success: false, message: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (!leagueId || !selectedPlayerIds || selectedPlayerIds.length < 2) {
         console.warn(
            '📡 [GameAPI] Validation failed - missing or invalid data:',
            {
               leagueId: !!leagueId,
               selectedPlayerIds: !!selectedPlayerIds,
               playerCount: selectedPlayerIds?.length || 0,
            }
         );
         return Response.json(
            {
               success: false,
               message: 'League ID and at least 2 players are required',
            },
            { status: 400 }
         );
      }

      if (!buyIn || parseFloat(buyIn) <= 0) {
         console.warn('📡 [GameAPI] Invalid buy-in amount:', buyIn);
         return Response.json(
            { success: false, message: 'Valid buy-in amount is required' },
            { status: 400 }
         );
      }

      console.log(
         '📡 [GameAPI] Validation passed, importing database modules...'
      );
      // Import database modules
      const { getDb, games, gamePlayers, cashIns } = await import(
         '../../../db'
      );
      const db = getDb();

      console.log('📡 [GameAPI] Creating game in database...');
      // Create the game
      const newGame = await db
         .insert(games)
         .values({
            leagueId,
            createdBy: user.userId,
            buyIn: parseFloat(buyIn),
            status: 'active',
         })
         .returning();

      const gameId = newGame[0].id;
      console.log('📡 [GameAPI] Game created with ID:', gameId);

      console.log('📡 [GameAPI] Adding players to game...');
      // Add all selected players to the game
      const gamePlayerPromises = selectedPlayerIds.map((playerId: string) => {
         const userIdNum = parseInt(playerId, 10);
         console.log('📡 [GameAPI] Converting playerId:', {
            original: playerId,
            converted: userIdNum,
            type: typeof userIdNum,
         });

         return db
            .insert(gamePlayers)
            .values({
               gameId,
               userId: userIdNum,
               isActive: true,
            })
            .returning();
      });

      const gamePlayersResults = await Promise.all(gamePlayerPromises);
      console.log('📡 [GameAPI] Players added:', gamePlayersResults.length);

      console.log('📡 [GameAPI] Creating cash-in records...');
      // Create initial buy-ins for all players
      const buyInAmount = parseFloat(buyIn); // Convert once, use as number
      const cashInPromises = gamePlayersResults.map(
         (gamePlayerResult, index) => {
            const gamePlayer = gamePlayerResult[0];
            const playerId = selectedPlayerIds[index];
            const userIdNum = parseInt(playerId, 10);
            console.log('📡 [GameAPI] Creating cash-in for playerId:', {
               original: playerId,
               converted: userIdNum,
            });

            return db
               .insert(cashIns)
               .values({
                  gameId,
                  userId: userIdNum,
                  gamePlayerId: gamePlayer.id,
                  amount: buyInAmount,
                  type: 'buy_in',
               })
               .returning();
         }
      );

      await Promise.all(cashInPromises);
      console.log('📡 [GameAPI] Cash-in records created');

      console.log('📡 [GameAPI] Game creation successful, returning response');
      return Response.json(
         {
            success: true,
            gameId: newGame[0].id,
            game: newGame[0],
            message: 'Game created successfully',
         },
         { status: 201 }
      );
   } catch (error) {
      console.error('📡 [GameAPI] Error creating game:', error);
      console.error(
         '📡 [GameAPI] Error stack:',
         error instanceof Error ? error.stack : 'N/A'
      );
      console.error('📡 [GameAPI] Full error object:', {
         message: error instanceof Error ? error.message : String(error),
         name: error instanceof Error ? error.name : 'Unknown',
         cause: error instanceof Error ? (error as any).cause : undefined,
      });
      return Response.json(
         {
            success: false,
            message: 'Failed to create game',
            error: error instanceof Error ? error.message : String(error),
            details: error instanceof Error ? error.stack : undefined,
         },
         { status: 500 }
      );
   }
});
