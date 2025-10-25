import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET all users with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const validSortFields = ["createdAt", "totalPoints", "totalXp", "currentLevel"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const ascending = order === "asc";

    const {
      data: users,
      error,
      count,
    } = await supabase
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
      `,
        { count: "exact" }
      )
      .order(orderField, { ascending })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      users: users ?? [],
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        hasMore: offset + limit < (count ?? 0),
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
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { walletAddress, username, avatarUrl } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const normalizedWallet = walletAddress.toLowerCase();

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("walletAddress", normalizedWallet)
      .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this wallet address already exists" },
        { status: 409 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        walletAddress: normalizedWallet,
        username: username ?? null,
        avatarUrl: avatarUrl ?? null,
        totalPoints: 0,
        totalXp: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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

    if (error) {
      throw error;
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
