import {
  onchainRaffleAddress,
  onchainRaffleABI,
  useWalletClient,
} from "@/lib/contract";
import { readClient } from "@/lib/contract/client";

import { useNotifications } from "@/contexts/notification-context";
import { parseEther } from "viem";
import { PrizeEvent, ContractPrize } from "@/features/raffle/types";

export const useRaffleEntry = () => {
  const { getWalletClient } = useWalletClient();
  const { addNotification } = useNotifications();

  // Debug contract configuration
  console.log("🔧 useRaffleEntry: Contract configuration:");
  console.log("  - onchainRaffleAddress:", onchainRaffleAddress);
  console.log("  - readClient:", readClient);
  console.log("  - ABI length:", onchainRaffleABI.length);
  console.log(
    "  - ABI functions:",
    onchainRaffleABI
      .filter((item) => item.type === "function")
      .map((f) => f.name)
  );

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
    console.log("🔍 getUserStats: Starting with address:", userAddress);
    console.log("🔍 getUserStats: Contract address:", onchainRaffleAddress);
    console.log(
      "🔍 getUserStats: ABI function exists:",
      onchainRaffleABI.some((item) => item.name === "getUserStats")
    );

    try {
      console.log("📡 getUserStats: Making contract call...");
      const result = (await readClient.readContract({
        address: onchainRaffleAddress,
        abi: onchainRaffleABI,
        functionName: "getUserStats",
        args: [userAddress as `0x${string}`],
      })) as [bigint, bigint, bigint];

      console.log("✅ getUserStats: Raw contract result:", result);
      console.log("📊 getUserStats: Result breakdown:");
      console.log("  - totalUserEntries (result[0]):", result[0]);
      console.log("  - totalWinnings (result[1]):", result[1]);
      console.log("  - distributedPrizes (result[2]):", result[2]);

      const processedResult = {
        totalUserEntries: result[0],
        totalWinnings: result[1],
        distributedPrizes: result[2],
      };

      console.log("🎯 getUserStats: Processed result:", processedResult);
      return processedResult;
    } catch (error) {
      console.error("❌ getUserStats: Error details:", error);
      console.error(
        "❌ getUserStats: Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(
        "❌ getUserStats: Error stack:",
        error instanceof Error ? error.stack : "No stack"
      );
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

  const getAllPrizeEntries = async () => {
    console.log("🔍 getAllPrizeEntries: Starting...");
    console.log(
      "🔍 getAllPrizeEntries: Contract address:",
      onchainRaffleAddress
    );
    console.log(
      "🔍 getAllPrizeEntries: ABI function exists:",
      onchainRaffleABI.some((item) => item.name === "allPrizes")
    );

    try {
      const length = await readClient.readContract({
        address: onchainRaffleAddress,
        abi: onchainRaffleABI,
        functionName: "totalEntries",
      });

      console.log("📡 getAllPrizeEntries: Making contract call...");

      const result = [];
      for (let i = 0; i < (length as number); i++) {
        const prize = await readClient.readContract({
          address: onchainRaffleAddress,
          abi: onchainRaffleABI,
          functionName: "allPrizes",
          args: [i],
        });
        result.push(prize);
      }

      console.log("✅ getAllPrizeEntries: Raw contract result:", result);
      console.log("📊 getAllPrizeEntries: Result type:", typeof result);
      console.log(
        "📊 getAllPrizeEntries: Result length:",
        Array.isArray(result) ? result.length : "Not an array"
      );

      if (Array.isArray(result)) {
        console.log("🏆 getAllPrizeEntries: Prize breakdown:");
        result.forEach((prize, index) => {
          console.log(`  Prize ${index}:`, {
            winner: prize.winner,
            ipTokenAmount: prize.ipTokenAmount,
            nftTokenId: prize.nftTokenId,
            tier: prize.tier,
            timestamp: prize.timestamp,
          });
        });
      }

      console.log("🎯 getAllPrizeEntries: Returning result:", result);
      return result;
    } catch (error) {
      console.error("❌ getAllPrizeEntries: Error details:", error);
      console.error(
        "❌ getAllPrizeEntries: Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(
        "❌ getAllPrizeEntries: Error stack:",
        error instanceof Error ? error.stack : "No stack"
      );
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
  };

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
