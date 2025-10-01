import { useState, useEffect, useCallback } from "react";
import {
  Winner,
  ContractRaffleInfo,
  ContractUserStats,
  ContractPrize,
} from "../types";
import { useRaffleEntry } from "@/hooks/raffle/useRaffleEntry";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";

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
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);

  // Contract data state
  const [raffleInfo, setRaffleInfo] = useState<ContractRaffleInfo | null>(null);
  const [userStats, setUserStats] = useState<ContractUserStats | null>(null);
  const [entryPrice, setEntryPrice] = useState<bigint | null>(null);

  // Cooldown state
  const [canSpin, setCanSpin] = useState(true);
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [cooldownHours, setCooldownHours] = useState(0);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [contractSyncStatus, setContractSyncStatus] = useState<
    "synced" | "syncing" | "error"
  >("synced");
  const [contractValidation, setContractValidation] = useState<
    "pending" | "valid" | "invalid"
  >("pending");

  // Contract services
  const {
    getRaffleInfo,
    getUserStats,
    getNFTPoolInfo,
    getNFTPoolTokenIds,
    getEntryPrice,
    getUserEntries,
    getUserPrizes,
    enterRaffle,
  } = useRaffleEntry();

  // Privy wallet connection
  const { user, authenticated } = usePrivy();
  const walletConnected = authenticated;
  const walletAddress = user?.wallet?.address || "";

  // Cooldown management functions
  const updateCooldownDisplay = useCallback(
    (remainingTime: number, cooldownPeriod: number = 5 * 60 * 1000) => {
      const hours = Math.floor(remainingTime / (60 * 60 * 1000));
      const minutes = Math.floor(
        (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
      );
      const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
      const progress =
        cooldownPeriod > 0
          ? ((cooldownPeriod - remainingTime) / cooldownPeriod) * 100
          : 0;

      setCooldownHours(hours);
      setCooldownMinutes(minutes);
      setCooldownSeconds(seconds);
      setCooldownProgress(progress);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    },
    []
  );

  const checkCanSpin = useCallback(
    async (address: string) => {
      if (!address) return;

      try {
        setContractSyncStatus("syncing");
        setContractValidation("pending");

        // Check if raffle is active
        const raffleInfoData = await getRaffleInfo();
        if (!raffleInfoData.active) {
          setCanSpin(false);
          setContractSyncStatus("synced");
          setContractValidation("valid");
          return;
        }

        // Check local cooldown
        const lastSpinKey = `last_raffle_spin_${address}`;
        const lastSpin = localStorage.getItem(lastSpinKey);
        const now = Date.now();
        const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes

        if (lastSpin) {
          const timeSinceLastSpin = now - Number.parseInt(lastSpin);
          if (timeSinceLastSpin < COOLDOWN_PERIOD) {
            setCanSpin(false);
            setLastSpinTime(Number.parseInt(lastSpin));
            updateCooldownDisplay(
              COOLDOWN_PERIOD - timeSinceLastSpin,
              COOLDOWN_PERIOD
            );
          } else {
            setCanSpin(true);
            setLastSpinTime(null);
            setCooldownHours(0);
            setCooldownMinutes(0);
            setCooldownSeconds(0);
            setCooldownProgress(0);
          }
        } else {
          setCanSpin(true);
          setLastSpinTime(null);
          setCooldownHours(0);
          setCooldownMinutes(0);
          setCooldownSeconds(0);
          setCooldownProgress(0);
        }

        setContractSyncStatus("synced");
        setContractValidation("valid");
      } catch (error) {
        console.error("Error checking cooldown:", error);
        setContractSyncStatus("error");
        setContractValidation("invalid");
      }
    },
    [getRaffleInfo, updateCooldownDisplay]
  );

  // Load contract data
  const loadContractData = useCallback(async () => {
    try {
      const [raffleInfoData, entryPriceData] = await Promise.all([
        getRaffleInfo(),
        getEntryPrice(),
        getNFTPoolInfo(),
        getNFTPoolTokenIds(),
      ]);

      setRaffleInfo(raffleInfoData);
      setEntryPrice(entryPriceData);
    } catch (error) {
      console.error("Error loading contract data:", error);
    }
  }, [getRaffleInfo, getEntryPrice]);

  // Load user-specific data
  const loadUserData = useCallback(
    async (address: string) => {
      try {
        const [userStatsData, userPrizesData] = await Promise.all([
          getUserStats(address),
          getUserPrizes(address),
        ]);

        setUserStats(userStatsData);

        // Convert contract prizes to display format
        const displayWinners: Winner[] = userPrizesData.map((prize, index) => {
          const ipAmount = formatEther(prize.ipTokenAmount);
          const hasNFT = prize.nftTokenId > 0;
          let prizeName = `${ipAmount} IP`;
          if (hasNFT) {
            prizeName += " + NFT";
          }

          return {
            id: index + 1,
            name: `${prize.winner.slice(0, 6)}...${prize.winner.slice(-4)}`,
            prize: prizeName,
            date: new Date(Number(prize.timestamp) * 1000).toLocaleString(),
            value: ipAmount,
            tier: prize.tier,
          };
        });

        setRecentWinners(displayWinners.slice(0, 10)); // Show last 10
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    },
    [getUserStats, getUserPrizes]
  );

  // Ticker animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Load contract data on mount
  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  // Load user data when wallet connects
  useEffect(() => {
    if (walletAddress) {
      loadUserData(walletAddress);
    }
  }, [walletAddress, loadUserData]);

  // Cooldown monitoring effect
  useEffect(() => {
    if (walletAddress && !canSpin) {
      const interval = setInterval(() => {
        checkCanSpin(walletAddress);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [walletAddress, canSpin, checkCanSpin]);

  // Check cooldown when wallet connects
  useEffect(() => {
    if (walletAddress) {
      checkCanSpin(walletAddress);
    }
  }, [walletAddress, checkCanSpin]);

  const handleSpinWheel = useCallback(async () => {
    if (!canSpin || !walletConnected) return;

    try {
      setIsSpinning(true);
      setIsTransactionPending(true);
      setSelectedPrize(null);
      setContractSyncStatus("syncing");
      setContractValidation("pending");

      console.log("[Contract] Starting raffle entry process...");

      // Step 1: Double-check cooldown
      await checkCanSpin(walletAddress);
      if (!canSpin) {
        throw new Error("Cooldown not met");
      }

      // Step 2: Execute smart contract transaction
      setContractValidation("pending");
      const transactionResult = await enterRaffle();
      setContractSyncStatus("synced");
      setContractValidation("valid");

      console.log("[Contract] Transaction completed:", transactionResult);

      setIsTransactionPending(false);
      setCanSpin(false);

      // Record spin locally for cooldown tracking
      const lastSpinKey = `last_raffle_spin_${walletAddress}`;
      localStorage.setItem(lastSpinKey, Date.now().toString());

      // Start spinning animation after transaction is confirmed
      const totalRotations = 5 + Math.random() * 3;
      const finalRotation = totalRotations * 360;
      setSpinnerRotation(finalRotation);

      await new Promise((resolve) => setTimeout(resolve, 4000));

      // For now, we'll show a generic prize since the contract handles the actual prize distribution
      // In a real implementation, you'd listen for contract events to get the actual prize
      const prizeName = "Entry Successful!";
      setSelectedPrize(prizeName);
      setSelectedPrizeValue(prizeName);

      const newWinner: Winner = {
        id: Date.now(),
        name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        prize: prizeName,
        date: "Just now",
        value: prizeName,
        transactionHash: transactionResult.txHash,
      };

      setRecentWinners((prev) => [newWinner, ...prev.slice(0, 5)]);
      setIsSpinning(false);
      setShowConfetti(true);
      setShowWinModal(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      // Refresh contract data and cooldown status
      await Promise.all([
        loadContractData(),
        loadUserData(walletAddress),
        checkCanSpin(walletAddress),
      ]);
    } catch (error: any) {
      console.error("[Contract] Raffle entry failed:", error);
      setIsSpinning(false);
      setIsTransactionPending(false);
      setContractSyncStatus("error");
      setContractValidation("invalid");
      alert(`Raffle entry failed: ${error.message}`);
    }
  }, [
    canSpin,
    walletConnected,
    walletAddress,
    enterRaffle,
    checkCanSpin,
    loadContractData,
    loadUserData,
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
    contractSyncStatus,
    contractValidation,

    // Wallet state
    walletConnected,
    walletAddress,

    // Contract data
    raffleInfo,
    userStats,
    entryPrice,

    // Actions
    handleSpinWheel,
    loadContractData,
    loadUserData,
  };
};
