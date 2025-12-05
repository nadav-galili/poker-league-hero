import { withAuth } from '@/utils/middleware';

export const POST = withAuth(async (request: Request, user) => {
   try {
      console.log('📡 [GameAPI] Received game creation request');
      const { leagueId, selectedPlayerIds, anonymousPlayers, buyIn } =
         await request.json();

      console.log('📡 [GameAPI] Request data parsed:', {
         leagueId,
         selectedPlayerIds,
         anonymousPlayers,
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

      const regularPlayerCount = selectedPlayerIds?.length || 0;
      const anonymousPlayerCount = anonymousPlayers?.length || 0;
      const totalPlayers = regularPlayerCount + anonymousPlayerCount;

      if (!leagueId || totalPlayers < 2) {
         console.warn(
            '📡 [GameAPI] Validation failed - missing or invalid data:',
            {
               leagueId: !!leagueId,
               selectedPlayerIds: !!selectedPlayerIds,
               playerCount: totalPlayers,
            }
         );
         return Response.json(
            {
               success: false,
               message: 'League ID and at least 2 players (total) are required',
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
      const {
         getDb,
         games,
         gamePlayers,
         cashIns,
         anonymousPlayers: anonymousPlayersTable,
      } = await import('../../../db');
      const db = getDb();

      console.log('📡 [GameAPI] Creating game in database...');
      // Create the game
      const newGame = await db
         .insert(games)
         .values({
            leagueId: parseInt(leagueId),
            createdBy: user.userId,
            buyIn: parseFloat(buyIn),
            status: 'active',
         })
         .returning();

      const gameId = newGame[0].id;
      console.log('📡 [GameAPI] Game created with ID:', gameId);

      // 1. Create Anonymous Players if any
      const createdAnonymousPlayers = [];
      if (anonymousPlayerCount > 0) {
         console.log('📡 [GameAPI] Creating anonymous players...');
         for (const player of anonymousPlayers) {
            const [newPlayer] = await db
               .insert(anonymousPlayersTable)
               .values({
                  leagueId: parseInt(leagueId),
                  name: player.name,
               })
               .returning();
            createdAnonymousPlayers.push(newPlayer);
         }
         console.log(
            `📡 [GameAPI] Created ${createdAnonymousPlayers.length} anonymous players`
         );
      }

      console.log('📡 [GameAPI] Adding players to game...');

      const gamePlayersData = [];
      const buyInAmount = parseFloat(buyIn).toString();

      // Prepare Regular Players
      if (selectedPlayerIds && selectedPlayerIds.length > 0) {
         selectedPlayerIds.forEach((pid: string) => {
            gamePlayersData.push({
               gameId,
               userId: parseInt(pid, 10),
               isActive: true,
            });
         });
      }

      // Prepare Anonymous Players
      createdAnonymousPlayers.forEach((ap) => {
         gamePlayersData.push({
            gameId,
            anonymousPlayerId: ap.id,
            isActive: true,
         });
      });

      // Insert all game players
      if (gamePlayersData.length > 0) {
         const insertedGamePlayers = await db
            .insert(gamePlayers)
            .values(gamePlayersData)
            .returning();

         console.log(
            `📡 [GameAPI] Inserted ${insertedGamePlayers.length} game players`
         );

         // Prepare Cash Ins
         const cashInsData = insertedGamePlayers.map((gp) => ({
            gameId,
            userId: gp.userId, // Will be null for anonymous, which is fine
            gamePlayerId: gp.id,
            amount: buyInAmount,
            type: 'buy_in',
         }));

         // Insert all cash ins
         await db.insert(cashIns).values(cashInsData);
         console.log(
            `📡 [GameAPI] Inserted ${cashInsData.length} cash-in records`
         );
      }

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
      return Response.json(
         {
            success: false,
            message: 'Failed to create game',
            error: error instanceof Error ? error.message : String(error),
         },
         { status: 500 }
      );
   }
});
