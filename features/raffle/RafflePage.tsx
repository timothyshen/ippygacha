"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, Gift, Star, Clock, Sparkles, Coins, ImageIcon, Heart, Wallet, Shield, Database } from "lucide-react"

interface Winner {
    id: number
    name: string
    prize: string
    date: string
    value: string
}

interface Web3Window extends Window {
    ethereum?: any
}

interface CooldownResponse {
    canSpin: boolean
    lastSpinTime: number | null
    nextAllowedSpin: number | null
    remainingTime: number
}

interface SpinResponse {
    success: boolean
    transactionHash: string
    prize: string
    nextAllowedSpin: number
}

declare const window: Web3Window

export default function PlaygroundRaffle() {
    const [isSpinning, setIsSpinning] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [spinnerRotation, setSpinnerRotation] = useState(0)
    const [selectedPrize, setSelectedPrize] = useState<string | null>(null)
    const [selectedPrizeValue, setSelectedPrizeValue] = useState<string | null>(null)
    const [showWinModal, setShowWinModal] = useState(false)
    const [tickerOffset, setTickerOffset] = useState(0)
    const [lastSpinTime, setLastSpinTime] = useState<number | null>(null)
    const [canSpin, setCanSpin] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState<string>("")
    const [walletConnected, setWalletConnected] = useState(false)
    const [walletAddress, setWalletAddress] = useState<string>("")
    const [isTransactionPending, setIsTransactionPending] = useState(false)
    const [cooldownHours, setCooldownHours] = useState(0)
    const [cooldownMinutes, setCooldownMinutes] = useState(0)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)
    const [cooldownProgress, setCooldownProgress] = useState(0)
    const [serverSyncStatus, setServerSyncStatus] = useState<"synced" | "syncing" | "error">("synced")
    const [contractValidation, setContractValidation] = useState<"pending" | "valid" | "invalid">("pending")

    const [recentWinners, setRecentWinners] = useState<Winner[]>([
        { id: 1, name: "Emma Johnson", prize: "1 IP", date: "2 hours ago", value: "1 IP" },
        { id: 2, name: "Liam Chen", prize: "NFT", date: "4 hours ago", value: "NFT" },
        { id: 3, name: "Sofia Rodriguez", prize: "Thank You", date: "6 hours ago", value: "Thank You" },
        { id: 4, name: "Noah Williams", prize: "5 IP", date: "1 day ago", value: "5 IP" },
        { id: 5, name: "Ava Thompson", prize: "0.5 IP", date: "1 day ago", value: "0.5 IP" },
        { id: 6, name: "Oliver Davis", prize: "2 IP", date: "2 days ago", value: "2 IP" },
    ])

    const prizes = [
        { name: "1 IP", icon: Coins, color: "text-yellow-500" },
        { name: "2 IP", icon: Coins, color: "text-green-500" },
        { name: "0.5 IP", icon: Coins, color: "text-blue-500" },
        { name: "5 IP", icon: Coins, color: "text-purple-500" },
        { name: "NFT", icon: ImageIcon, color: "text-pink-500" },
        { name: "Thank You", icon: Heart, color: "text-red-500" },
    ]

    const prizeValues = ["1 IP", "2 IP", "0.5 IP", "5 IP", "NFT", "Thank You"]

    const mockServerAPI = {
        async checkCooldown(walletAddress: string): Promise<CooldownResponse> {
            console.log("[v0] Checking server cooldown for:", walletAddress)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

            // Mock server-side cooldown logic
            const serverLastSpin = localStorage.getItem(`server_cooldown_${walletAddress}`)
            const now = Date.now()
            const cooldownPeriod = 12 * 60 * 60 * 1000 // 12 hours

            if (serverLastSpin) {
                const lastSpin = Number.parseInt(serverLastSpin)
                const timeSinceLastSpin = now - lastSpin

                if (timeSinceLastSpin < cooldownPeriod) {
                    return {
                        canSpin: false,
                        lastSpinTime: lastSpin,
                        nextAllowedSpin: lastSpin + cooldownPeriod,
                        remainingTime: cooldownPeriod - timeSinceLastSpin,
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
            const cooldownPeriod = 12 * 60 * 60 * 1000

            // Store server-side cooldown
            localStorage.setItem(`server_cooldown_${walletAddress}`, now.toString())

            return {
                success: true,
                transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
                prize,
                nextAllowedSpin: now + cooldownPeriod,
            }
        },
    }

    const mockSmartContract = {
        async checkCooldown(walletAddress: string): Promise<boolean> {
            console.log("[v0] Checking smart contract cooldown for:", walletAddress)

            // Simulate blockchain query delay
            await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

            // Mock contract cooldown logic (could be different from server)
            const contractLastSpin = localStorage.getItem(`contract_cooldown_${walletAddress}`)
            if (contractLastSpin) {
                const lastSpin = Number.parseInt(contractLastSpin)
                const timeSinceLastSpin = Date.now() - lastSpin
                const cooldownPeriod = 12 * 60 * 60 * 1000

                return timeSinceLastSpin >= cooldownPeriod
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
                const randomPrizeIndex = Math.floor(Math.random() * prizes.length)
                const prize = prizes[randomPrizeIndex].name

                return {
                    success: true,
                    prize,
                    transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
                }
            } else {
                throw new Error("Transaction failed")
            }
        },
    }

    const connectWallet = async () => {
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
                await checkHybridCooldown(accounts[0])
            }
        } catch (error) {
            console.error("Error connecting wallet:", error)
            alert("Failed to connect wallet. Please try again.")
        }
    }

    const checkWalletConnection = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                })
                if (accounts.length > 0) {
                    setWalletConnected(true)
                    setWalletAddress(accounts[0])
                    await checkHybridCooldown(accounts[0])
                }
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error)
        }
    }

    const checkHybridCooldown = async (address: string) => {
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
    }

    const updateCooldownDisplay = (remainingTime: number) => {
        const hours = Math.floor(remainingTime / (60 * 60 * 1000))
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000))
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000)
        const cooldownPeriod = 12 * 60 * 60 * 1000
        const progress = ((cooldownPeriod - remainingTime) / cooldownPeriod) * 100

        setCooldownHours(hours)
        setCooldownMinutes(minutes)
        setCooldownSeconds(seconds)
        setCooldownProgress(progress)
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
    }

    const checkLocalCooldown = () => {
        const storedLastSpin = localStorage.getItem("lastSpinTime")
        if (storedLastSpin) {
            const lastSpin = Number.parseInt(storedLastSpin)
            const now = Date.now()
            const cooldownPeriod = 12 * 60 * 60 * 1000
            const timeSinceLastSpin = now - lastSpin

            if (timeSinceLastSpin < cooldownPeriod) {
                setCanSpin(false)
                setLastSpinTime(lastSpin)
                updateCooldownDisplay(cooldownPeriod - timeSinceLastSpin)
            } else {
                setCanSpin(true)
                setLastSpinTime(null)
                setCooldownHours(0)
                setCooldownMinutes(0)
                setCooldownSeconds(0)
                setCooldownProgress(0)
            }
        }
    }

    useEffect(() => {
        checkWalletConnection()
    }, [])

    useEffect(() => {
        if (walletAddress && !canSpin) {
            const interval = setInterval(() => {
                checkHybridCooldown(walletAddress)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [walletAddress, canSpin])

    useEffect(() => {
        const interval = setInterval(() => {
            setTickerOffset((prev) => (prev + 1) % 100)
        }, 50)
        return () => clearInterval(interval)
    }, [])

    const handleSpinWheel = async () => {
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
        } catch (error) {
            console.error("[v0] Hybrid spin failed:", error)
            setIsSpinning(false)
            setIsTransactionPending(false)
            setServerSyncStatus("error")
            setContractValidation("invalid")
            alert(`Spin failed: ${error.message}`)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
            <Dialog open={showWinModal} onOpenChange={setShowWinModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold text-primary flex items-center justify-center gap-2">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            Congratulations!
                            <Trophy className="h-6 w-6 text-yellow-500" />
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg">You've won an amazing prize!</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4 py-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                            {selectedPrize && (
                                <>
                                    {prizes.find((p) => p.name === selectedPrize)?.icon && (
                                        <div className="text-white">
                                            {React.createElement(prizes.find((p) => p.name === selectedPrize)!.icon, {
                                                className: "h-10 w-10",
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-primary">{selectedPrize}</h3>
                            <p className="text-lg font-semibold text-accent">{selectedPrizeValue}</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Come back in 12 hours to spin again!</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="fixed top-0 left-0 right-0 z-40 bg-primary text-primary-foreground py-2 overflow-hidden shadow-lg">
                <div
                    className="flex whitespace-nowrap animate-scroll"
                    style={{
                        animation: "scroll-left 30s linear infinite",
                    }}
                >
                    {[...Array(2)].map((_, duplicateIndex) => (
                        <div key={duplicateIndex} className="flex">
                            {recentWinners.map((winner, index) => (
                                <div key={`${winner.id}-${duplicateIndex}`} className="flex items-center mx-8">
                                    <Trophy className="h-4 w-4 mr-2 text-yellow-300" />
                                    <span className="font-semibold">
                                        🎉 {winner.name} just won {winner.prize} ({winner.value})!
                                    </span>
                                    {index < recentWinners.length - 1 && <span className="mx-4 text-primary-foreground/60">•</span>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-12">
                {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-50">
                        <div className="absolute inset-0">
                            {[...Array(150)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`absolute w-3 h-3 rounded-full animate-bounce ${i % 6 === 0
                                        ? "bg-yellow-400"
                                        : i % 6 === 1
                                            ? "bg-green-400"
                                            : i % 6 === 2
                                                ? "bg-blue-400"
                                                : i % 6 === 3
                                                    ? "bg-purple-400"
                                                    : i % 6 === 4
                                                        ? "bg-pink-400"
                                                        : "bg-red-400"
                                        }`}
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${0.8 + Math.random() * 0.4}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Sparkles className="h-8 w-8 text-accent animate-pulse" />
                            <h1 className="text-4xl md:text-6xl font-bold text-primary">Playground Raffle Game</h1>
                            <Sparkles className="h-8 w-8 text-accent animate-pulse" />
                        </div>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Spin the wheel of fortune and win amazing prizes! Entry cost: 0.1 IP per spin.
                        </p>

                        <div className="mt-6">
                            {!walletConnected ? (
                                <Button onClick={connectWallet} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                    <Wallet className="h-4 w-4 mr-2" />
                                    Connect Wallet to Play
                                </Button>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Database
                                                className={`h-3 w-3 ${serverSyncStatus === "synced"
                                                    ? "text-green-500"
                                                    : serverSyncStatus === "syncing"
                                                        ? "text-yellow-500"
                                                        : "text-red-500"
                                                    }`}
                                            />
                                            <span className="text-muted-foreground">Server: {serverSyncStatus}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Shield
                                                className={`h-3 w-3 ${contractValidation === "valid"
                                                    ? "text-green-500"
                                                    : contractValidation === "pending"
                                                        ? "text-yellow-500"
                                                        : "text-red-500"
                                                    }`}
                                            />
                                            <span className="text-muted-foreground">Contract: {contractValidation}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Card className="border-2 border-accent/30 shadow-lg">
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
                                        <Gift className="h-6 w-6" />
                                        Prize Wheel
                                    </CardTitle>
                                    <CardDescription>
                                        {!walletConnected
                                            ? "Connect your wallet to start spinning!"
                                            : canSpin
                                                ? "Click the button to spin and win! (0.1 IP entry fee)"
                                                : `Next spin available in: ${timeRemaining}`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center space-y-6">
                                    {!canSpin && walletConnected && (
                                        <div className="w-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-2 mb-3">
                                                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                                    <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">
                                                        Hybrid Cooldown Active
                                                    </h3>
                                                </div>

                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3">
                                                    <div className="text-2xl font-mono font-bold text-orange-600 dark:text-orange-400 mb-2">
                                                        {String(cooldownHours).padStart(2, "0")}:{String(cooldownMinutes).padStart(2, "0")}:
                                                        {String(cooldownSeconds).padStart(2, "0")}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Time until next spin</div>
                                                </div>

                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                                                    <div
                                                        className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${cooldownProgress}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">{cooldownProgress.toFixed(1)}% complete</div>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    Validated by both server database and smart contract
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <div
                                            className="w-80 h-80 rounded-full border-8 border-primary/20 relative overflow-hidden transition-transform duration-4000 ease-out shadow-2xl"
                                            style={{
                                                transform: `rotate(${spinnerRotation}deg)`,
                                            }}
                                        >
                                            {prizes.map((prize, index) => {
                                                const segmentAngle = 360 / prizes.length // 60 degrees each
                                                const gapAngle = 3
                                                const actualSegmentAngle = segmentAngle - gapAngle
                                                const startAngle = index * segmentAngle + gapAngle / 2

                                                const colors = [
                                                    "bg-gradient-to-br from-yellow-400 to-yellow-600",
                                                    "bg-gradient-to-br from-green-400 to-green-600",
                                                    "bg-gradient-to-br from-blue-400 to-blue-600",
                                                    "bg-gradient-to-br from-purple-400 to-purple-600",
                                                    "bg-gradient-to-br from-pink-400 to-pink-600",
                                                    "bg-gradient-to-br from-red-400 to-red-600",
                                                ]

                                                return (
                                                    <div
                                                        key={`${prize.name}-${index}`}
                                                        className={`absolute inset-0 ${colors[index]} border-2 border-white/30`}
                                                        style={{
                                                            clipPath: `polygon(50% 50%, ${50 + 45 * Math.cos((startAngle * Math.PI) / 180)}% ${50 + 45 * Math.sin((startAngle * Math.PI) / 180)
                                                                }%, ${50 + 45 * Math.cos(((startAngle + actualSegmentAngle) * Math.PI) / 180)}% ${50 + 45 * Math.sin(((startAngle + actualSegmentAngle) * Math.PI) / 180)
                                                                }%)`,
                                                        }}
                                                    >
                                                        <div
                                                            className="absolute flex flex-col items-center justify-center text-white"
                                                            style={{
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: `translate(-50%, -50%) rotate(${startAngle + actualSegmentAngle / 2}deg) translateY(-80px)`,
                                                                transformOrigin: "center",
                                                            }}
                                                        >
                                                            <prize.icon className="h-6 w-6 mb-1 drop-shadow-lg" />
                                                            <span className="text-xs font-bold drop-shadow-lg">{prize.name}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3">
                                            <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-primary shadow-lg"></div>
                                        </div>

                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <Button
                                                onClick={handleSpinWheel}
                                                disabled={!walletConnected || !canSpin || isSpinning}
                                                className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl border-4 border-white text-sm font-bold"
                                            >
                                                {isTransactionPending ? (
                                                    <div className="flex flex-col items-center text-xs">
                                                        <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mb-1" />
                                                        <span>TX...</span>
                                                    </div>
                                                ) : isSpinning ? (
                                                    <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                ) : !walletConnected ? (
                                                    <div className="flex flex-col items-center text-xs">
                                                        <Wallet className="h-4 w-4 mb-1" />
                                                        <span>WALLET</span>
                                                    </div>
                                                ) : canSpin ? (
                                                    <div className="flex flex-col items-center">
                                                        <Sparkles className="h-5 w-5 mb-1" />
                                                        <span>SPIN</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-xs">
                                                        <Clock className="h-4 w-4 mb-1" />
                                                        <span className="text-[10px] leading-tight">
                                                            {cooldownHours > 0 ? `${cooldownHours}h` : `${cooldownMinutes}m`}
                                                        </span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-muted p-4 rounded-lg w-full">
                                        <h4 className="font-semibold text-primary mb-3 flex items-center gap-2 justify-center">
                                            <Trophy className="h-4 w-4" />
                                            Available Prizes
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {prizes.map((prize, index) => (
                                                <div
                                                    key={prize.name}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${index === 0
                                                        ? "bg-yellow-100 dark:bg-yellow-900/20"
                                                        : index === 1
                                                            ? "bg-green-100 dark:bg-green-900/20"
                                                            : index === 2
                                                                ? "bg-blue-100 dark:bg-blue-900/20"
                                                                : index === 3
                                                                    ? "bg-purple-100 dark:bg-purple-900/20"
                                                                    : index === 4
                                                                        ? "bg-pink-100 dark:bg-pink-900/20"
                                                                        : "bg-red-100 dark:bg-red-900/20"
                                                        }`}
                                                >
                                                    <prize.icon className={`h-4 w-4 ${prize.color}`} />
                                                    <span>{prize.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 text-center text-sm text-muted-foreground">
                                            Entry Fee: <span className="font-semibold text-accent">0.1 IP</span>
                                            <br />
                                            <span className="text-xs">Secured by hybrid server + blockchain validation</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card className="border-2 border-primary/20 h-fit">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-primary">
                                        <Trophy className="h-5 w-5" />
                                        Recent Winners
                                    </CardTitle>
                                    <CardDescription>See who's been lucky lately! Your prize could be next on this list.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentWinners.map((winner, index) => {
                                            const getPrizeIcon = (prizeName: string) => {
                                                if (prizeName.includes("1 IP")) return <Coins className="h-5 w-5 text-yellow-500" />
                                                if (prizeName.includes("2 IP")) return <Coins className="h-5 w-5 text-green-500" />
                                                if (prizeName.includes("0.5 IP")) return <Coins className="h-5 w-5 text-blue-500" />
                                                if (prizeName.includes("5 IP")) return <Coins className="h-5 w-5 text-purple-500" />
                                                if (prizeName.includes("NFT")) return <ImageIcon className="h-5 w-5 text-pink-500" />
                                                if (prizeName.includes("Thank You")) return <Heart className="h-5 w-5 text-red-500" />
                                                return <Gift className="h-5 w-5 text-primary" />
                                            }

                                            return (
                                                <div
                                                    key={winner.id}
                                                    className={`p-4 rounded-lg border transition-all duration-300 ${index === 0 && winner.date === "Just now"
                                                        ? "bg-accent/10 border-accent animate-pulse shadow-lg"
                                                        : "bg-card border-border hover:border-primary/30 hover:shadow-md"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0">
                                                                {index === 0 && winner.date === "Just now" ? (
                                                                    <div className="relative">
                                                                        <Star className="h-6 w-6 text-yellow-400 fill-current animate-pulse" />
                                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping"></div>
                                                                    </div>
                                                                ) : (
                                                                    getPrizeIcon(winner.prize)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-card-foreground">{winner.name}</p>
                                                                <p className="text-sm text-muted-foreground">Won: {winner.prize}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge
                                                                variant={index === 0 && winner.date === "Just now" ? "default" : "secondary"}
                                                                className="mb-1"
                                                            >
                                                                {winner.value}
                                                            </Badge>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {winner.date}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll-left 30s linear infinite;
        }
      `}</style>
        </div>
    )
}
