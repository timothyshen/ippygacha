import { useState, useEffect, useCallback } from "react"
import { MockServerAPI, MockSmartContract } from "../types"
import { COOLDOWN_PERIOD } from "../constants"

export const useCooldown = (
  mockServerAPI: MockServerAPI,
  mockSmartContract: MockSmartContract
) => {
  const [canSpin, setCanSpin] = useState(true)
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [cooldownHours, setCooldownHours] = useState(0)
  const [cooldownMinutes, setCooldownMinutes] = useState(0)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [cooldownProgress, setCooldownProgress] = useState(0)
  const [serverSyncStatus, setServerSyncStatus] = useState<"synced" | "syncing" | "error">("synced")
  const [contractValidation, setContractValidation] = useState<"pending" | "valid" | "invalid">("pending")

  const updateCooldownDisplay = useCallback((remainingTime: number) => {
    const hours = Math.floor(remainingTime / (60 * 60 * 1000))
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000)
    const progress = ((COOLDOWN_PERIOD - remainingTime) / COOLDOWN_PERIOD) * 100

    setCooldownHours(hours)
    setCooldownMinutes(minutes)
    setCooldownSeconds(seconds)
    setCooldownProgress(progress)
    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
  }, [])

  const checkLocalCooldown = useCallback(() => {
    const storedLastSpin = localStorage.getItem("lastSpinTime")
    if (storedLastSpin) {
      const lastSpin = Number.parseInt(storedLastSpin)
      const now = Date.now()
      const timeSinceLastSpin = now - lastSpin

      if (timeSinceLastSpin < COOLDOWN_PERIOD) {
        setCanSpin(false)
        setLastSpinTime(lastSpin)
        updateCooldownDisplay(COOLDOWN_PERIOD - timeSinceLastSpin)
      } else {
        setCanSpin(true)
        setLastSpinTime(null)
        setCooldownHours(0)
        setCooldownMinutes(0)
        setCooldownSeconds(0)
        setCooldownProgress(0)
      }
    }
  }, [updateCooldownDisplay])

  const checkHybridCooldown = useCallback(async (address: string) => {
    if (!address) return

    try {
      setServerSyncStatus("syncing")
      setContractValidation("pending")

      // Check both server and contract cooldowns in parallel
      const [serverResponse, contractCanSpin] = await Promise.all([
        mockServerAPI.checkCooldown(address),
        mockSmartContract.checkCooldown(address),
      ])

      console.log("[v0] Server cooldown:", serverResponse)
      console.log("[v0] Contract can spin:", contractCanSpin)

      // Use the most restrictive cooldown (server OR contract says no)
      const hybridCanSpin = serverResponse.canSpin && contractCanSpin

      setCanSpin(hybridCanSpin)
      setServerSyncStatus("synced")
      setContractValidation(contractCanSpin ? "valid" : "invalid")

      if (!hybridCanSpin && serverResponse.remainingTime > 0) {
        setLastSpinTime(serverResponse.lastSpinTime)
        updateCooldownDisplay(serverResponse.remainingTime)
      } else {
        setLastSpinTime(null)
        setCooldownHours(0)
        setCooldownMinutes(0)
        setCooldownSeconds(0)
        setCooldownProgress(0)
      }
    } catch (error) {
      console.error("[v0] Error checking hybrid cooldown:", error)
      setServerSyncStatus("error")
      setContractValidation("invalid")
      // Fallback to local storage check
      checkLocalCooldown()
    }
  }, [mockServerAPI, mockSmartContract, updateCooldownDisplay, checkLocalCooldown])

  return {
    canSpin,
    setCanSpin,
    lastSpinTime,
    setLastSpinTime,
    timeRemaining,
    cooldownHours,
    cooldownMinutes,
    cooldownSeconds,
    cooldownProgress,
    serverSyncStatus,
    setServerSyncStatus,
    contractValidation,
    setContractValidation,
    checkHybridCooldown,
    updateCooldownDisplay,
  }
}