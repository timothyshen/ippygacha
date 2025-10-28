/**
 * Authentication helper functions for user management
 */

export interface Activity {
  id: string;
  activityType: string;
  pointsEarned: number;
  xpEarned: number;
  metadata?: any;
  createdAt: Date;
  txnHash?: string | null;
}

export interface UserData {
  id: string;
  walletAddress: string;
  username: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  totalXp: number;
  currentLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Check if user exists in database and create if not
 * Returns user data for display in the UI
 */
export async function ensureUserExists(
  walletAddress: string
): Promise<UserData | null> {
  try {
    const response = await fetch(`/api/points/user/${walletAddress}`);

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }

    // If user not found, the API will auto-create
    if (response.status === 404 || response.status === 400) {
      const retryResponse = await fetch(`/api/points/user/${walletAddress}`);
      if (retryResponse.ok) {
        const data = await retryResponse.json();
        return data.user;
      }
    }

    return null;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    return null;
  }
}

/**
 * Fetch user data by wallet address
 */
export async function getUserData(
  walletAddress: string
): Promise<UserData | null> {
  try {
    const response = await fetch(`/api/points/user/${walletAddress}`);

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

/**
 * Fetch recent activities for a user by wallet address
 */
export async function getUserActivities(
  walletAddress: string,
  limit: number = 5
): Promise<Activity[]> {
  try {
    const response = await fetch(
      `/api/activities?walletAddress=${walletAddress}&limit=${limit}`
    );

    if (response.ok) {
      const data = await response.json();
      return data.activities || [];
    }

    return [];
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return [];
  }
}

/**
 * Award points for an activity (uses the existing points system API)
 * Automatically calculates points/XP based on activity type
 */
export async function awardActivityPoints(
  walletAddress: string,
  activityType: string,
  metadata?: any,
  txnHash?: string
): Promise<UserData | null> {
  try {
    const response = await fetch("/api/points/award", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        activityType,
        metadata: metadata || {},
        txnHash,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }

    console.error("Error awarding points:", await response.text());
    return null;
  } catch (error) {
    console.error("Error awarding activity points:", error);
    return null;
  }
}
