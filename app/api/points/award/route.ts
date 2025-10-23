import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { ActivityType } from "@prisma/client";
import {
  getActivityRewards,
  checkLevelUp,
  LEVEL_CONFIG,
} from "@/lib/points-system";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, activityType, metadata, txnHash } = body;

    if (!walletAddress || !activityType) {
      return NextResponse.json(
        { error: "Wallet address and activity type are required" },
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

    // Get rewards for this activity
    const rewards = getActivityRewards(activityType);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          totalPoints: 0,
          totalXp: 0,
          currentLevel: 1,
        },
      });
    }

    // Check if user leveled up
    const oldXp = user.totalXp;
    const newXp = user.totalXp + rewards.xp;
    const leveledUp = checkLevelUp(oldXp, newXp);
    const newLevelInfo = LEVEL_CONFIG.getLevelFromXp(newXp);

    // Update user points and XP
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        totalPoints: user.totalPoints + rewards.points,
        totalXp: newXp,
        currentLevel: newLevelInfo.level,
      },
    });

    // Log the activity
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        activityType,
        pointsEarned: rewards.points,
        xpEarned: rewards.xp,
        metadata: metadata || {},
        txnHash: txnHash || null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        walletAddress: updatedUser.walletAddress,
        totalPoints: updatedUser.totalPoints,
        totalXp: updatedUser.totalXp,
        currentLevel: updatedUser.currentLevel,
        levelInfo: newLevelInfo,
      },
      activity: {
        id: activity.id,
        activityType: activity.activityType,
        pointsEarned: activity.pointsEarned,
        xpEarned: activity.xpEarned,
        createdAt: activity.createdAt,
      },
      leveledUp,
      rewards,
    });
  } catch (error) {
    console.error("Error awarding points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
