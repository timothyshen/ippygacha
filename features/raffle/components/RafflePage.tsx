"use client"

import React from "react"
import { useRaffleState } from "../hooks/useRaffleState"
import { WinModal } from "./WinModal"
import { WinnerTicker } from "./WinnerTicker"
import { Confetti } from "./Confetti"
import { RaffleHeader } from "./RaffleHeader"
import { PrizeWheelCard } from "./PrizeWheelCard"
import { RecentWinners } from "./RecentWinners"

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
    serverSyncStatus,
    contractValidation,

    // Wallet state
    walletConnected,
    walletAddress,
    connectWallet,

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
      />

      <WinnerTicker recentWinners={recentWinners} />

      <div className="pt-12">
        <Confetti show={showConfetti} />

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <RaffleHeader
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            serverSyncStatus={serverSyncStatus}
            contractValidation={contractValidation}
            onConnectWallet={connectWallet}
          />

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <PrizeWheelCard
                walletConnected={walletConnected}
                canSpin={canSpin}
                timeRemaining={timeRemaining}
                spinnerRotation={spinnerRotation}
                isSpinning={isSpinning}
                isTransactionPending={isTransactionPending}
                cooldownHours={cooldownHours}
                cooldownMinutes={cooldownMinutes}
                cooldownSeconds={cooldownSeconds}
                cooldownProgress={cooldownProgress}
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