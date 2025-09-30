import { useState, useEffect, useCallback } from "react";
import { Winner } from "../types";
import { INITIAL_WINNERS } from "../constants";
import { useMockServices } from "./useMockServices";
import { useCooldown } from "./useCooldown";
import { usePrivy } from "@privy-io/react-auth";

export const useRaffleState = () => {
  // Basic raffle state
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [spinnerRotation, setSpinnerRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
  const [selectedPrizeValue, setSelectedPrizeValue] = useState<string | null>(
    null
  );
  const [showWinModal, setShowWinModal] = useState(false);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [recentWinners, setRecentWinners] = useState<Winner[]>(INITIAL_WINNERS);

  // Mock services
  const mockServerAPI = useMockServices();

  // Cooldown management
  const {
    canSpin,
    setCanSpin,
    lastSpinTime,
    setLastSpinTime,
    timeRemaining,
    cooldownHours,
    cooldownMinutes,
    cooldownSeconds,
    cooldownProgress,
    serverSyncStatus,
    setServerSyncStatus,
    contractValidation,
    setContractValidation,
    checkHybridCooldown,
  } = useCooldown(mockServerAPI);

  // Privy wallet connection
  const { user, authenticated } = usePrivy();
  const walletConnected = authenticated;
  const walletAddress = user?.wallet?.address || "";

  // Ticker animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Cooldown monitoring effect
  useEffect(() => {
    if (walletAddress && !canSpin) {
      const interval = setInterval(() => {
        checkHybridCooldown(walletAddress);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [walletAddress, canSpin, checkHybridCooldown]);

  // Check cooldown when wallet connects
  useEffect(() => {
    if (walletAddress) {
      checkHybridCooldown(walletAddress);
    }
  }, [walletAddress, checkHybridCooldown]);

  const handleSpinWheel = useCallback(async () => {
    if (!canSpin || !walletConnected) return;

    try {
      setIsSpinning(true);
      setIsTransactionPending(true);
      setSelectedPrize(null);
      setServerSyncStatus("syncing");
      setContractValidation("pending");

      console.log("[v0] Starting hybrid spin process...");

      // Step 1: Double-check server cooldown
      const serverCheck = await mockServerAPI.checkCooldown(walletAddress);
      if (!serverCheck.canSpin) {
        throw new Error("Server cooldown not met");
      }

      // Step 2: Execute smart contract transaction
      setContractValidation("pending");

      // Step 3: Record spin on server for sync
      const serverResult = await mockServerAPI.recordSpin(
        walletAddress,
        contractResult.prize
      );
      setServerSyncStatus("synced");

      console.log("[v0] Server sync completed:", serverResult);

      setIsTransactionPending(false);
      setCanSpin(false);

      // Update local storage as backup
      localStorage.setItem("lastSpinTime", Date.now().toString());

      // Start spinning animation after all validations pass
      const totalRotations = 5 + Math.random() * 3;
      const finalRotation = totalRotations * 360;
      setSpinnerRotation(finalRotation);

      await new Promise((resolve) => setTimeout(resolve, 4000));

      setSelectedPrize(serverResult.prize);
      setSelectedPrizeValue(serverResult.prize);

      const newWinner: Winner = {
        id: Date.now(),
        name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        prize: serverResult.prize,
        date: "Just now",
        value: serverResult.prize,
      };

      setRecentWinners((prev) => [newWinner, ...prev.slice(0, 5)]);
      setIsSpinning(false);
      setShowConfetti(true);
      setShowWinModal(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      // Refresh cooldown status
      await checkHybridCooldown(walletAddress);
    } catch (error: any) {
      console.error("[v0] Hybrid spin failed:", error);
      setIsSpinning(false);
      setIsTransactionPending(false);
      setServerSyncStatus("error");
      setContractValidation("invalid");
      alert(`Spin failed: ${error.message}`);
    }
  }, [
    canSpin,
    walletConnected,
    walletAddress,
    mockServerAPI,
    setServerSyncStatus,
    setContractValidation,
    setCanSpin,
    checkHybridCooldown,
  ]);

  return {
    // Spinning state
    isSpinning,
    showConfetti,
    spinnerRotation,
    selectedPrize,
    selectedPrizeValue,
    showWinModal,
    setShowWinModal,
    tickerOffset,
    isTransactionPending,
    recentWinners,

    // Cooldown state
    canSpin,
    timeRemaining,
    cooldownHours,
    cooldownMinutes,
    cooldownSeconds,
    cooldownProgress,
    serverSyncStatus,
    contractValidation,

    // Wallet state
    walletConnected,
    walletAddress,

    // Actions
    handleSpinWheel,
  };
};
