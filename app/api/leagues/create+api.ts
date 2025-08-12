import { createLeague } from "../../../utils/leagueUtils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, imageUrl, adminUserId } = body;

    if (!name || !adminUserId) {
      return Response.json(
        { error: "Missing required fields: name, adminUserId" },
        { status: 400 }
      );
    }

    const league = await createLeague({
      name,
      imageUrl,
      adminUserId,
    });

    return Response.json({
      league,
      message: "League created successfully",
    });
  } catch (error) {
    console.error("Error creating league:", error);
    return Response.json({ error: "Failed to create league" }, { status: 500 });
  }
}
