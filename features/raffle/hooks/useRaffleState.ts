import { useState, useEffect, useCallback, useRef } from "react";
import {
  Winner,
  ContractRaffleInfo,
  ContractUserStats,
  PrizeEvent,
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
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [latestPrize, setLatestPrize] = useState<PrizeEvent | null>(null);

  // Cooldown state
  const [canSpin, setCanSpin] = useState(true);
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [cooldownHours, setCooldownHours] = useState(0);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [cooldownProgress, setCooldownProgress] = useState(0);

  const [isLoadingContractData, setIsLoadingContractData] = useState(false);
  const lastContractCallRef = useRef<number>(0);

  // Contract services
  const {
    getRaffleInfo,
    getUserStats,
    getNFTPoolInfo,
    getNFTPoolTokenIds,
    getEntryPrice,
    getUserEntries,
    getUserPrizes,
    getUserCooldownStatus,
    enterRaffle,
    listenToPrizeEvents,
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
      if (!address || isLoadingContractData) return;

      // Throttle contract calls - only allow one call per 2 seconds
      const now = Date.now();
      if (now - lastContractCallRef.current < 2000) {
        return;
      }
      lastContractCallRef.current = now;

      try {
        setIsLoadingContractData(true);
        // Check if raffle is active
        const raffleInfoData = await getRaffleInfo();
        if (!raffleInfoData.active) {
          setCanSpin(false);
          return;
        }

        // Check smart contract cooldown
        const cooldownStatus = await getUserCooldownStatus(address);

        if (cooldownStatus.canEnter) {
          setCanSpin(true);
          setLastSpinTime(null);
          setCooldownHours(0);
          setCooldownMinutes(0);
          setCooldownSeconds(0);
          setCooldownProgress(0);
        } else {
          setCanSpin(false);
          const timeRemainingMs = Number(cooldownStatus.timeRemaining) * 1000; // Convert seconds to milliseconds
          const cooldownPeriodMs = 5 * 60 * 1000; // 5 minutes (matches contract)

          setLastSpinTime(Number(cooldownStatus.lastEntryTime) * 1000);
          updateCooldownDisplay(timeRemainingMs, cooldownPeriodMs);
        }
      } catch (error) {
        console.error("Error checking cooldown:", error);
      } finally {
        setIsLoadingContractData(false);
      }
    },
    [
      getRaffleInfo,
      getUserCooldownStatus,
      updateCooldownDisplay,
      isLoadingContractData,
    ]
  );

  // Load contract data
  const loadContractData = useCallback(async () => {
    if (isLoadingContractData) return;

    try {
      setIsLoadingContractData(true);
      const [raffleInfoData, entryPriceData] = await Promise.all([
        getRaffleInfo(),
        getEntryPrice(),
      ]);

      setRaffleInfo(raffleInfoData);
      setEntryPrice(entryPriceData);
    } catch (error) {
      console.error("Error loading contract data:", error);
    } finally {
      setIsLoadingContractData(false);
    }
  }, [getRaffleInfo, getEntryPrice, isLoadingContractData]);

  // Load user-specific data
  const loadUserData = useCallback(
    async (address: string) => {
      if (isLoadingContractData) return;

      try {
        setIsLoadingContractData(true);
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
      } finally {
        setIsLoadingContractData(false);
      }
    },
    [getUserStats, getUserPrizes, isLoadingContractData]
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

  // Cooldown monitoring effect - only update UI, don't call contract
  useEffect(() => {
    if (walletAddress && !canSpin && lastSpinTime) {
      const interval = setInterval(() => {
        // Only update the display, don't call the contract
        const now = Date.now();
        const timeSinceLastSpin = now - lastSpinTime;
        const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastSpin >= COOLDOWN_PERIOD_MS) {
          // Cooldown should be over, check contract once
          checkCanSpin(walletAddress);
          clearInterval(interval);
        } else {
          // Just update the display
          updateCooldownDisplay(
            COOLDOWN_PERIOD_MS - timeSinceLastSpin,
            COOLDOWN_PERIOD_MS
          );
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [
    walletAddress,
    canSpin,
    lastSpinTime,
    checkCanSpin,
    updateCooldownDisplay,
  ]);

  // Check cooldown when wallet connects (debounced)
  useEffect(() => {
    if (walletAddress) {
      const timeoutId = setTimeout(() => {
        checkCanSpin(walletAddress);
      }, 500); // Debounce by 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [walletAddress, checkCanSpin]);

  // Listen for prize events when wallet is connected
  useEffect(() => {
    if (!walletAddress) return;

    let unwatch: (() => void) | null = null;

    const setupEventListeners = async () => {
      try {
        const { unwatch: unwatchFn } = await listenToPrizeEvents(
          walletAddress,
          (prize: PrizeEvent) => {
            console.log("🎉 Prize won!", prize);
            setLatestPrize(prize);

            // Update the win modal with real prize data
            const ipAmount = formatEther(prize.ipTokenAmount);
            let prizeName = `${ipAmount} IP`;
            if (prize.nftTokenId > 0) {
              prizeName += " + NFT";
            }

            setSelectedPrize(prizeName);
            setSelectedPrizeValue(prizeName);
            setTransactionHash(prize.transactionHash);
          }
        );
        unwatch = unwatchFn;
      } catch (error) {
        console.error("Error setting up event listeners:", error);
      }
    };

    setupEventListeners();

    return () => {
      if (unwatch) {
        unwatch();
      }
    };
  }, [walletAddress, listenToPrizeEvents]);

  const handleSpinWheel = useCallback(async () => {
    if (!canSpin || !walletConnected) return;

    try {
      setIsSpinning(true);
      setIsTransactionPending(true);
      setSelectedPrize(null);

      console.log("[Contract] Starting raffle entry process...");

      // Step 1: Double-check cooldown
      await checkCanSpin(walletAddress);
      if (!canSpin) {
        throw new Error("Cooldown not met");
      }

      // Step 2: Execute smart contract transaction
      const transactionResult = await enterRaffle();

      console.log("[Contract] Transaction completed:", transactionResult);

      setIsTransactionPending(false);
      setCanSpin(false);
      setTransactionHash(transactionResult.txHash);

      // Cooldown is now handled by smart contract

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

    // Wallet state
    walletConnected,
    walletAddress,

    // Contract data
    raffleInfo,
    userStats,
    entryPrice,
    transactionHash,
    latestPrize,

    // Actions
    handleSpinWheel,
    loadContractData,
    loadUserData,
  };
};
