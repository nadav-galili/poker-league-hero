import { getLeagueDetails } from "../../../utils/leagueUtils";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Extract ID from path

    if (!id) {
      return Response.json({ error: "League ID is required" }, { status: 400 });
    }

    const league = await getLeagueDetails(id);

    // Format the image URL for display
    let imageUrl = league.imageUrl;
    if (imageUrl && !imageUrl.startsWith("http")) {
      //If it's a relative path, construct the full R2 URL
      if (imageUrl.includes("/")) {
        imageUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/poker-league-images/${imageUrl}`;
      } else {
        imageUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/poker-league-images/league-images/${imageUrl}`;
      }
    }

    if (imageUrl && imageUrl.includes("poker-league-images.r2.dev")) {
      // Fix old URLs that use the custom domain
      imageUrl = imageUrl.replace(
        "https://poker-league-images.r2.dev",
        `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/poker-league-images`
      );
    } else if (
      imageUrl &&
      imageUrl.includes("pub-6908906fe4c24b7b82ff61e803190c28.r2.dev") &&
      !imageUrl.includes("poker-league-images")
    ) {
      // Fix URLs missing the poker-league-images prefix
      imageUrl = imageUrl.replace(
        "https://pub-6908906fe4c24b7b82ff61e803190c28.r2.dev/",
        `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/poker-league-images/`
      );
    }

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
