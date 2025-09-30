import { useMemo } from "react"
import { MockServerAPI, CooldownResponse, SpinResponse } from "../types"
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

  return mockServerAPI
}