import { getDb, games, gamePlayers, anonymousPlayers, users } from '../db';
import { desc, eq } from 'drizzle-orm';

async function debugLatestGame() {
   const db = getDb();

   // Get latest game
   const latestGames = await db
      .select()
      .from(games)
      .orderBy(desc(games.id))
      .limit(1);

   if (latestGames.length === 0) {
      console.log('No games found.');
      return;
   }

   const game = latestGames[0];
   console.log('Latest Game:', game);

   // Get players for this game
   const players = await db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.gameId, game.id));
   console.log(`Found ${players.length} players for game ${game.id}:`);
   console.log(players);

   // Check anonymous players
   const anonPlayers = await db.select().from(anonymousPlayers);
   console.log(`Total anonymous players in DB: ${anonPlayers.length}`);
   console.log(anonPlayers);

   process.exit(0);
}

debugLatestGame().catch(console.error);
