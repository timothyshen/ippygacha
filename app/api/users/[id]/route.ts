import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { data: user, error } = await supabase
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
          updatedAt,
          activities:activities(limit:20, order:createdAt.desc) (
            id,
            activityType,
            pointsEarned,
            xpEarned,
            metadata,
            txnHash,
            createdAt
          )
        `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    const { username, avatarUrl, totalPoints, totalXp, currentLevel } = body;

    // Build update data object
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (totalPoints !== undefined) updateData.totalPoints = totalPoints;
    if (totalXp !== undefined) updateData.totalXp = totalXp;
    if (currentLevel !== undefined) updateData.currentLevel = currentLevel;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date().toISOString();

    const { data: user, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
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
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { data: deletedUser, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
