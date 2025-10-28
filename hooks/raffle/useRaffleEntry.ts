import {
  onchainRaffleAddress,
  onchainRaffleABI,
  useWalletClient,
} from "@/lib/contract";
import { readClient } from "@/lib/contract/client";

import { useNotifications } from "@/contexts/notification-context";
import { parseEther } from "viem";
import { PrizeEvent } from "@/features/raffle/types";
import { useCallback, useRef } from "react";

export const useRaffleEntry = () => {
  const { getWalletClient } = useWalletClient();
  const { addNotification } = useNotifications();

  // Request caching system
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_DURATION = 30000; // 30 seconds

  const getCachedOrFetch = useCallback(async (key: string, fetchFn: () => Promise<any>) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const data = await fetchFn();
    cacheRef.current.set(key, { data, timestamp: Date.now() });
    return data;
  }, []);

  // Centralized error handler
  const handleContractError = useCallback((error: unknown, operation: string) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error in ${operation}:`, error);
    
    addNotification({
      title: "Contract Error",
      message: `Failed to ${operation}: ${message}`,
      type: "error",
      duration: 5000,
    });
    
    throw error;
  }, [addNotification]);

  // Getter functions for reading contract data
  const getRaffleInfo = useCallback(async () => {
    return getCachedOrFetch("raffleInfo", async () => {
      try {
        const result = (await readClient.readContract({
          address: onchainRaffleAddress,
          abi: onchainRaffleABI,
          functionName: "getRaffleInfo",
        })) as [boolean, bigint, bigint, bigint, bigint];
        return {
          active: result[0],
          totalEntries: result[1],
          totalIPTokensCollected: result[2],
          contractBalance: result[3],
          nftPoolSize: result[4],
        };
      } catch (error) {
        handleContractError(error, "fetch raffle info");
      }
    });
  }, [getCachedOrFetch, handleContractError]);

  const getUserStats = useCallback(async (userAddress: string) => {
    return getCachedOrFetch(`userStats-${userAddress}`, async () => {
      try {
        const result = (await readClient.readContract({
          address: onchainRaffleAddress,
          abi: onchainRaffleABI,
          functionName: "getUserStats",
          args: [userAddress as `0x${string}`],
        })) as [bigint, bigint, bigint];

        return {
          totalUserEntries: result[0],
          totalWinnings: result[1],
          distributedPrizes: result[2],
        };
      } catch (error) {
        handleContractError(error, "fetch user stats");
      }
    });
  }, [getCachedOrFetch, handleContractError]);

  const getNFTPoolInfo = useCallback(async () => {
    return getCachedOrFetch("nftPoolInfo", async () => {
      try {
        const result = (await readClient.readContract({
          address: onchainRaffleAddress,
          abi: onchainRaffleABI,
          functionName: "getNFTPoolInfo",
        })) as bigint;

        return {
          commonCount: result,
        };
      } catch (error) {
        handleContractError(error, "fetch NFT pool info");
      }
    });
  }, [getCachedOrFetch, handleContractError]);

  const getNFTPoolTokenIds = useCallback(async () => {
    return getCachedOrFetch("nftPoolTokenIds", async () => {
      try {
        const result = (await readClient.readContract({
          address: onchainRaffleAddress,
          abi: onchainRaffleABI,
          functionName: "getNFTPoolTokenIds",
        })) as bigint[];

        return result;
      } catch (error) {
        handleContractError(error, "fetch NFT pool token IDs");
      }
    });
  }, [getCachedOrFetch, handleContractError]);

  const getEntryPrice = useCallback(async () => {
    return getCachedOrFetch("entryPrice", async () => {
      try {
        const result = (await readClient.readContract({
          address: onchainRaffleAddress,
          abi: onchainRaffleABI,
          functionName: "ENTRY_PRICE",
        })) as bigint;

        return result;
      } catch (error) {
        handleContractError(error, "fetch entry price");
      }
    });
  }, [getCachedOrFetch, handleContractError]);

  const getAllPrizeEntries = useCallback(async (limit = 10) => {
    return getCachedOrFetch(`allPrizeEntries-${limit}`, async () => {
      try {
        const length = await readClient.readContract({
          address: onchainRaffleAddress,
          abi: onchainRaffleABI,
          functionName: "totalEntries",
        });

        const totalEntries = Number(length);
        if (totalEntries === 0) {
          return [];
        }

        const effectiveLimit = Math.max(1, Math.min(limit, totalEntries));
        const startIndex = Math.max(0, totalEntries - effectiveLimit);

        const indices = Array.from({ length: effectiveLimit }, (_, idx) => startIndex + idx);

        // Use Promise.all for parallel requests instead of sequential loop
        const promises = indices.map((i) =>
          readClient.readContract({
            address: onchainRaffleAddress,
            abi: onchainRaffleABI,
            functionName: "allPrizes",
            args: [i],
          })
        );

        return await Promise.all(promises);
      } catch (error) {
        handleContractError(error, "fetch all prize entries");
      }
    });
  }, [getCachedOrFetch, handleContractError]);

  const getUserCooldownStatus = useCallback(async (userAddress: string) => {
    return getCachedOrFetch(`cooldownStatus-${userAddress}`, async () => {
      try {
        const result = (await readClient.readContract({
          address: onchainRaffleAddress,
          abi: onchainRaffleABI,
          functionName: "getUserCooldownStatus",
          args: [userAddress],
        })) as [boolean, bigint, bigint, bigint];

        return {
          canEnter: result[0],
          lastEntryTime: result[1],
          cooldownEndTime: result[2],
          timeRemaining: result[3],
        };
      } catch (error) {
        handleContractError(error, "fetch user cooldown status");
      }
    });
  }, [getCachedOrFetch, handleContractError]);

  const enterRaffle = useCallback(async () => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }
      const [account] = await walletClient.getAddresses();

      const { request } = await readClient.simulateContract({
        address: onchainRaffleAddress,
        abi: onchainRaffleABI,
        functionName: "enterRaffle",
        args: [],
        value: parseEther("0.1"),
        account,
      });

      addNotification({
        title: "Submitting transaction...",
        message: `Entering raffle...`,
        type: "info",
        duration: 5000,
      });

      const txHash = await walletClient.writeContract(request);

      addNotification({
        title: "Transaction submitted!",
        message: `Waiting for confirmation... Hash: ${txHash.slice(0, 10)}...`,
        type: "info",
        duration: 8000,
      });

      const tx = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      addNotification({
        title: "Transaction confirmed!",
        message: `Successfully entered raffle!`,
        type: "success",
        duration: 5000,
      });

      return {
        txHash,
        txReceipt: tx,
        txLink: `https://aeneid.storyscan.io/tx/${txHash}`,
      };
    } catch (error) {
      console.error("Error entering raffle:", error);
      addNotification({
        title: "Transaction failed",
        message: `Failed to enter raffle: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        type: "error",
        duration: 8000,
      });
      throw error;
    }
  }, [getWalletClient, addNotification]);

  const listenToPrizeEvents = useCallback(async (
    address: string,
    onPrizeWon: (prize: PrizeEvent) => void
  ) => {
    // Listen for guaranteed return (immediate prize)
    const unwatchPrizeDistributed = readClient.watchContractEvent({
      address: onchainRaffleAddress,
      abi: onchainRaffleABI,
      eventName: "PrizeDistributed",
      args: { winner: address },
      onLogs: (logs) => {
        logs.forEach((log) => {
          const prize = {
            type: "guaranteed" as const,
            tier: 1,
            ipTokenAmount: (log as any).args.ipTokenAmount,
            nftTokenId: (log as any).args.nftTokenId,
            prizeIndex: (log as any).args.prizeIndex,
            transactionHash: log.transactionHash || "",
            blockNumber: log.blockNumber || BigInt(0),
          };
          onPrizeWon(prize);
        });
      },
    });

    // Listen for bonus prizes (awarded after random number generation)
    const unwatchPrizeAwarded = readClient.watchContractEvent({
      address: onchainRaffleAddress,
      abi: onchainRaffleABI,
      eventName: "PrizeAwarded",
      args: { winner: address },
      onLogs: (logs) => {
        logs.forEach((log) => {
          const prize = {
            type: "bonus" as const,
            tier: (log as any).args.tier,
            ipTokenAmount: (log as any).args.ipTokenAmount,
            nftTokenId: (log as any).args.nftTokenId,
            prizeIndex: (log as any).args.prizeIndex,
            transactionHash: log.transactionHash || "",
            blockNumber: log.blockNumber || BigInt(0),
          };
          onPrizeWon(prize);
        });
      },
    });

    return {
      unwatch: () => {
        unwatchPrizeDistributed();
        unwatchPrizeAwarded();
      },
    };
  }, []);

  return {
    // Getter functions
    getRaffleInfo,
    getUserStats,
    getNFTPoolInfo,
    getNFTPoolTokenIds,
    getEntryPrice,
    getAllPrizeEntries,
    getUserCooldownStatus,
    // Write functions
    enterRaffle,
    // Event monitoring
    listenToPrizeEvents,
  };
};

export default useRaffleEntry;
