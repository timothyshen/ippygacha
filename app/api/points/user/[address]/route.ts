import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { LEVEL_CONFIG } from "@/lib/points-system";
import {
  rateLimiter,
  RATE_LIMITS,
  getClientIdentifier,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
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
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    const { data: existingUser, error: existingUserError } = await supabase
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
          createdAt,
          updatedAt
        `
      )
      .eq("walletAddress", normalizedAddress)
      .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    const now = new Date().toISOString();
    let user = existingUser;

    if (!user) {
      const { data: createdUser, error: createUserError } = await supabase
        .from("users")
        .insert({
          walletAddress: normalizedAddress,
          totalPoints: 0,
          totalXp: 0,
          currentLevel: 1,
          createdAt: now,
          updatedAt: now,
        })
        .select(
          `
            id,
            walletAddress,
            username,
            avatarUrl,
            totalPoints,
            totalXp,
            currentLevel,
            createdAt,
            updatedAt
          `
        )
        .single();

      if (createUserError) {
        throw createUserError;
      }

      user = createdUser;
    }

    const { data: recentActivities, error: activitiesError } = await supabase
      .from("activities")
      .select(
        `
          id,
          activityType,
          pointsEarned,
          xpEarned,
          metadata,
          txnHash,
          createdAt
        `
      )
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })
      .limit(10);

    if (activitiesError) {
      throw activitiesError;
    }

    const levelInfo = LEVEL_CONFIG.getLevelFromXp(user.totalXp);

    if (user.currentLevel !== levelInfo.level) {
      const { data: updatedUser, error: levelUpdateError } = await supabase
        .from("users")
        .update({
          currentLevel: levelInfo.level,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select(
          `
            id,
            walletAddress,
            username,
            avatarUrl,
            totalPoints,
            totalXp,
            currentLevel,
            createdAt,
            updatedAt
          `
        )
        .single();

      if (levelUpdateError) {
        throw levelUpdateError;
      }

      user = updatedUser;
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          avatarUrl: user.avatarUrl,
          totalPoints: user.totalPoints,
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          levelInfo,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        recentActivities: recentActivities ?? [],
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
