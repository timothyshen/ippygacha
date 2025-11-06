import { useState, useEffect, useCallback, useRef } from "react";
import { useRaffleEntry } from "@/hooks/raffle/useRaffleEntry";
import { calculateCooldownDisplay } from "@/lib/raffle/utils";

interface CooldownDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
  timeRemaining: string;
}

const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for managing raffle cooldown state
 * Handles cooldown checking and countdown display
 */
export const useRaffleCooldown = (walletAddress: string) => {
  const [canSpin, setCanSpin] = useState(true);
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);
  const [cooldownDisplay, setCooldownDisplay] = useState<CooldownDisplay>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    progress: 0,
    timeRemaining: "0h 0m 0s",
  });

  const lastContractCallRef = useRef<number>(0);
  const cooldownCheckPromiseRef = useRef<Promise<void> | null>(null);

  const { getRaffleInfo, getUserCooldownStatus } = useRaffleEntry();

  /**
   * Update cooldown display with current remaining time
   */
  const updateCooldownDisplay = useCallback(
    (remainingTimeMs: number, cooldownPeriodMs: number = COOLDOWN_PERIOD_MS) => {
      const display = calculateCooldownDisplay(remainingTimeMs, cooldownPeriodMs);
      setCooldownDisplay(display);
    },
    []
  );

  /**
   * Check if user can spin (from smart contract)
   */
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
            setCooldownDisplay({
              hours: 0,
              minutes: 0,
              seconds: 0,
              progress: 0,
              timeRemaining: "0h 0m 0s",
            });
          } else {
            setCanSpin(false);
            const timeRemainingMs = Number(cooldownStatus.timeRemaining) * 1000;
            setLastSpinTime(Number(cooldownStatus.lastEntryTime) * 1000);
            updateCooldownDisplay(timeRemainingMs, COOLDOWN_PERIOD_MS);
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

  /**
   * Manually update cooldown state (called after a successful spin)
   */
  const startCooldown = useCallback(
    (timeRemainingMs: number, lastEntryTimeMs: number) => {
      setCanSpin(false);
      setLastSpinTime(lastEntryTimeMs);
      updateCooldownDisplay(timeRemainingMs, COOLDOWN_PERIOD_MS);
    },
    [updateCooldownDisplay]
  );

  // Check cooldown when wallet connects (debounced)
  useEffect(() => {
    if (walletAddress) {
      const timeoutId = setTimeout(() => {
        checkCanSpin(walletAddress);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [walletAddress, checkCanSpin]);

  // Cooldown monitoring effect - updates UI countdown
  useEffect(() => {
    if (walletAddress && !canSpin && lastSpinTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeSinceLastSpin = now - lastSpinTime;
        const remainingTime = COOLDOWN_PERIOD_MS - timeSinceLastSpin;

        if (remainingTime <= 0) {
          // Immediately set canSpin to true for instant UI feedback
          setCanSpin(true);
          setLastSpinTime(null);
          updateCooldownDisplay(0, COOLDOWN_PERIOD_MS);

          // Verify with contract in background (double-check)
          checkCanSpin(walletAddress).catch((error) => {
            console.error("Error verifying cooldown completion:", error);
          });

          clearInterval(interval);
        } else {
          // Just update the display
          updateCooldownDisplay(remainingTime, COOLDOWN_PERIOD_MS);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [walletAddress, canSpin, lastSpinTime, checkCanSpin, updateCooldownDisplay]);

  return {
    // State
    canSpin,
    cooldownHours: cooldownDisplay.hours,
    cooldownMinutes: cooldownDisplay.minutes,
    cooldownSeconds: cooldownDisplay.seconds,
    cooldownProgress: cooldownDisplay.progress,
    timeRemaining: cooldownDisplay.timeRemaining,

    // Actions
    checkCanSpin,
    startCooldown,
  };
};
