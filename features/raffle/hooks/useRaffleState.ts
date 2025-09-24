import { useState, useEffect, useCallback } from "react"
import { Winner } from "../types"
import { INITIAL_WINNERS } from "../constants"
import { useWallet } from "./useWallet"
import { useMockServices } from "./useMockServices"
import { useCooldown } from "./useCooldown"

export const useRaffleState = () => {
  // Basic raffle state
  const [isSpinning, setIsSpinning] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [spinnerRotation, setSpinnerRotation] = useState(0)
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null)
  const [selectedPrizeValue, setSelectedPrizeValue] = useState<string | null>(null)
  const [showWinModal, setShowWinModal] = useState(false)
  const [tickerOffset, setTickerOffset] = useState(0)
  const [isTransactionPending, setIsTransactionPending] = useState(false)
  const [recentWinners, setRecentWinners] = useState<Winner[]>(INITIAL_WINNERS)

  // Mock services
  const { mockServerAPI, mockSmartContract } = useMockServices()

  // Cooldown management
  const {
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
  } = useCooldown(mockServerAPI, mockSmartContract)

  // Wallet connection
  const { walletConnected, walletAddress, connectWallet } = useWallet(checkHybridCooldown)

  // Ticker animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Cooldown monitoring effect
  useEffect(() => {
    if (walletAddress && !canSpin) {
      const interval = setInterval(() => {
        checkHybridCooldown(walletAddress)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [walletAddress, canSpin, checkHybridCooldown])

  const handleSpinWheel = useCallback(async () => {
    if (!canSpin || !walletConnected) return

    try {
      setIsSpinning(true)
      setIsTransactionPending(true)
      setSelectedPrize(null)
      setServerSyncStatus("syncing")
      setContractValidation("pending")

      console.log("[v0] Starting hybrid spin process...")

      // Step 1: Double-check server cooldown
      const serverCheck = await mockServerAPI.checkCooldown(walletAddress)
      if (!serverCheck.canSpin) {
        throw new Error("Server cooldown not met")
      }

      // Step 2: Execute smart contract transaction
      setContractValidation("pending")
      const contractResult = await mockSmartContract.spin(walletAddress)
      setContractValidation("valid")

      console.log("[v0] Contract transaction completed:", contractResult)

      // Step 3: Record spin on server for sync
      const serverResult = await mockServerAPI.recordSpin(walletAddress, contractResult.prize)
      setServerSyncStatus("synced")

      console.log("[v0] Server sync completed:", serverResult)

      setIsTransactionPending(false)
      setCanSpin(false)

      // Update local storage as backup
      localStorage.setItem("lastSpinTime", Date.now().toString())

      // Start spinning animation after all validations pass
      const totalRotations = 5 + Math.random() * 3
      const finalRotation = totalRotations * 360
      setSpinnerRotation(finalRotation)

      await new Promise((resolve) => setTimeout(resolve, 4000))

      setSelectedPrize(contractResult.prize)
      setSelectedPrizeValue(contractResult.prize)

      const newWinner: Winner = {
        id: Date.now(),
        name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        prize: contractResult.prize,
        date: "Just now",
        value: contractResult.prize,
      }

      setRecentWinners((prev) => [newWinner, ...prev.slice(0, 5)])
      setIsSpinning(false)
      setShowConfetti(true)
      setShowWinModal(true)

      setTimeout(() => {
        setShowConfetti(false)
      }, 4000)

      // Refresh cooldown status
      await checkHybridCooldown(walletAddress)
    } catch (error: any) {
      console.error("[v0] Hybrid spin failed:", error)
      setIsSpinning(false)
      setIsTransactionPending(false)
      setServerSyncStatus("error")
      setContractValidation("invalid")
      alert(`Spin failed: ${error.message}`)
    }
  }, [
    canSpin,
    walletConnected,
    walletAddress,
    mockServerAPI,
    mockSmartContract,
    setServerSyncStatus,
    setContractValidation,
    setCanSpin,
    checkHybridCooldown,
  ])

  return {
    // Spinning state
    isSpinning,
    showConfetti,
    spinnerRotation,
    selectedPrize,
    selectedPrizeValue,
    showWinModal,
    setShowWinModal,
    tickerOffset,
    isTransactionPending,
    recentWinners,

    // Cooldown state
    canSpin,
    timeRemaining,
    cooldownHours,
    cooldownMinutes,
    cooldownSeconds,
    cooldownProgress,
    serverSyncStatus,
    contractValidation,

    // Wallet state
    walletConnected,
    walletAddress,
    connectWallet,

    // Actions
    handleSpinWheel,
  }
}