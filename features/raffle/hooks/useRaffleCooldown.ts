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
// Buffer to account for block timestamp vs client time differences
// This prevents users from clicking "Spin" right when timer hits 0 but blockchain still says cooldown active
const COOLDOWN_BUFFER_MS = 3 * 1000; // 3 seconds buffer

/**
 * Hook for managing raffle cooldown state
 * Handles cooldown checking and countdown display
 */
export const useRaffleCooldown = (walletAddress: string) => {
  const [canSpin, setCanSpin] = useState(true);
  // Store the target end time (client time when cooldown ends) instead of last spin time
  // This accounts for block time vs client time differences
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
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
   * @param address - Wallet address to check
   * @param forceCheck - Bypass throttle for critical checks (e.g., cooldown completion verification)
   */
  const checkCanSpin = useCallback(
    async (address: string, forceCheck: boolean = false) => {
      if (!address) return Promise.resolve();

      if (cooldownCheckPromiseRef.current) {
        return cooldownCheckPromiseRef.current;
      }

      // Throttle contract calls - only allow one call per 2 seconds (unless forced)
      const now = Date.now();
      if (!forceCheck && now - lastContractCallRef.current < 2000) {
        return Promise.resolve();
      }
      lastContractCallRef.current = now;

      const promise = (async () => {
        try {
          // Check if raffle is active
          const raffleInfoData = await getRaffleInfo();
          if (!raffleInfoData || !raffleInfoData.active) {
            setCanSpin(false);
            return;
          }

          // Check smart contract cooldown
          const cooldownStatus = await getUserCooldownStatus(address);
          if (!cooldownStatus) {
            console.error("Failed to get cooldown status");
            return;
          }

          if (cooldownStatus.canEnter) {
            setCanSpin(true);
            setCooldownEndTime(null);
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
            // Calculate end time based on contract's remaining time (not lastEntryTime)
            // This avoids block time vs client time discrepancies
            setCooldownEndTime(Date.now() + timeRemainingMs);
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
    (timeRemainingMs: number, _lastEntryTimeMs: number) => {
      setCanSpin(false);
      // Calculate end time from now + remaining time
      setCooldownEndTime(Date.now() + timeRemainingMs);
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
    if (walletAddress && !canSpin && cooldownEndTime) {
      // Calculate initial remaining time to check if we should even start
      const initialRemaining = cooldownEndTime - Date.now();

      // If already expired based on cooldownEndTime, verify with contract immediately
      if (initialRemaining <= 0) {
        checkCanSpin(walletAddress, true);
        return;
      }

      const interval = setInterval(() => {
        const remainingTime = cooldownEndTime - Date.now();

        if (remainingTime <= 0) {
          // Timer shows 0, but DON'T enable button yet - verify with contract first
          // This prevents race condition where frontend timer is ahead of blockchain
          updateCooldownDisplay(0, COOLDOWN_PERIOD_MS);
          clearInterval(interval);

          // Verify with contract before enabling spin (force check to bypass throttle)
          checkCanSpin(walletAddress, true)
            .catch((error) => {
              console.error("Error verifying cooldown completion:", error);
              // On error, retry after buffer period
              setTimeout(() => {
                checkCanSpin(walletAddress, true);
              }, COOLDOWN_BUFFER_MS);
            });
        } else {
          // Just update the display
          updateCooldownDisplay(remainingTime, COOLDOWN_PERIOD_MS);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [walletAddress, canSpin, cooldownEndTime, checkCanSpin, updateCooldownDisplay]);

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
