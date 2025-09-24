import { useState, useEffect, useCallback } from "react"
import { Web3Window } from "../types"

declare const window: Web3Window

export const useWallet = (onConnectionChange?: (address: string) => void) => {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask or another Web3 wallet!")
        return
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setWalletConnected(true)
        setWalletAddress(accounts[0])
        onConnectionChange?.(accounts[0])
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      alert("Failed to connect wallet. Please try again.")
    }
  }, [onConnectionChange])

  const checkWalletConnection = useCallback(async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })
        if (accounts.length > 0) {
          setWalletConnected(true)
          setWalletAddress(accounts[0])
          onConnectionChange?.(accounts[0])
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }, [onConnectionChange])

  useEffect(() => {
    checkWalletConnection()
  }, [checkWalletConnection])

  return {
    walletConnected,
    walletAddress,
    connectWallet,
    checkWalletConnection,
  }
}