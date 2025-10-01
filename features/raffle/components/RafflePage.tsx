"use client"

import React from "react"
import { useRaffleState } from "../hooks/useRaffleState"
import { WinModal } from "./WinModal"
import { WinnerTicker } from "./WinnerTicker"
import { Confetti } from "./Confetti"
import { RaffleHeader } from "./RaffleHeader"
import { PrizeWheelCard } from "./PrizeWheelCard"
import { RecentWinners } from "./RecentWinners"
import { Header } from "@/features/shared/components/Header"
export default function RafflePage() {
  const {
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
    contractSyncStatus,
    contractValidation,

    // Wallet state
    walletAddress,

    // Contract data
    raffleInfo,
    userStats,
    entryPrice,

    // Actions
    handleSpinWheel,
  } = useRaffleState()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <WinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        selectedPrize={selectedPrize}
        selectedPrizeValue={selectedPrizeValue}
        cooldownHours={cooldownHours}
        cooldownMinutes={cooldownMinutes}
        raffleInfo={raffleInfo}
        userStats={userStats}
        contractSyncStatus={contractSyncStatus}
        contractValidation={contractValidation}
      />

      <Header name="Raffle" subtitle="Premium Collection Experience" isDark={true} isMarketplace={false} />
      <WinnerTicker recentWinners={recentWinners} />

      <div className="pt-12">

        <Confetti show={showConfetti} />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <RaffleHeader
            contractSyncStatus={contractSyncStatus}
            contractValidation={contractValidation}
            raffleInfo={raffleInfo}
            userStats={userStats}
            entryPrice={entryPrice}
          />

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <PrizeWheelCard
                walletAddress={walletAddress}
                canSpin={canSpin}
                timeRemaining={timeRemaining}
                spinnerRotation={spinnerRotation}
                isSpinning={isSpinning}
                isTransactionPending={isTransactionPending}
                cooldownHours={cooldownHours}
                cooldownMinutes={cooldownMinutes}
                cooldownSeconds={cooldownSeconds}
                cooldownProgress={cooldownProgress}
                contractSyncStatus={contractSyncStatus}
                contractValidation={contractValidation}
                raffleInfo={raffleInfo}
                userStats={userStats}
                entryPrice={entryPrice}
                onSpin={handleSpinWheel}
              />
            </div>

            <div>
              <RecentWinners recentWinners={recentWinners} />
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