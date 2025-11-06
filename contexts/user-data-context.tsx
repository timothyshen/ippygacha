"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ensureUserExists, getUserActivities, type UserData, type Activity } from "@/lib/auth";

interface UserDataContextType {
  userData: UserData | null;
  recentActivities: Activity[];
  isLoadingUser: boolean;
  refreshUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated, user } = usePrivy();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  /**
   * Refresh user data and recent activities
   * Called after any action that awards points
   */
  const refreshUserData = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address) {
      setUserData(null);
      setRecentActivities([]);
      return;
    }

    const walletAddress = user.wallet.address;

    try {
      // Fetch user data and activities in parallel
      const [data, activities] = await Promise.all([
        ensureUserExists(walletAddress),
        getUserActivities(walletAddress, 5),
      ]);

      setUserData(data);
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }, [authenticated, user?.wallet?.address]);

  // Initial load when user authenticates
  useEffect(() => {
    const initUser = async () => {
      if (authenticated && user?.wallet?.address) {
        setIsLoadingUser(true);
        await refreshUserData();
        setIsLoadingUser(false);
      } else {
        setUserData(null);
        setRecentActivities([]);
      }
    };

    initUser();
  }, [authenticated, user?.wallet?.address, refreshUserData]);

  return (
    <UserDataContext.Provider
      value={{
        userData,
        recentActivities,
        isLoadingUser,
        refreshUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

/**
 * Hook to access user data context
 * @throws Error if used outside of UserDataProvider
 */
export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
};
