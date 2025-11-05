import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  getActivityRewards,
  checkLevelUp,
  LEVEL_CONFIG,
} from "@/lib/points-system";
import { ACTIVITY_TYPES, isActivityType } from "@/lib/activity-types";
import {
  rateLimiter,
  RATE_LIMITS,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { walletAddress, activityType, metadata, txnHash } = body;

    if (!walletAddress || !activityType) {
      return NextResponse.json(
        { error: "Wallet address and activity type are required" },
        { status: 400 }
      );
    }

    // Rate limit by wallet address - prevent point farming
    const clientId = `wallet:${walletAddress.toLowerCase()}`;
    const rateLimit = rateLimiter.check(
      clientId,
      RATE_LIMITS.POINTS.limit,
      RATE_LIMITS.POINTS.windowMs
    );

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        "Too many point award requests. Please try again later.",
        rateLimit.resetTime,
        rateLimit.retryAfter!
      );
    }

    if (!isActivityType(activityType)) {
      return NextResponse.json(
        {
          error: "Invalid activity type",
          received: activityType,
          validTypes: ACTIVITY_TYPES,
        },
        { status: 400 }
      );
    }

    // Get rewards for this activity
    const rewards = getActivityRewards(activityType);
    const normalizedWallet = walletAddress.toLowerCase();

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
      .eq("walletAddress", normalizedWallet)
      .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    const timestamp = new Date().toISOString();
    let user = existingUser;

    if (!user) {
      const { data: createdUser, error: createError } = await supabase
        .from("users")
        .insert({
          walletAddress: normalizedWallet,
          totalPoints: 0,
          totalXp: 0,
          currentLevel: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
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

      if (createError) {
        throw createError;
      }

      user = createdUser;
    }

    const oldXp = user.totalXp;
    const newXp = user.totalXp + rewards.xp;
    const newPoints = user.totalPoints + rewards.points;
    const leveledUp = checkLevelUp(oldXp, newXp);
    const newLevelInfo = LEVEL_CONFIG.getLevelFromXp(newXp);

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        totalPoints: newPoints,
        totalXp: newXp,
        currentLevel: newLevelInfo.level,
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

    if (updateError) {
      throw updateError;
    }

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        id: crypto.randomUUID(),
        userId: user.id,
        activityType,
        pointsEarned: rewards.points,
        xpEarned: rewards.xp,
        metadata: metadata ?? {},
        txnHash: txnHash ?? null,
        createdAt: timestamp,
      })
      .select(
        `
          id,
          activityType,
          pointsEarned,
          xpEarned,
          createdAt
        `
      )
      .single();

    if (activityError) {
      throw activityError;
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser.id,
          walletAddress: updatedUser.walletAddress,
          totalPoints: updatedUser.totalPoints,
          totalXp: updatedUser.totalXp,
          currentLevel: updatedUser.currentLevel,
          levelInfo: newLevelInfo,
        },
        activity,
        leveledUp,
        rewards,
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Error awarding points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
