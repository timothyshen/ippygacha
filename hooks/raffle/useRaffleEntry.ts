import {
  onchainRaffleAddress,
  onchainRaffleABI,
  useWalletClient,
} from "@/lib/contract";
import { readClient } from "@/lib/contract/client";

import { useNotifications } from "@/contexts/notification-context";
import { parseEther, formatEther } from "viem";
import { PrizeEvent } from "@/features/raffle/types";

export const useRaffleEntry = () => {
  const { getWalletClient } = useWalletClient();
  const { addNotification } = useNotifications();

  // Getter functions for reading contract data
  const getRaffleInfo = async () => {
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
      console.error("Error fetching raffle info:", error);
      throw error;
    }
  };

  const getUserStats = async (userAddress: string) => {
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
      console.error("Error fetching user stats:", error);
      throw error;
    }
  };

  const getNFTPoolInfo = async () => {
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
      console.error("Error fetching NFT pool info:", error);
      throw error;
    }
  };

  const getNFTPoolTokenIds = async () => {
    try {
      const result = (await readClient.readContract({
        address: onchainRaffleAddress,
        abi: onchainRaffleABI,
        functionName: "getNFTPoolTokenIds",
      })) as bigint[];

      return result;
    } catch (error) {
      console.error("Error fetching NFT pool token IDs:", error);
      throw error;
    }
  };

  const getEntryPrice = async () => {
    try {
      const result = (await readClient.readContract({
        address: onchainRaffleAddress,
        abi: onchainRaffleABI,
        functionName: "ENTRY_PRICE",
      })) as bigint;

      return result;
    } catch (error) {
      console.error("Error fetching entry price:", error);
      throw error;
    }
  };

  const getUserEntries = async (userAddress: string) => {
    try {
      // For now, we'll need to iterate through the indices
      // This is a simplified version - in practice, you might want to batch these calls
      const entries = [];
      for (let i = 0; i < 10; i++) {
        // Limit to first 10 entries for now
        try {
          const entryIndex = (await readClient.readContract({
            address: onchainRaffleAddress,
            abi: onchainRaffleABI,
            functionName: "userEntryIndices",
            args: [userAddress as `0x${string}`, BigInt(i)],
          })) as bigint;

          if (entryIndex > 0) {
            const entry = (await readClient.readContract({
              address: onchainRaffleAddress,
              abi: onchainRaffleABI,
              functionName: "allEntries",
              args: [entryIndex],
            })) as [string, bigint, bigint, bigint];

            entries.push({
              user: entry[0],
              entryCount: entry[1],
              ipTokensSpent: entry[2],
              timestamp: entry[3],
            });
          }
        } catch {
          // Entry doesn't exist, break
          break;
        }
      }

      return entries;
    } catch (error) {
      console.error("Error fetching user entries:", error);
      throw error;
    }
  };

  const getUserPrizes = async (userAddress: string) => {
    try {
      // Get user prize indices
      const prizes = [];
      for (let i = 0; i < 10; i++) {
        // Limit to first 10 prizes for now
        try {
          const prizeIndex = (await readClient.readContract({
            address: onchainRaffleAddress,
            abi: onchainRaffleABI,
            functionName: "userPrizeIndices",
            args: [userAddress as `0x${string}`, BigInt(i)],
          })) as bigint;

          if (prizeIndex > 0) {
            const prize = (await readClient.readContract({
              address: onchainRaffleAddress,
              abi: onchainRaffleABI,
              functionName: "allPrizes",
              args: [prizeIndex],
            })) as [string, number, bigint, bigint, boolean, bigint];

            prizes.push({
              winner: prize[0],
              tier: prize[1],
              ipTokenAmount: prize[2],
              nftTokenId: prize[3],
              distributed: prize[4],
              timestamp: prize[5],
            });
          }
        } catch {
          // Prize doesn't exist, break
          break;
        }
      }

      return prizes;
    } catch (error) {
      console.error("Error fetching user prizes:", error);
      throw error;
    }
  };

  const getUserCooldownStatus = async (userAddress: string) => {
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
      console.error("Error fetching user cooldown status:", error);
      throw error;
    }
  };

  const enterRaffle = async () => {
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
  };

  const listenToPrizeEvents = async (
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
            type: "guaranteed",
            tier: 1,
            ipTokenAmount: log.args.ipTokenAmount,
            nftTokenId: log.args.nftTokenId,
            prizeIndex: log.args.prizeIndex,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
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
            type: "bonus",
            tier: log.args.tier,
            ipTokenAmount: log.args.ipTokenAmount,
            nftTokenId: log.args.nftTokenId,
            prizeIndex: log.args.prizeIndex,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
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
  };

  return {
    // Getter functions
    getRaffleInfo,
    getUserStats,
    getNFTPoolInfo,
    getNFTPoolTokenIds,
    getEntryPrice,
    getUserEntries,
    getUserPrizes,
    getUserCooldownStatus,
    // Write functions
    enterRaffle,
    // Event monitoring
    listenToPrizeEvents,
  };
};

export default useRaffleEntry;
