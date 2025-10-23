/**
 * Authentication helper functions for user management
 */

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
export async function ensureUserExists(walletAddress: string): Promise<UserData | null> {
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
export async function getUserData(walletAddress: string): Promise<UserData | null> {
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
