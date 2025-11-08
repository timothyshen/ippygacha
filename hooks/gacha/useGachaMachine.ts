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
import { useUserData } from "@/contexts/user-data-context";

export const useGachaMachine = () => {
  const { user, authenticated } = usePrivy();
  const { inventory, unrevealedItems, refreshInventory } = useInventory();
  const {
    purchaseBoxes,
    openBoxes,
    purchaseState,
    resetPurchaseState,
  } = useBlindBox();
  const { addNotification } = useNotifications();
  const { refreshUserData } = useUserData();
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
  const [currentTransactionHash, setCurrentTransactionHash] = useState<
    string | null
  >(null);

  const [isItemRevealed, setIsItemRevealed] = useState(false);
  const [blinkingCell, setBlinkingCell] = useState<number | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [animationPhase, setAnimationPhase] = useState<
    "fast" | "slowing" | "landing" | "none"
  >("none");
  const [showBallDrop, setShowBallDrop] = useState(false);
  const revealWatcherRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = null;
      }
    };
  }, []);

  // Watch purchase state and update animation accordingly
  useEffect(() => {
    if (!isSpinning) return;

    console.log("[Gacha] Purchase state changed:", purchaseState.status);

    // Update animation based on transaction state
    if (purchaseState.status === "preparing") {
      setAnimationPhase("fast");
    } else if (purchaseState.status === "signing") {
      // User needs to sign - slow down and focus on center
      setAnimationPhase("landing");
      setBlinkingCell(4);
    } else if (purchaseState.status === "confirming") {
      // Transaction submitted - accelerate animation
      setAnimationPhase("fast");
    } else if (purchaseState.status === "confirmed") {
      // Stop blinking animation
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = null;
      }
      setAnimationPhase("none");
      setBlinkingCell(4); // Keep center cell highlighted

      // Prepare item data
      const result = getPlaceholderItem();
      setCurrentBlindBox(result);
      setCurrentTransactionHash(purchaseState.txHash);

      // Short pause for dramatic effect, then ball drop
      setTimeout(() => {
        setBlinkingCell(null);
        setShowBallDrop(true);
      }, 300);

      // Wait for ball drop animation to complete, then show modal
      setTimeout(() => {
        setShowBallDrop(false);
        setIsSpinning(false);
        setShowBlindBoxModal(true);
      }, 1400); // 300ms pause + 1100ms ball drop

      // Do backend work in background
      Promise.all([
        authenticated && user?.wallet?.address && purchaseState.txHash
          ? awardActivityPoints(
              user.wallet.address,
              "GACHA_PULL",
              {
                timestamp: new Date().toISOString(),
                amount: 1,
              },
              purchaseState.txHash
            ).then(() => {
              console.log("[Gacha] Activity points recorded");
              return refreshUserData();
            })
          : Promise.resolve(),
        refreshInventory().then(() => {
          console.log("[Gacha] Inventory refreshed");
        }),
      ])
        .then(() => {
          console.log("[Gacha] All backend work complete");
        })
        .catch((error) => {
          console.error("[Gacha] Backend work failed (non-critical):", error);
        });

      // Reset purchase state for next pull
      resetPurchaseState();
    } else if (purchaseState.status === "error") {
      // Stop animation on error
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = null;
      }
      setAnimationPhase("none");
      setBlinkingCell(null);
      setIsSpinning(false);

      // Reset purchase state
      resetPurchaseState();
    }
  }, [purchaseState, isSpinning, authenticated, user, refreshUserData, refreshInventory, resetPurchaseState]);

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
      pollingInterval: 1000, // Poll every 1 second for faster response
      onLogs: (logs) => {
        console.log(`[Gacha] Received ${logs.length} NFTMinted event(s)`);

        const processLogs = async () => {
          for (const log of logs) {
            const { tokenId, nftType, isHidden } = log.args as {
              tokenId: bigint;
              nftType: bigint;
              isHidden: boolean;
            };

            const tokenIdNumber = Number(tokenId);
            const nftTypeNumber = Number(nftType);

            console.log("[Gacha] Processing NFT:", {
              tokenIdNumber,
              nftTypeNumber,
              isHidden,
            });

            const tokenURI = await readClient.readContract({
              address: ippyNFTAddress,
              abi: ippyIPABI,
              functionName: "tokenURI",
              args: [tokenId],
            });

            const metadata = await metadataService.getIPPYMetadata(
              tokenIdNumber,
              ippyNFTAddress
            );

            const mintedItem: GachaItem = {
              id: `nft-${tokenIdNumber}`,
              name: metadata?.metadata.name || "",
              description: metadata?.metadata.description || "",
              emoji: "🎁",
              collection: "ippy",
              version: isHidden ? "hidden" : "standard",
              image: metadata?.cachedUrl,
              attributes: metadata?.metadata.attributes,
            };

            console.log("[Gacha] Setting revealed item:", mintedItem.name);
            setCurrentBlindBox(mintedItem);
            setIsItemRevealed(true);
            setShowBlindBoxModal(true);
          }

          await refreshInventory();
          stopRevealWatcher();
          console.log("[Gacha] Event watcher stopped");
        };

        processLogs().catch((error) => {
          console.error("[Gacha] Failed to process NFTMinted logs:", error);
        });
      },
    });
  }, [walletAddress, refreshInventory, stopRevealWatcher]);

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
    if (isSpinning || showBlindBoxModal) return;

    // 1. Immediately set animation state
    setIsSpinning(true);
    setLeverPulled(true);
    setShowResults(false);
    setCurrentResults([]);
    setAnimationPhase("fast");
    setIsItemRevealed(false);

    // 2. Play lever animation
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLeverPulled(false);

    if (blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = null;
    }

    // 3. Start blinking animation
    startBlinkingAnimation();

    // 4. Start transaction asynchronously (state changes are handled by useEffect)
    try {
      console.log("[Gacha] Calling purchaseBoxes(1)...");
      await purchaseBoxes(1);
      // Transaction state updates are handled by purchaseState in useEffect
    } catch (error) {
      console.error("[Gacha] Error purchasing boxes:", error);
      setIsSpinning(false);
      setAnimationPhase("none");
      setBlinkingCell(null);
    }
  };

  const startBlinkingAnimation = () => {
    // Animation phases: data structure defines behavior
    const ANIMATION_CONFIG = [
      {
        duration: 1500,
        interval: 80,
        cells: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        phase: "fast" as const,
      },
      {
        duration: 1500,
        intervalRange: [80, 300],
        cells: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        phase: "slowing" as const,
      },
      {
        duration: 1000,
        interval: 300,
        cells: [1, 3, 4, 5, 7],
        finalCell: 4,
        phase: "landing" as const,
      },
    ];

    const startTime = Date.now();

    const scheduleNextBlink = () => {
      const elapsed = Date.now() - startTime;
      const totalDuration = ANIMATION_CONFIG.reduce(
        (sum, phase) => sum + phase.duration,
        0
      );

      // If max animation time reached, keep animating on final cell (waiting for transaction)
      if (elapsed >= totalDuration) {
        setAnimationPhase("landing");
        setBlinkingCell(4); // Stay on center cell
        blinkTimeoutRef.current = setTimeout(scheduleNextBlink, 300);
        return;
      }

      // Find current phase
      let accumulatedTime = 0;
      for (const config of ANIMATION_CONFIG) {
        if (elapsed < accumulatedTime + config.duration) {
          const progress = (elapsed - accumulatedTime) / config.duration;

          setAnimationPhase(config.phase);

          // Select cell based on phase config
          if (config.finalCell !== undefined && progress > 0.8) {
            setBlinkingCell(config.finalCell);
          } else {
            setBlinkingCell(
              config.cells[Math.floor(Math.random() * config.cells.length)]
            );
          }

          // Calculate interval (support both fixed and progressive)
          const interval = config.intervalRange
            ? config.intervalRange[0] +
              (config.intervalRange[1] - config.intervalRange[0]) * progress
            : config.interval;

          blinkTimeoutRef.current = setTimeout(scheduleNextBlink, interval);
          return;
        }
        accumulatedTime += config.duration;
      }
    };

    scheduleNextBlink();
  };

  const revealBlindBox = async () => {
    try {
      console.log("[Gacha] Starting reveal watcher...");
      startRevealWatcher();

      console.log("[Gacha] Calling openBoxes(1)...");
      const txHash = await openBoxes(1);
      console.log("[Gacha] Transaction confirmed:", txHash);

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

        // Refresh user data to update level, points, and recent activities
        await refreshUserData();
      }

      console.log("[Gacha] Refreshing inventory...");
      await refreshInventory();
      console.log("[Gacha] Reveal complete. Waiting for NFTMinted event...");
    } catch (error) {
      stopRevealWatcher();
      console.error("[Gacha] Error opening box:", error);
      throw error; // Re-throw so BlindBoxModal can show error
    }
  };

  const closeModalAndReset = () => {
    setShowResults(false);
    setCurrentResults([]);
    setShowBlindBoxModal(false);
    setCurrentBlindBox(null);
    setCurrentTransactionHash(null);
    setIsItemRevealed(false);
    setIsSpinning(false);
    setShowBallDrop(false);
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
    currentTransactionHash,
    isItemRevealed,
    blinkingCell,
    animationPhase,
    showBallDrop,
    inventory,
    unrevealedItems,

    // Actions
    pullGacha,
    revealBlindBox,
    closeModalAndReset,
  };
};
