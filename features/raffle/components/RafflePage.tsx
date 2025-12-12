"use client"

import React from "react"
import { useRaffle } from "@/contexts/raffle-context"
import { WinModal } from "./WinModal"
import { WinnerTicker } from "./WinnerTicker"
import { Confetti } from "./Confetti"
import { RaffleHeader } from "./RaffleHeader"
import { PrizeWheelCard } from "./PrizeWheelCard"
import { RecentWinners } from "./RecentWinners"
import { Header } from "@/features/shared/components/Header"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { RaffleSectionErrorFallback } from "./RaffleErrorFallback"

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
    latestPrize,
    isTransactionPending,
    recentWinners,

    // Cooldown state
    canSpin,
    timeRemaining,
    cooldownHours,
    cooldownMinutes,
    cooldownSeconds,
    cooldownProgress,

    // Wallet state
    walletAddress,

    // Contract data
    raffleInfo,
    userStats,
    entryPrice,
    transactionHash,

    // Actions
    handleSpinWheel,
  } = useRaffle()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="max-w-7xl mx-auto">

        <WinModal
          isOpen={showWinModal}
          onClose={() => setShowWinModal(false)}
          selectedPrize={selectedPrize}
          selectedPrizeValue={selectedPrizeValue}
          cooldownHours={cooldownHours}
          cooldownMinutes={cooldownMinutes}
          cooldownSeconds={cooldownSeconds}
          userStats={userStats}
          transactionHash={transactionHash}
          raffleInfo={raffleInfo}
          latestPrize={latestPrize}
        />

        <Header name="Raffle" subtitle="Premium Collection Experience" isDark={true} />
        {recentWinners.length > 0 && (
          <WinnerTicker recentWinners={recentWinners} />
        )}
        <div className="pt-12">


          <Confetti show={showConfetti} />

          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <ErrorBoundary
              fallback={<RaffleSectionErrorFallback sectionName="raffle header" />}
            >
              <RaffleHeader
                raffleInfo={raffleInfo}
                userStats={userStats}
                entryPrice={entryPrice}
              />
            </ErrorBoundary>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ErrorBoundary
                  fallback={<RaffleSectionErrorFallback sectionName="prize wheel" />}
                >
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
                    raffleInfo={raffleInfo}
                    userStats={userStats}
                    entryPrice={entryPrice}
                    showWinModal={showWinModal}
                    onSpin={handleSpinWheel}
                  />
                </ErrorBoundary>
              </div>

              <div>
                <ErrorBoundary
                  fallback={<RaffleSectionErrorFallback sectionName="recent winners" />}
                >
                  <RecentWinners recentWinners={recentWinners} />
                </ErrorBoundary>
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
    </div>
  )
}
