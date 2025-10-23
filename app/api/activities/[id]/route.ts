import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

// GET a single activity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const activity = await prisma.activity.findUnique({
      where: { id },
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

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update an activity
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { pointsEarned, xpEarned, metadata, txnHash } = body;

    // Check if activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // Build update data object
    const updateData: any = {};
    if (pointsEarned !== undefined) updateData.pointsEarned = pointsEarned;
    if (xpEarned !== undefined) updateData.xpEarned = xpEarned;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (txnHash !== undefined) updateData.txnHash = txnHash;

    const activity = await prisma.activity.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE an activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    await prisma.activity.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Activity deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
