"use client"
import { useGachaMachine } from "@/hooks/gacha/useGachaMachine"
import { useInventory } from "@/hooks/gacha/useInventory"
import { Header } from "@/components/Header"
import { MachineBody } from "./MachineBody"
import { ControlPanel } from "./ControlPanel"
import { BlindBoxModal } from "./BlindBoxModal"
import { AnimationEffects } from "./AnimationEffects"
import { useRouter } from "next/navigation"

export const GachaMachine = () => {
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <Header name="Gacha Zone" subtitle="Premium Collection Experience" isDark={true} isMarketplace={true} />
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
    )
} 