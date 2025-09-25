"use client"
import React from "react"
import { useGachaMachine } from "@/hooks/gacha/useGachaMachine"
import { useInventory } from "@/hooks/gacha/useInventory"
import { Header } from "@/features/shared/components/Header"
import { MachineBody } from "./MachineBody"
import { ControlPanel } from "./ControlPanel"
import { BlindBoxModal } from "./BlindBoxModal"
import { AnimationEffects } from "./AnimationEffects"
import { useRouter } from "next/navigation"

export const GachaMachine = React.memo(() => {
    const {
        coins,
        isSpinning,
        currentResults,
        showBlindBoxModal,
        blinkingCell,
        animationPhase,
        showResults,
        leverPulled,
        showCelebration,
        currentBlindBox,
        pullGacha,
        addCoin,
        revealBlindBox,
        closeModalAndReset,
    } = useGachaMachine()

    const { refreshInventory } = useInventory()

    const router = useRouter()


    const handlePullGacha = () => {
        pullGacha()
    }

    const handleRevealBlindBox = () => {
        revealBlindBox()
        refreshInventory()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <div className="max-w-7xl mx-auto">
                <Header name="Gacha Zone" subtitle="Premium Collection Experience" isDark={true} isMarketplace={false} />
                <MachineBody
                    isSpinning={isSpinning}
                    showBlindBoxModal={showBlindBoxModal}
                    blinkingCell={blinkingCell}
                    animationPhase={animationPhase}
                    showResults={showResults}
                    currentResults={currentResults}
                    leverPulled={leverPulled}
                    coins={coins}
                    onPullGacha={handlePullGacha}
                />
                <ControlPanel
                    coins={coins}
                    onAddCoin={addCoin}
                    onOpenInventory={() => router.push("/inventory")}
                    onOpenMarket={() => router.push("/market")}
                />
                <BlindBoxModal
                    isOpen={showBlindBoxModal}
                    onClose={closeModalAndReset}
                    item={currentBlindBox!}
                    onReveal={handleRevealBlindBox}
                    isRevealed={showResults}
                />
                <AnimationEffects
                    showCelebration={showCelebration}
                />
            </div>
        </div>
    )
})

GachaMachine.displayName = "GachaMachine" 