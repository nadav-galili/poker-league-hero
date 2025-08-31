import { withAuth } from "@/utils/middleware";

export const POST = withAuth(async (request: Request, user) => {
  try {
    const url = new URL(request.url);
    const gameId = url.pathname.split("/")[3]; // Extract gameId from /api/games/[gameId]/buy-out
    const { playerId, amount } = await request.json();

    if (!user.userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!gameId || !playerId || !amount) {
      return Response.json(
        { error: "Game ID, player ID, and amount are required" },
        { status: 400 }
      );
    }

    const buyOutAmount = parseFloat(amount);
    if (buyOutAmount < 0) {
      return Response.json(
        { error: "Invalid buy-out amount" },
        { status: 400 }
      );
    }

    // Import database modules
    const { getDb, games, gamePlayers, cashIns } = await import(
      "../../../../db"
    );
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
      .select({ id: gamePlayers.id })
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

    const gamePlayerId = gamePlayerResult[0].id;

    // Create buy-out record
    const newCashOut = await db
      .insert(cashIns)
      .values({
        gameId,
        userId: playerId,
        gamePlayerId,
        amount: buyOutAmount.toFixed(2),
        type: "buy_out",
      })
      .returning();

    // Update player's final amount and profit
    const totalBuyIns = await db
      .select({ amount: cashIns.amount })
      .from(cashIns)
      .where(
        and(eq(cashIns.gamePlayerId, gamePlayerId), eq(cashIns.type, "buy_in"))
      );

    const totalBuyOuts = await db
      .select({ amount: cashIns.amount })
      .from(cashIns)
      .where(
        and(eq(cashIns.gamePlayerId, gamePlayerId), eq(cashIns.type, "buy_out"))
      );

    const totalBuyInAmount = totalBuyIns.reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0
    );
    const totalBuyOutAmount = totalBuyOuts.reduce(
      (sum, c) => sum + parseFloat(c.amount),
      0
    );
    const profit = totalBuyOutAmount - totalBuyInAmount;

    await db
      .update(gamePlayers)
      .set({
        finalAmount: totalBuyOutAmount.toFixed(2),
        profit: profit.toFixed(2),
        isActive: false, // Mark player as inactive when they cash out
        leftAt: new Date(), // Record when they left the game
      })
      .where(eq(gamePlayers.id, gamePlayerId));

    return Response.json({
      success: true,
      cashOut: newCashOut[0],
      profit: profit.toFixed(2),
      message: "Buy-out successful",
    });
  } catch (error) {
    console.error("Error processing buy-out:", error);
    return Response.json(
      { error: "Failed to process buy-out" },
      { status: 500 }
    );
  }
});
