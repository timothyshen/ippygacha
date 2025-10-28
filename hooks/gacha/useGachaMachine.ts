import { useState, useRef, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { GachaItem } from "@/types/gacha";
import { useInventory } from "./useInventory";
import { useBlindBox } from "../useBlindBox";
import { useNotifications } from "@/contexts/notification-context";
import { awardActivityPoints } from "@/lib/auth";
import { ippyIPABI } from "@/lib/contract/ippyIPABI";
import { ippyNFTAddress } from "@/lib/contract/contractAddress";
import { readClient } from "@/lib/contract/client";
import { metadataService } from "@/lib/metadata";

export const useGachaMachine = () => {
  const { user, authenticated } = usePrivy();
  const { inventory, unrevealedItems, refreshInventory } = useInventory();
  const { purchaseBoxes, openBoxes } = useBlindBox();
  const { addNotification } = useNotifications();
  const [coins, setCoins] = useState(10);

  const walletAddress = user?.wallet?.address;

  const [isSpinning, setIsSpinning] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [currentResults, setCurrentResults] = useState<GachaItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showBlindBoxModal, setShowBlindBoxModal] = useState(false);
  const [currentBlindBox, setCurrentBlindBox] = useState<GachaItem | null>(
    null
  );

  const [isItemRevealed, setIsItemRevealed] = useState(false);
  const [blinkingCell, setBlinkingCell] = useState<number | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [animationPhase, setAnimationPhase] = useState<
    "fast" | "slowing" | "landing" | "none"
  >("none");
  const revealWatcherRef = useRef<(() => void) | null>(null);

  const getEmojiForNFTType = useCallback((type: number) => {
    const emojiMap: Record<number, string> = {
      0: "🌟",
      1: "🌿",
      2: "🤖",
      3: "🎨",
      4: "🎵",
      5: "🏆",
      6: "🎮",
    };
    return emojiMap[type] || "🎁";
  }, []);

  useEffect(() => {
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = null;
      }
    };
  }, []);

  const stopRevealWatcher = useCallback(() => {
    if (revealWatcherRef.current) {
      revealWatcherRef.current();
      revealWatcherRef.current = null;
    }
  }, []);

  const startRevealWatcher = useCallback(() => {
    if (!walletAddress) return;

    stopRevealWatcher();

    revealWatcherRef.current = readClient.watchContractEvent({
      address: ippyNFTAddress,
      abi: ippyIPABI,
      eventName: "NFTMinted",
      args: { to: walletAddress as `0x${string}` },
      poll: true,
      pollingInterval: 2000,
      onLogs: (logs) => {
        const processLogs = async () => {
          for (const log of logs) {
            const { tokenId, nftType, isHidden } = log.args as {
              tokenId: bigint;
              nftType: bigint;
              isHidden: boolean;
            };

            const tokenIdNumber = Number(tokenId);
            const nftTypeNumber = Number(nftType);

            const tokenURI = await readClient.readContract({
              address: ippyNFTAddress,
              abi: ippyIPABI,
              functionName: "tokenURI",
              args: [tokenId],
            });

            const metadata = await metadataService.getIPPYMetadata(
              tokenIdNumber,
              tokenURI,
              nftTypeNumber
            );

            const mintedItem: GachaItem = {
              id: `nft-${tokenIdNumber}`,
              name: metadata?.name || `IPPY #${tokenIdNumber}`,
              description:
                metadata?.description || "Freshly minted IPPY collectible",
              emoji:
                (metadata?.attributes?.find(
                  (attr) => attr.trait_type === "Emoji"
                )?.value as string) || getEmojiForNFTType(nftTypeNumber),
              collection: "ippy",
              version: isHidden ? "hidden" : "standard",
              tokenId: tokenIdNumber,
              nftType: nftTypeNumber,
              tokenURI,
              metadata: metadata || undefined,
              metadataLoading: false,
              metadataError: metadata ? undefined : "Failed to load metadata",
              image: metadata?.image,
              attributes: metadata?.attributes,
              rarity: metadata?.rarity || (isHidden ? "hidden" : "standard"),
              theme: metadata?.theme,
              background_color: metadata?.background_color,
            };

            setCurrentBlindBox(mintedItem);
            setIsItemRevealed(true);
            setShowBlindBoxModal(true);
          }

          await refreshInventory();
          stopRevealWatcher();
        };

        processLogs().catch((error) => {
          console.error("Failed to process NFTMinted logs:", error);
        });
      },
    });
  }, [walletAddress, refreshInventory, stopRevealWatcher, getEmojiForNFTType]);

  // Contract handles randomness - this is just a placeholder for the UI
  const getPlaceholderItem = (): GachaItem => {
    return {
      id: "placeholder",
      name: "IPPY NFT",
      description: "IPPY NFT from contract",
      emoji: "🎁",
      collection: "ippy",
      version: "standard",
    };
  };

  const pullGacha = async () => {
    if (coins < 1 || isSpinning || showBlindBoxModal) return;

    setCoins((prev) => prev - 1);
    setIsSpinning(true);
    setLeverPulled(true);
    setShowResults(false);
    setCurrentResults([]);
    setAnimationPhase("fast");
    setIsItemRevealed(false);

    await new Promise((resolve) => setTimeout(resolve, 500));
    setLeverPulled(false);

    if (blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = null;
    }

    startBlinkingAnimation();

    addNotification({
      type: "success",
      title: "Starting Gacha!",
      message: `Pulling a box...`,
      icon: "🎰",
      duration: 4000,
    });
  };

  const startBlinkingAnimation = () => {
    const fastPhaseDuration = 1000;
    const slowingPhaseDuration = 1000;
    const landingPhaseDuration = 500;
    const initialBlinkInterval = 80;
    const maxBlinkInterval = 300;

    const startTime = Date.now();
    let currentInterval = initialBlinkInterval;

    const scheduleNextBlink = () => {
      blinkTimeoutRef.current = null;
      const elapsedTime = Date.now() - startTime;
      const totalAnimationTime =
        fastPhaseDuration + slowingPhaseDuration + landingPhaseDuration;

      if (elapsedTime < fastPhaseDuration) {
        setAnimationPhase((prev) => (prev === "fast" ? prev : "fast"));
        setBlinkingCell(Math.floor(Math.random() * 9));
        currentInterval = initialBlinkInterval;
      } else if (elapsedTime < fastPhaseDuration + slowingPhaseDuration) {
        setAnimationPhase((prev) => (prev === "slowing" ? prev : "slowing"));

        setBlinkingCell(Math.floor(Math.random() * 9));
        const slowingProgress =
          (elapsedTime - fastPhaseDuration) / slowingPhaseDuration;
        currentInterval =
          initialBlinkInterval +
          (maxBlinkInterval - initialBlinkInterval) * slowingProgress;
      } else if (elapsedTime < totalAnimationTime) {
        setAnimationPhase((prev) => (prev === "landing" ? prev : "landing"));

        const remainingTime = totalAnimationTime - elapsedTime;
        const remainingBlinks = Math.max(
          1,
          Math.floor(remainingTime / maxBlinkInterval)
        );

        if (remainingBlinks <= 1) {
          setBlinkingCell(4);
        } else {
          const possibleCells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
          const landingProgress =
            (elapsedTime - fastPhaseDuration - slowingPhaseDuration) /
            landingPhaseDuration;

          if (landingProgress > 0.5) {
            const adjacentCells = [1, 3, 4, 5, 7];
            setBlinkingCell(
              adjacentCells[Math.floor(Math.random() * adjacentCells.length)]
            );
          } else {
            setBlinkingCell(
              possibleCells[Math.floor(Math.random() * possibleCells.length)]
            );
          }
        }

        currentInterval = maxBlinkInterval;
      } else {
        finishAnimation();
        return;
      }

      blinkTimeoutRef.current = setTimeout(scheduleNextBlink, currentInterval);
    };

    scheduleNextBlink();
  };

  const finishAnimation = async () => {
    try {
      const txHash = await purchaseBoxes(1);

      console.log("txHash", txHash);
      // // Record gacha pull activity
      if (authenticated && user?.wallet?.address && txHash) {
        await awardActivityPoints(
          user.wallet.address,
          "GACHA_PULL",
          {
            timestamp: new Date().toISOString(),
            amount: 1,
          },
          txHash
        );
      }

      // Refresh balances after purchase
      await refreshInventory();
    } catch (error) {
      console.error("Error purchasing boxes:", error);
    } finally {
      setIsSpinning(false);
      // Use placeholder item for UI - actual item comes from contract
      const result = getPlaceholderItem();

      setAnimationPhase("none");
      setBlinkingCell(null);

      // Since we're using contract data, these functions now trigger refreshes
      setCurrentBlindBox(result);

      setShowBlindBoxModal(true);
      setIsSpinning(false);
    }
  };

  const revealBlindBox = async () => {
    try {
      startRevealWatcher();

      const txHash = await openBoxes(1);

      // Record reveal activity with additional metadata
      if (authenticated && user?.wallet?.address && txHash) {
        await awardActivityPoints(
          user.wallet.address,
          "BOX_REVEAL",
          {
            timestamp: new Date().toISOString(),
            action: "reveal",
            amount: 1,
          },
          txHash
        );
      }

      await refreshInventory();
    } catch (error) {
      stopRevealWatcher();
      console.error("Error opening box:", error);
    }
  };

  const closeModalAndReset = () => {
    setShowResults(false);
    setCurrentResults([]);
    setShowBlindBoxModal(false);
    setCurrentBlindBox(null);
    setIsItemRevealed(false);
    setIsSpinning(false);
  };

  useEffect(() => {
    return () => {
      stopRevealWatcher();
    };
  }, [stopRevealWatcher]);

  return {
    // State
    coins,
    isSpinning,
    leverPulled,
    currentResults,
    showResults,
    showBlindBoxModal,
    currentBlindBox,
    isItemRevealed,
    blinkingCell,
    animationPhase,
    inventory,
    unrevealedItems,

    // Actions
    pullGacha,
    revealBlindBox,
    closeModalAndReset,
  };
};
