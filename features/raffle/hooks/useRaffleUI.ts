import { useState, useCallback } from "react";
import { useRaffleEntry } from "@/hooks/raffle/useRaffleEntry";
import { awardActivityPoints } from "@/lib/auth";
import { Winner } from "../types";
import { formatEther } from "viem";
import { useUserData } from "@/contexts/user-data-context";

interface UseRaffleUIProps {
  walletAddress: string;
  canSpin: boolean;
  entryPrice: bigint | null;
  checkCanSpin: (address: string) => Promise<void>;
  startCooldown: (timeRemainingMs: number, lastEntryTimeMs: number) => void;
  loadContractData: () => Promise<void>;
  loadUserData: (address: string) => Promise<void>;
  addWinner: (winner: Winner) => void;
  updateTransactionHash: (hash: string) => void;
}

/**
 * Hook for managing raffle UI state
 * Handles spinning animations, modals, confetti
 */
export const useRaffleUI = ({
  walletAddress,
  canSpin,
  entryPrice,
  checkCanSpin,
  startCooldown,
  loadContractData,
  loadUserData,
  addWinner,
  updateTransactionHash,
}: UseRaffleUIProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [spinnerRotation, setSpinnerRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
  const [selectedPrizeValue, setSelectedPrizeValue] = useState<string | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  const { enterRaffle, getUserCooldownStatus } = useRaffleEntry();
  const { refreshUserData } = useUserData();

  /**
   * Handle wheel spin and raffle entry
   */
  const handleSpinWheel = useCallback(async () => {
    if (!canSpin || !walletAddress) return;

    try {
      setIsSpinning(true);
      setIsTransactionPending(true);
      setSelectedPrize(null);

      // Double-check cooldown
      await checkCanSpin(walletAddress);
      if (!canSpin) {
        throw new Error("Cooldown not met");
      }

      // Execute smart contract transaction
      const transactionResult = await enterRaffle();

      // IMPORTANT: Wait for transaction confirmation before proceeding
      console.log("[Raffle] Transaction submitted, waiting for confirmation...");

      updateTransactionHash(transactionResult.txHash);

      // Award activity points
      await awardActivityPoints(
        walletAddress,
        "RAFFLE_DRAW",
        {
          timestamp: new Date().toISOString(),
          amount: entryPrice ? formatEther(entryPrice) : "0.1",
        },
        transactionResult.txHash
      );

      // Refresh user data to update level, points, and recent activities
      await refreshUserData();

      // Transaction is now confirmed, proceed with UI updates
      setIsTransactionPending(false);

      // Start spinning animation
      const totalRotations = 5 + Math.random() * 3;
      const finalRotation = totalRotations * 360;
      setSpinnerRotation(finalRotation);

      await new Promise((resolve) => setTimeout(resolve, 4000));

      // Show generic prize (actual prize comes from contract events)
      const prizeName = "Entry Successful!";
      setSelectedPrize(prizeName);
      setSelectedPrizeValue(prizeName);

      // Add to recent winners
      const newWinner: Winner = {
        id: Date.now(),
        name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        prize: prizeName,
        date: "Just now",
        value: prizeName,
        transactionHash: transactionResult.txHash,
      };
      addWinner(newWinner);

      setIsSpinning(false);

      // CRITICAL: Fetch fresh cooldown data from contract AFTER transaction is confirmed
      console.log("[Raffle] Fetching cooldown status from contract...");
      const cooldownStatus = await getUserCooldownStatus(walletAddress);

      console.log("[Raffle] Cooldown status:", {
        canEnter: cooldownStatus.canEnter,
        lastEntryTime: cooldownStatus.lastEntryTime,
        timeRemaining: cooldownStatus.timeRemaining,
      });

      // Only start cooldown if contract confirms user cannot enter
      if (!cooldownStatus.canEnter) {
        const timeRemainingMs = Number(cooldownStatus.timeRemaining) * 1000;
        const lastEntryTimeMs = Number(cooldownStatus.lastEntryTime) * 1000;

        console.log("[Raffle] Starting cooldown:", {
          timeRemainingMs,
          lastEntryTimeMs,
          timeRemainingMinutes: (timeRemainingMs / 1000 / 60).toFixed(2),
        });

        startCooldown(timeRemainingMs, lastEntryTimeMs);
      } else {
        console.warn("[Raffle] Contract says user can still enter - cooldown not started");
      }

      // Show the congratulations modal with updated cooldown data
      setShowConfetti(true);
      setShowWinModal(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      // Refresh other contract data in background
      Promise.all([
        loadContractData(),
        loadUserData(walletAddress),
      ]).catch((error) => console.error("Error refreshing data:", error));
    } catch (error: any) {
      console.error("[Contract] Raffle entry failed:", error);
      setIsSpinning(false);
      setIsTransactionPending(false);
      alert(`Raffle entry failed: ${error.message}`);
    }
  }, [
    canSpin,
    walletAddress,
    enterRaffle,
    checkCanSpin,
    getUserCooldownStatus,
    startCooldown,
    loadContractData,
    loadUserData,
    addWinner,
    updateTransactionHash,
    entryPrice,
  ]);

  return {
    // State
    isSpinning,
    showConfetti,
    spinnerRotation,
    selectedPrize,
    selectedPrizeValue,
    showWinModal,
    isTransactionPending,

    // Actions
    setShowWinModal,
    handleSpinWheel,
  };
};
