import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

// GET all users with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const validSortFields = ["createdAt", "totalPoints", "totalXp", "currentLevel"];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: order as "asc" | "desc" }
      : { createdAt: "desc" as const };

    const users = await prisma.user.findMany({
      skip: offset,
      take: limit,
      orderBy,
      select: {
        id: true,
        walletAddress: true,
        username: true,
        avatarUrl: true,
        totalPoints: true,
        totalXp: true,
        currentLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await prisma.user.count();

    return NextResponse.json({
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, username, avatarUrl } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this wallet address already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        username: username || null,
        avatarUrl: avatarUrl || null,
        totalPoints: 0,
        totalXp: 0,
        currentLevel: 1,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
