import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  rateLimiter,
  RATE_LIMITS,
  getClientIdentifier,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per minute per IP
    const clientId = getClientIdentifier(request);
    const rateLimit = rateLimiter.check(
      clientId,
      RATE_LIMITS.GENERAL.limit,
      RATE_LIMITS.GENERAL.windowMs
    );

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        "Too many requests. Please try again later.",
        rateLimit.resetTime,
        rateLimit.retryAfter!
      );
    }

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

    return NextResponse.json(
      {
        type,
        leaderboard,
        total: leaderboard.length,
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
