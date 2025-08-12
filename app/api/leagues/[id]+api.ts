import { getLeagueDetails } from "../../../utils/leagueUtils";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({ error: "Missing league ID" }, { status: 400 });
    }

    const league = await getLeagueDetails(id);

    return Response.json({
      league,
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
