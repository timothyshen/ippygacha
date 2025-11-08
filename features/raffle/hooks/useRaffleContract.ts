import { useState, useEffect, useCallback, useRef } from "react";
import { useRaffleEntry } from "@/hooks/raffle/useRaffleEntry";
import { formatEther } from "viem";
import {
  ContractRaffleInfo,
  ContractUserStats,
  Winner,
  PrizeEvent,
} from "../types";
import { convertContractPrizeToWinner } from "@/lib/raffle/utils";

/**
 * Hook for managing raffle contract data
 * Handles fetching and caching of contract state
 */
export const useRaffleContract = (walletAddress: string) => {
  // Contract data state
  const [raffleInfo, setRaffleInfo] = useState<ContractRaffleInfo | null>(null);
  const [userStats, setUserStats] = useState<ContractUserStats | null>(null);
  const [entryPrice, setEntryPrice] = useState<bigint | null>(null);
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [latestPrize, setLatestPrize] = useState<PrizeEvent | null>(null);

  // Refs for deduplication
  const contractLoadPromiseRef = useRef<Promise<void> | null>(null);
  const userLoadPromiseRef = useRef<Promise<void> | null>(null);

  // Contract services
  const {
    getRaffleInfo,
    getUserStats,
    getEntryPrice,
    getAllPrizeEntries,
    listenToPrizeEvents,
  } = useRaffleEntry();

  /**
   * Load general contract data (raffle info, entry price, recent winners)
   */
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
        const displayWinners: Winner[] = (userPrizesData as any[]).map(
          (prize, index) => convertContractPrizeToWinner(prize, index)
        );

        setRecentWinners(displayWinners.slice(0, 10));
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

  /**
   * Load user-specific data
   */
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

  /**
   * Add a new winner to the recent winners list
   */
  const addWinner = useCallback((winner: Winner) => {
    setRecentWinners((prev) => [winner, ...prev.slice(0, 9)]);
  }, []);

  /**
   * Update transaction hash
   */
  const updateTransactionHash = useCallback((hash: string) => {
    setTransactionHash(hash);
  }, []);

  // Load contract data on mount
  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  // Load user data when wallet connects (debounced)
  useEffect(() => {
    if (walletAddress) {
      const timeoutId = setTimeout(() => {
        loadUserData(walletAddress);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [walletAddress, loadUserData]);

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

            // Update with real prize data
            const ipAmount = formatEther(prize.ipTokenAmount);
            let prizeName = `${ipAmount} IP`;
            if (prize.nftTokenId > 0) {
              prizeName += " + NFT";
            }

            updateTransactionHash(prize.transactionHash);
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
  }, [walletAddress, listenToPrizeEvents, updateTransactionHash]);

  return {
    // State
    raffleInfo,
    userStats,
    entryPrice,
    recentWinners,
    transactionHash,
    latestPrize,

    // Actions
    loadContractData,
    loadUserData,
    addWinner,
    updateTransactionHash,
  };
};
