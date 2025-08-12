import { getUserLeagues } from "../../../utils/leagueUtils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    const userLeagues = await getUserLeagues(userId);

    return Response.json({
      leagues: userLeagues,
      count: userLeagues.length,
    });
  } catch (error) {
    console.error("Error fetching user leagues:", error);
    return Response.json(
      { error: "Failed to fetch user leagues" },
      { status: 500 }
    );
  }
}
