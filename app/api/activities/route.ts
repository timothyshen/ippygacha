import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isActivityType } from "@/lib/activity-types";
import {
  rateLimiter,
  RATE_LIMITS,
  getClientIdentifier,
  createRateLimitResponse,
} from "@/lib/rate-limit";

// GET all activities with optional filtering
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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const userId = searchParams.get("userId");
    const activityType = searchParams.get("activityType");
    const walletAddress = searchParams.get("walletAddress");

    if (activityType && !isActivityType(activityType)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    let resolvedUserId = userId;

    if (walletAddress) {
      const { data: walletUser, error: walletUserError } = await supabase
        .from("users")
        .select("id")
        .eq("walletAddress", walletAddress.toLowerCase())
        .maybeSingle();

      if (walletUserError) {
        throw walletUserError;
      }

      if (!walletUser) {
        return NextResponse.json({
          activities: [],
          pagination: { total: 0, limit, offset, hasMore: false },
        });
      }

      resolvedUserId = walletUser.id;
    }

    let query = supabase
      .from("activities")
      .select(
        `
          id,
          userId,
          activityType,
          pointsEarned,
          xpEarned,
          metadata,
          txnHash,
          createdAt,
          user:userId (
            id,
            walletAddress,
            username,
            avatarUrl
          )
        `,
        { count: "exact" }
      )
      .order("createdAt", { ascending: false });

    if (resolvedUserId) {
      query = query.eq("userId", resolvedUserId);
    }

    if (activityType) {
      query = query.eq("activityType", activityType);
    }

    const {
      data: activities,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        activities,
        pagination: {
          total: count ?? 0,
          limit,
          offset,
          hasMore: offset + limit < (count ?? 0),
        },
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new activity
export async function POST(request: NextRequest) {
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
        "Too many activity creation requests. Please try again later.",
        rateLimit.resetTime,
        rateLimit.retryAfter!
      );
    }

    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { userId, activityType, pointsEarned, xpEarned, metadata, txnHash } =
      body;

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: "userId and activityType are required" },
        { status: 400 }
      );
    }

    // Validate activity type
    if (!isActivityType(activityType)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({
        id: crypto.randomUUID(),
        userId,
        activityType,
        pointsEarned: pointsEarned ?? 0,
        xpEarned: xpEarned ?? 0,
        metadata: metadata ?? {},
        txnHash: txnHash ?? null,
      })
      .select(
        `
          id,
          userId,
          activityType,
          pointsEarned,
          xpEarned,
          metadata,
          txnHash,
          createdAt,
          user:userId (
            id,
            walletAddress,
            username,
            avatarUrl
          )
        `
      )
      .single();

    if (activityError) {
      throw activityError;
    }

    return NextResponse.json(
      { activity },
      {
        status: 201,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
