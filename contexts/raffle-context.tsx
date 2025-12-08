"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRaffleContract } from "@/features/raffle/hooks/useRaffleContract";
import { useRaffleCooldown } from "@/features/raffle/hooks/useRaffleCooldown";
import { useRaffleUI } from "@/features/raffle/hooks/useRaffleUI";
import {
  ContractRaffleInfo,
  ContractUserStats,
  Winner,
  PrizeEvent,
} from "@/features/raffle/types";
import { useActiveWalletAddress } from "@/hooks/useActiveWalletAddress";

interface RaffleContextValue {
  // Wallet state
  walletConnected: boolean;
  walletAddress: string;

  // Contract data
  raffleInfo: ContractRaffleInfo | null;
  userStats: ContractUserStats | null;
  entryPrice: bigint | null;
  recentWinners: Winner[];
  transactionHash: string | null;
  latestPrize: PrizeEvent | null;

  // Cooldown state
  canSpin: boolean;
  cooldownHours: number;
  cooldownMinutes: number;
  cooldownSeconds: number;
  cooldownProgress: number;
  timeRemaining: string;

  // UI state
  isSpinning: boolean;
  showConfetti: boolean;
  spinnerRotation: number;
  selectedPrize: string | null;
  selectedPrizeValue: string | null;
  showWinModal: boolean;
  isTransactionPending: boolean;

  // Actions
  handleSpinWheel: () => void;
  setShowWinModal: (show: boolean) => void;
  loadContractData: () => Promise<void>;
  loadUserData: (address: string) => Promise<void>;
}

const RaffleContext = createContext<RaffleContextValue | undefined>(undefined);

/**
 * Provider component that combines all raffle hooks
 * Eliminates prop drilling by providing state through context
 */
export function RaffleProvider({ children }: { children: ReactNode }) {
  // Get wallet info from Privy
  const { authenticated } = usePrivy();
  const activeWalletAddress = useActiveWalletAddress();
  const walletConnected = authenticated;
  const walletAddress = activeWalletAddress || "";

  // Contract data management
  const contractData = useRaffleContract(walletAddress);

  // Cooldown management
  const cooldownData = useRaffleCooldown(walletAddress);

  // UI state management
  const uiData = useRaffleUI({
    walletAddress,
    canSpin: cooldownData.canSpin,
    entryPrice: contractData.entryPrice,
    checkCanSpin: cooldownData.checkCanSpin,
    startCooldown: cooldownData.startCooldown,
    loadContractData: contractData.loadContractData,
    loadUserData: contractData.loadUserData,
    addWinner: contractData.addWinner,
    updateTransactionHash: contractData.updateTransactionHash,
  });

  const value: RaffleContextValue = {
    // Wallet
    walletConnected,
    walletAddress,

    // Contract data
    ...contractData,

    // Cooldown
    ...cooldownData,

    // UI
    ...uiData,
  };

  return (
    <RaffleContext.Provider value={value}>{children}</RaffleContext.Provider>
  );
}

/**
 * Hook to access raffle context
 * Must be used within RaffleProvider
 */
export function useRaffle() {
  const context = useContext(RaffleContext);
  if (context === undefined) {
    throw new Error("useRaffle must be used within a RaffleProvider");
  }
  return context;
}
