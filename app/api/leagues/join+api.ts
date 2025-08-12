import { joinLeagueByInviteCode } from "../../../utils/leagueUtils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inviteCode, userId } = body;

    if (!inviteCode || !userId) {
      return Response.json(
        { error: "Missing required fields: inviteCode, userId" },
        { status: 400 }
      );
    }

    const member = await joinLeagueByInviteCode(inviteCode, userId);

    return Response.json({
      member,
      message: "Successfully joined league",
    });
  } catch (error) {
    console.error("Error joining league:", error);

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: "Failed to join league" }, { status: 500 });
  }
}
