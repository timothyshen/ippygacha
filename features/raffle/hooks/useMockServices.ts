import { useMemo } from "react"
import { MockServerAPI, MockSmartContract, CooldownResponse, SpinResponse } from "../types"
import { COOLDOWN_PERIOD, PRIZES } from "../constants"

export const useMockServices = () => {
  const mockServerAPI: MockServerAPI = useMemo(() => ({
    async checkCooldown(walletAddress: string): Promise<CooldownResponse> {
      console.log("[v0] Checking server cooldown for:", walletAddress)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

      // Mock server-side cooldown logic
      const serverLastSpin = localStorage.getItem(`server_cooldown_${walletAddress}`)
      const now = Date.now()

      if (serverLastSpin) {
        const lastSpin = Number.parseInt(serverLastSpin)
        const timeSinceLastSpin = now - lastSpin

        if (timeSinceLastSpin < COOLDOWN_PERIOD) {
          return {
            canSpin: false,
            lastSpinTime: lastSpin,
            nextAllowedSpin: lastSpin + COOLDOWN_PERIOD,
            remainingTime: COOLDOWN_PERIOD - timeSinceLastSpin,
          }
        }
      }

      return {
        canSpin: true,
        lastSpinTime: null,
        nextAllowedSpin: null,
        remainingTime: 0,
      }
    },

    async recordSpin(walletAddress: string, prize: string): Promise<SpinResponse> {
      console.log("[v0] Recording spin on server:", walletAddress, prize)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const now = Date.now()

      // Store server-side cooldown
      localStorage.setItem(`server_cooldown_${walletAddress}`, now.toString())

      return {
        success: true,
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        prize,
        nextAllowedSpin: now + COOLDOWN_PERIOD,
      }
    },
  }), [])

  const mockSmartContract: MockSmartContract = useMemo(() => ({
    async checkCooldown(walletAddress: string): Promise<boolean> {
      console.log("[v0] Checking smart contract cooldown for:", walletAddress)

      // Simulate blockchain query delay
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Mock contract cooldown logic (could be different from server)
      const contractLastSpin = localStorage.getItem(`contract_cooldown_${walletAddress}`)
      if (contractLastSpin) {
        const lastSpin = Number.parseInt(contractLastSpin)
        const timeSinceLastSpin = Date.now() - lastSpin

        return timeSinceLastSpin >= COOLDOWN_PERIOD
      }

      return true
    },

    async spin(walletAddress: string): Promise<{ success: boolean; prize: string; transactionHash: string }> {
      console.log("[v0] Executing smart contract spin for:", walletAddress)

      // Simulate transaction time
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

      // Mock contract validation - reject if cooldown not met
      const canSpin = await this.checkCooldown(walletAddress)
      if (!canSpin) {
        throw new Error("Contract cooldown not met")
      }

      // Record contract cooldown
      localStorage.setItem(`contract_cooldown_${walletAddress}`, Date.now().toString())

      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        const randomPrizeIndex = Math.floor(Math.random() * PRIZES.length)
        const prize = PRIZES[randomPrizeIndex].name

        return {
          success: true,
          prize,
          transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        }
      } else {
        throw new Error("Transaction failed")
      }
    },
  }), [])

  return {
    mockServerAPI,
    mockSmartContract,
  }
}