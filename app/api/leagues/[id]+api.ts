import { getLeagueDetails } from "../../../utils/leagueUtils";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Extract ID from path

    if (!id) {
      return Response.json({ error: "League ID is required" }, { status: 400 });
    }

    const league = await getLeagueDetails(id);

    // Image URL is already in correct format from database
    const imageUrl = league.imageUrl;

    const formattedLeague = {
      id: league.id,
      name: league.name,
      imageUrl,
      inviteCode: league.inviteCode,
      memberCount: league.members?.length || 0,
      isActive: league.isActive,
      createdAt: league.createdAt,
      members: league.members,
    };

    return Response.json({
      league: formattedLeague,
      message: "League details retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching league details:", error);

    if (error instanceof Error && error.message === "League not found") {
      return Response.json({ error: "League not found" }, { status: 404 });
    }

    return Response.json(
      { error: "Failed to fetch league details" },
      { status: 500 }
    );
  }
}
