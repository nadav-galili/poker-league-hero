import { withAuth } from "@/utils/middleware";

export const POST = withAuth(async (request: Request, user) => {
  try {
    const url = new URL(request.url);
    const gameId = url.pathname.split("/")[3]; // Extract gameId from /api/games/[gameId]/remove-player
    const { playerId } = await request.json();

    if (!user.userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!gameId || !playerId) {
      return Response.json(
        { error: "Game ID and player ID are required" },
        { status: 400 }
      );
    }

    // Import database modules
    const { getDb, games, gamePlayers } = await import("../../../../db");
    const { eq, and } = await import("drizzle-orm");
    const db = getDb();

    // Verify game exists and is active
    const gameResult = await db
      .select({ id: games.id, status: games.status })
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (gameResult.length === 0) {
      return Response.json({ error: "Game not found" }, { status: 404 });
    }

    if (gameResult[0].status !== "active") {
      return Response.json({ error: "Game is not active" }, { status: 400 });
    }

    // Find the game player record
    const gamePlayerResult = await db
      .select({ id: gamePlayers.id, isActive: gamePlayers.isActive })
      .from(gamePlayers)
      .where(
        and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, playerId))
      )
      .limit(1);

    if (gamePlayerResult.length === 0) {
      return Response.json(
        { error: "Player not found in game" },
        { status: 404 }
      );
    }

    if (!gamePlayerResult[0].isActive) {
      return Response.json(
        { error: "Player is already inactive" },
        { status: 400 }
      );
    }

    // Mark player as inactive (remove from active players)
    await db
      .update(gamePlayers)
      .set({
        isActive: false,
        leftAt: new Date(),
      })
      .where(eq(gamePlayers.id, gamePlayerResult[0].id));

    return Response.json({
      success: true,
      message: "Player removed from game successfully",
    });
  } catch (error) {
    console.error("Error removing player from game:", error);
    return Response.json(
      { error: "Failed to remove player from game" },
      { status: 500 }
    );
  }
});
