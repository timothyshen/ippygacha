import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET a single activity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { data: activity, error } = await supabase
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
        `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    const { pointsEarned, xpEarned, metadata, txnHash } = body;

    // Build update data object
    const updateData: any = {};
    if (pointsEarned !== undefined) updateData.pointsEarned = pointsEarned;
    if (xpEarned !== undefined) updateData.xpEarned = xpEarned;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (txnHash !== undefined) updateData.txnHash = txnHash;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const { data: activity, error } = await supabase
      .from("activities")
      .update(updateData)
      .eq("id", id)
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
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = await params;

    const { data: deletedActivity, error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!deletedActivity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

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
