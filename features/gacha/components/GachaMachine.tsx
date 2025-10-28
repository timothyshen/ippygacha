"use client"
import React, { useCallback } from "react"
import { useGachaMachine } from "@/hooks/gacha/useGachaMachine"
import { useInventory } from "@/hooks/gacha/useInventory"
import { Header } from "@/features/shared/components/Header"
import { MachineBody } from "./MachineBody"
import { ControlPanel } from "./ControlPanel"
import { BlindBoxModal } from "./BlindBoxModal"
import { useRouter } from "next/navigation"

export const GachaMachine = React.memo(() => {
    const {
        coins,
        isSpinning,
        currentResults,
        showBlindBoxModal,
        blinkingCell,
        animationPhase,
        isItemRevealed,
        showResults,
        leverPulled,
        currentBlindBox,
        pullGacha,
        revealBlindBox,
        closeModalAndReset,
    } = useGachaMachine()

    const { refreshInventory } = useInventory()

    const router = useRouter()

    const handleRevealBlindBox = useCallback(() => {
        revealBlindBox()

        
        refreshInventory()
    }, [refreshInventory, revealBlindBox])

    const handleOpenInventory = useCallback(() => {
        router.push("/inventory")
    }, [router])

    const handleOpenMarket = useCallback(() => {
        router.push("/market")
    }, [router])

    const blindBoxItem = currentBlindBox

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto">
                <Header name="Gacha Zone" subtitle="Premium Collection Experience" isDark={true} />
                <MachineBody
                    isSpinning={isSpinning}
                    showBlindBoxModal={showBlindBoxModal}
                    blinkingCell={blinkingCell}
                    animationPhase={animationPhase}
                    showResults={showResults}
                    currentResults={currentResults}
                    leverPulled={leverPulled}
                    coins={coins}
                    onPullGacha={pullGacha}
                />
                <ControlPanel
                    coins={coins}
                    onOpenInventory={handleOpenInventory}
                    onOpenMarket={handleOpenMarket}
                />
                {blindBoxItem && (
                    <BlindBoxModal
                        isOpen={showBlindBoxModal}
                        onClose={closeModalAndReset}
                        item={blindBoxItem}
                        onReveal={handleRevealBlindBox}
                        isRevealed={isItemRevealed}
                    />
                )}
            </div>
        </div>
    )
})

GachaMachine.displayName = "GachaMachine" 
