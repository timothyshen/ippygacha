import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "points"; // 'points' or 'xp'
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!["points", "xp"].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "points" or "xp"' },
        { status: 400 }
      );
    }

    const orderColumn = type === "points" ? "totalPoints" : "totalXp";

    const { data: users, error } = await supabase
      .from("users")
      .select(
        `
          id,
          walletAddress,
          username,
          avatarUrl,
          totalPoints,
          totalXp,
          currentLevel,
          createdAt
        `
      )
      .order(orderColumn, { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    // Format leaderboard data
    const leaderboard = (users ?? []).map((user, index) => ({
      rank: index + 1,
      walletAddress: user.walletAddress,
      username: user.username,
      avatarUrl: user.avatarUrl,
      totalPoints: user.totalPoints,
      totalXp: user.totalXp,
      currentLevel: user.currentLevel,
      joinedAt: user.createdAt,
    }));

    return NextResponse.json({
      type,
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
