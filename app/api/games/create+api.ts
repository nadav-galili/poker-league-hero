import { withAuth } from "@/utils/middleware";

export const POST = withAuth(async (request: Request, user) => {
  try {
    const { leagueId, selectedPlayers, buyIn } = await request.json();

    if (!user.userId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!leagueId || !selectedPlayers || selectedPlayers.length < 2) {
      return Response.json(
        { error: "League ID and at least 2 players are required" },
        { status: 400 }
      );
    }

    if (!buyIn || parseFloat(buyIn) <= 0) {
      return Response.json(
        { error: "Valid buy-in amount is required" },
        { status: 400 }
      );
    }

    // Import database modules
    const { getDb, games, gamePlayers, cashIns } = await import("../../../db");
    const db = getDb();

    // Create the game
    const newGame = await db
      .insert(games)
      .values({
        leagueId,
        createdBy: user.userId,
        buyIn: parseFloat(buyIn).toFixed(2),
        status: "active",
      })
      .returning();

    const gameId = newGame[0].id;

    // Add all selected players to the game
    const gamePlayerPromises = selectedPlayers.map((playerId: string) =>
      db
        .insert(gamePlayers)
        .values({
          gameId,
          userId: playerId,
          isActive: true,
        })
        .returning()
    );

    const gamePlayersResults = await Promise.all(gamePlayerPromises);

    // Create initial buy-ins for all players
    const cashInPromises = gamePlayersResults.map((gamePlayerResult, index) => {
      const gamePlayer = gamePlayerResult[0];
      const playerId = selectedPlayers[index];

      return db
        .insert(cashIns)
        .values({
          gameId,
          userId: playerId,
          gamePlayerId: gamePlayer.id,
          amount: parseFloat(buyIn).toFixed(2),
          type: "buy_in",
        })
        .returning();
    });

    await Promise.all(cashInPromises);

    return Response.json(
      {
        success: true,
        game: newGame[0],
        message: "Game created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating game:", error);
    return Response.json({ error: "Failed to create game" }, { status: 500 });
  }
});
