import { withAuth } from '@/utils/middleware';

export const POST = withAuth(async (request: Request, user) => {
   try {
      const url = new URL(request.url);
      const gameId = url.pathname.split('/')[3]; // Extract gameId from /api/games/[gameId]/undo-buy-in
      const { gamePlayerId } = await request.json();

      if (!user.userId) {
         return Response.json(
            { error: 'User not authenticated' },
            { status: 401 }
         );
      }

      if (!gameId || !gamePlayerId) {
         return Response.json(
            { error: 'Game ID and game player ID are required' },
            { status: 400 }
         );
      }

      // Import database modules
      const { getDb, cashIns } = await import('../../../../db');
      const { eq, and, desc } = await import('drizzle-orm');
      const db = getDb();

      // Find the latest buy-in for this player
      const latestBuyIn = await db
         .select()
         .from(cashIns)
         .where(
            and(
               eq(cashIns.gameId, parseInt(gameId)),
               eq(cashIns.gamePlayerId, parseInt(gamePlayerId)),
               eq(cashIns.type, 'buy_in')
            )
         )
         .orderBy(desc(cashIns.createdAt))
         .limit(1);

      if (latestBuyIn.length === 0) {
         return Response.json(
            { error: 'No buy-in found to undo' },
            { status: 404 }
         );
      }

      // Delete the record
      await db.delete(cashIns).where(eq(cashIns.id, latestBuyIn[0].id));

      return Response.json({
         success: true,
         message: 'Buy-in undone successfully',
      });
   } catch (error) {
      console.error('Error undoing buy-in:', error);
      return Response.json({ error: 'Failed to undo buy-in' }, { status: 500 });
   }
});
