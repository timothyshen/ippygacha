"use client";

import { useActiveWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { useMemo } from "react";

/**
 * Returns the best-known active wallet address, reacting to rapid
 * MetaMask account switches by checking Privy's active wallet first.
 */
export function useActiveWalletAddress(): string | null {
  const { wallet: activeWallet } = useActiveWallet();
  const { user } = usePrivy();
  const { wallets } = useWallets();

  return useMemo(() => {
    return (
      activeWallet?.address ||
      user?.wallet?.address ||
      wallets[0]?.address ||
      null
    );
  }, [activeWallet?.address, user?.wallet?.address, wallets]);
}
