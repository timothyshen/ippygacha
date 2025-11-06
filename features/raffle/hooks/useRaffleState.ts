import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import {
  Winner,
  ContractRaffleInfo,
  ContractUserStats,
  PrizeEvent,
} from "../types";
import { useRaffleEntry } from "@/hooks/raffle/useRaffleEntry";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";
import { awardActivityPoints } from "@/lib/auth";

interface CooldownDisplayState {
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
  timeRemaining: string;
}

type CooldownDisplayAction =
  | { type: "reset" }
  | { type: "update"; payload: CooldownDisplayState };

const initialCooldownDisplayState: CooldownDisplayState = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  progress: 0,
  timeRemaining: "0h 0m 0s",
};

const cooldownDisplayReducer = (
  state: CooldownDisplayState,
  action: CooldownDisplayAction
): CooldownDisplayState => {
  switch (action.type) {
    case "reset":
      return initialCooldownDisplayState;
    case "update":
      return action.payload;
    default:
      return state;
  }
};

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
  const [cooldownDisplay, dispatchCooldownDisplay] = useReducer(
    cooldownDisplayReducer,
    initialCooldownDisplayState
  );
  const {
    hours: cooldownHours,
    minutes: cooldownMinutes,
    seconds: cooldownSeconds,
    progress: cooldownProgress,
    timeRemaining,
  } = cooldownDisplay;

  const lastContractCallRef = useRef<number>(0);
  const loadUserDataRef = useRef<((address: string) => Promise<void>) | null>(
    null
  );
  const contractLoadPromiseRef = useRef<Promise<void> | null>(null);
  const userLoadPromiseRef = useRef<Promise<void> | null>(null);
  const cooldownCheckPromiseRef = useRef<Promise<void> | null>(null);

  // Contract services
  const {
    getRaffleInfo,
    getUserStats,
    getEntryPrice,
    getAllPrizeEntries,
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
      // Clamp remaining time to 0 if negative
      const clampedRemainingTime = Math.max(0, remainingTime);

      const hours = Math.floor(clampedRemainingTime / (60 * 60 * 1000));
      const minutes = Math.floor(
        (clampedRemainingTime % (60 * 60 * 1000)) / (60 * 1000)
      );
      const seconds = Math.floor((clampedRemainingTime % (60 * 1000)) / 1000);
      const progress =
        cooldownPeriod > 0
          ? Math.min(100, ((cooldownPeriod - clampedRemainingTime) / cooldownPeriod) * 100)
          : 0;

      dispatchCooldownDisplay({
        type: "update",
        payload: {
          hours,
          minutes,
          seconds,
          progress,
          timeRemaining: `${hours}h ${minutes}m ${seconds}s`,
        },
      });
    },
    [dispatchCooldownDisplay]
  );

  const checkCanSpin = useCallback(
    async (address: string) => {
      if (!address) return Promise.resolve();

      if (cooldownCheckPromiseRef.current) {
        return cooldownCheckPromiseRef.current;
      }

      // Throttle contract calls - only allow one call per 2 seconds
      const now = Date.now();
      if (now - lastContractCallRef.current < 2000) {
        return Promise.resolve();
      }
      lastContractCallRef.current = now;

      const promise = (async () => {
        try {
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
            dispatchCooldownDisplay({ type: "reset" });
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
          cooldownCheckPromiseRef.current = null;
        }
      })();

      cooldownCheckPromiseRef.current = promise;
      return promise;
    },
    [getRaffleInfo, getUserCooldownStatus, updateCooldownDisplay]
  );

  // Load contract data
  const loadContractData = useCallback(async () => {
    if (contractLoadPromiseRef.current) {
      return contractLoadPromiseRef.current;
    }

    const promise = (async () => {
      try {
        const [raffleInfoData, entryPriceData, userPrizesData] =
          await Promise.all([
            getRaffleInfo(),
            getEntryPrice(),
            getAllPrizeEntries(10),
          ]);

        // Convert contract prizes to display format
        const displayWinners: Winner[] = (userPrizesData as []).map(
          (prize, index) => {
            const ipAmount = formatEther(prize[2]);
            const hasNFT = prize[3] > 0;
            let prizeName = `${ipAmount} IP`;
            if (hasNFT) {
              prizeName += " + NFT";
            }

            return {
              id: index + 1,
              name: `${(prize[0] as string).slice(0, 6)}...${(
                prize[0] as string
              ).slice(-4)}`,
              prize: prizeName,
              date: new Date(Number(prize[5]) * 1000).toLocaleString(),
              value: ipAmount,
              tier: prize[1] as number,
            };
          }
        );
        setRecentWinners(displayWinners.slice(0, 10)); // Show last 10
        setRaffleInfo(raffleInfoData);
        setEntryPrice(entryPriceData);
      } catch (error) {
        console.error("Error loading contract data:", error);
      } finally {
        contractLoadPromiseRef.current = null;
      }
    })();

    contractLoadPromiseRef.current = promise;
    return promise;
  }, [getAllPrizeEntries, getEntryPrice, getRaffleInfo]);

  // Load user-specific data
  const loadUserData = useCallback(
    async (address: string) => {
      if (!address) {
        return Promise.resolve();
      }

      if (userLoadPromiseRef.current) {
        return userLoadPromiseRef.current;
      }

      const promise = (async () => {
        try {
          const userStatsData = await getUserStats(address);
          setUserStats(userStatsData);
        } catch (error) {
          console.error("Error loading user data:", error);
        } finally {
          userLoadPromiseRef.current = null;
        }
      })();

      userLoadPromiseRef.current = promise;
      return promise;
    },
    [getUserStats]
  );

  // Store the latest loadUserData function in ref
  loadUserDataRef.current = loadUserData;

  // Load contract data on mount
  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  // Load user data when wallet connects (debounced)
  useEffect(() => {
    if (walletAddress && loadUserDataRef.current) {
      const timeoutId = setTimeout(() => {
        loadUserDataRef.current?.(walletAddress);
      }, 300); // Debounce by 300ms

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [walletAddress]); // Only depend on walletAddress

  // Cooldown monitoring effect - only update UI, don't call contract
  useEffect(() => {
    if (walletAddress && !canSpin && lastSpinTime) {
      const interval = setInterval(() => {
        // Only update the display, don't call the contract
        const now = Date.now();
        const timeSinceLastSpin = now - lastSpinTime;
        const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes
        const remainingTime = COOLDOWN_PERIOD_MS - timeSinceLastSpin;

        if (remainingTime <= 0) {
          // Show 0 time first
          updateCooldownDisplay(0, COOLDOWN_PERIOD_MS);

          // Wait a bit to show the 0 state, then check contract
          setTimeout(() => {
            checkCanSpin(walletAddress);
          }, 500);

          clearInterval(interval);
        } else {
          // Just update the display
          updateCooldownDisplay(remainingTime, COOLDOWN_PERIOD_MS);
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

      // Step 1: Double-check cooldown
      await checkCanSpin(walletAddress);
      if (!canSpin) {
        throw new Error("Cooldown not met");
      }

      // Step 2: Execute smart contract transaction
      const transactionResult = await enterRaffle();

      setIsTransactionPending(false);
      setCanSpin(false);
      setTransactionHash(transactionResult.txHash);

      await awardActivityPoints(walletAddress, "RAFFLE_DRAW", {
        timestamp: new Date().toISOString(),
        amount: entryPrice,
      }, transactionResult.txHash);

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

      // Fetch fresh cooldown data from contract
      const cooldownStatus = await getUserCooldownStatus(walletAddress);

      // Update cooldown state with fresh data
      setCanSpin(false);
      const timeRemainingMs = Number(cooldownStatus.timeRemaining) * 1000;
      const cooldownPeriodMs = 5 * 60 * 1000; // 5 minutes
      setLastSpinTime(Number(cooldownStatus.lastEntryTime) * 1000);
      updateCooldownDisplay(timeRemainingMs, cooldownPeriodMs);

      // Small delay to ensure state is fully updated
      await new Promise((resolve) => setTimeout(resolve, 200));

      // NOW show the congratulations modal with correct cooldown data
      setShowConfetti(true);
      setShowWinModal(true);

      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      // Refresh other contract data in background
      Promise.all([
        loadContractData(),
        loadUserData(walletAddress),
      ]).catch(error => console.error("Error refreshing data:", error));
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
