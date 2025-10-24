import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "points"; // 'points' or 'xp'
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!["points", "xp"].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "points" or "xp"' },
        { status: 400 }
      );
    }

    const orderBy =
      type === "points"
        ? { totalPoints: "desc" as const }
        : { totalXp: "desc" as const };

    const users = await prisma.user.findMany({
      orderBy,
      take: limit,
      select: {
        id: true,
        walletAddress: true,
        username: true,
        avatarUrl: true,
        totalPoints: true,
        totalXp: true,
        currentLevel: true,
        createdAt: true,
      },
    });

    // Format leaderboard data
    const leaderboard = users.map((user, index) => ({
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
