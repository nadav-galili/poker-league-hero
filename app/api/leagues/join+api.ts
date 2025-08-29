import {
  findLeagueByInviteCode,
  joinLeagueByInviteCode,
  validateInviteCode,
} from "../../../utils/leagueUtils";
import { withAuth } from "../../../utils/middleware";

export const POST = withAuth(async (request: Request, user) => {
  try {
    const body = await request.json();
    const { inviteCode } = body;

    if (!user.userId) {
      return Response.json(
        { error: "User ID not found in token" },
        { status: 400 }
      );
    }

    // Validate invite code format
    const validation = validateInviteCode(inviteCode);
    if (!validation.isValid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // Check if league exists with this invite code
    const league = await findLeagueByInviteCode(inviteCode);
    if (!league) {
      return Response.json(
        { error: "League not found with this invite code" },
        { status: 404 }
      );
    }

    // Check if league is active
    if (!league.isActive) {
      return Response.json(
        { error: "This league is no longer active" },
        { status: 400 }
      );
    }

    // Attempt to join the league
    try {
      const membership = await joinLeagueByInviteCode(inviteCode, user.userId);

      return Response.json(
        {
          success: true,
          league: {
            id: league.id,
            name: league.name,
            inviteCode: league.inviteCode,
          },
          membership,
          message: "Successfully joined the league",
        },
        { status: 201 }
      );
    } catch (joinError) {
      // Handle specific join errors (already a member, etc.)
      const errorMessage =
        joinError instanceof Error
          ? joinError.message
          : "Failed to join league";

      if (errorMessage.includes("already a member")) {
        return Response.json(
          { error: "You are already a member of this league" },
          { status: 409 }
        );
      }

      return Response.json({ error: errorMessage }, { status: 400 });
    }
  } catch (error) {
    console.error("Error joining league:", error);
    return Response.json({ error: "Failed to join league" }, { status: 500 });
  }
});
