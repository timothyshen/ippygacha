import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { ActivityType } from "@prisma/client";

// GET all activities with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const userId = searchParams.get("userId");
    const activityType = searchParams.get("activityType");
    const walletAddress = searchParams.get("walletAddress");

    // Build filter object
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (walletAddress) {
      // Find user by wallet address first
      const user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });
      if (user) {
        where.userId = user.id;
      } else {
        return NextResponse.json({
          activities: [],
          pagination: { total: 0, limit, offset, hasMore: false },
        });
      }
    }

    if (activityType && Object.values(ActivityType).includes(activityType as ActivityType)) {
      where.activityType = activityType;
    }

    const activities = await prisma.activity.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const total = await prisma.activity.count({ where });

    return NextResponse.json({
      activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
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
    const body = await request.json();
    const { userId, activityType, pointsEarned, xpEarned, metadata, txnHash } = body;

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: "userId and activityType are required" },
        { status: 400 }
      );
    }

    // Validate activity type
    if (!Object.values(ActivityType).includes(activityType)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        userId,
        activityType,
        pointsEarned: pointsEarned || 0,
        xpEarned: xpEarned || 0,
        metadata: metadata || {},
        txnHash: txnHash || null,
      },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
