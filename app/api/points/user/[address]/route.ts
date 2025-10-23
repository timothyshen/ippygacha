import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { LEVEL_CONFIG } from "@/lib/points-system";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10, // Recent activities
        },
      },
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          walletAddress: address.toLowerCase(),
          totalPoints: 0,
          totalXp: 0,
          currentLevel: 1,
        },
        include: {
          activities: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
    }

    // Calculate level info
    const levelInfo = LEVEL_CONFIG.getLevelFromXp(user.totalXp);

    // Update user level if it changed
    if (user.currentLevel !== levelInfo.level) {
      await prisma.user.update({
        where: { id: user.id },
        data: { currentLevel: levelInfo.level },
      });
      user.currentLevel = levelInfo.level;
    }

    return NextResponse.json({
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
      recentActivities: user.activities,
    });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
