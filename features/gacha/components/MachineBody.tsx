import { Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { GachaItem } from "@/types/gacha"
import { VERSION_STYLES } from "@/types/gacha"
import dynamic from "next/dynamic"

const MachineIdleEffects = dynamic(
    () => import("@/features/shared/components/enhanced-animations").then(mod => ({ default: mod.MachineIdleEffects })),
    {
        loading: () => <div />,
        ssr: false
    }
)

interface MachineBodyProps {
    isSpinning: boolean
    showBlindBoxModal: boolean
    blinkingCell: number | null
    animationPhase: "fast" | "slowing" | "landing" | "none"
    showResults: boolean
    currentResults: GachaItem[]
    leverPulled: boolean
    coins: number
    onPullGacha: () => void
}

export const MachineBody = ({
    isSpinning,
    showBlindBoxModal,
    blinkingCell,
    animationPhase,
    showResults,
    currentResults,
    leverPulled,
    coins,
    onPullGacha,
}: MachineBodyProps) => {
    return (
        <div className="relative flex flex-col items-center pt-20 sm:pt-24 md:pt-28">
            {/* Machine Stand/Base */}
            <div
                className={cn(
                    "w-[300px] h-[90px] md:w-[360px] md:h-[110px] rounded-b-3xl border-4 shadow-2xl transition-all duration-700",
                    "bg-gradient-to-b from-pink-200 via-purple-200 to-blue-200",
                    "border-white/80",
                    "border-t-0 relative overflow-hidden",
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <div className="w-full h-full flex items-center justify-center relative z-10">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="relative">
                            <div
                                className={cn(
                                    "text-xl md:text-2xl font-bold tracking-wider transition-all duration-700 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
                                )}
                            >
                                IPPY
                            </div>
                            <div className="absolute -inset-1 blur-sm bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 animate-pulse rounded-lg"></div>
                        </div>
                        <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />
                        <div className="relative">
                            <div
                                className={cn(
                                    "text-xl md:text-2xl font-bold tracking-wider transition-all duration-700 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500"
                                )}
                            >
                                IPPY
                            </div>
                            <div className="absolute -inset-1 blur-sm bg-gradient-to-r from-pink-400 to-purple-400 opacity-30 animate-pulse rounded-lg"></div>
                        </div>
                        <Sparkles className="w-5 h-5 text-yellow-400 animate-spin-slow" />
                        <div className="relative">
                            <div
                                className={cn(
                                    "text-xl md:text-2xl font-bold tracking-wider transition-all duration-700 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
                                )}
                            >
                                IPPY
                            </div>
                            <div className="absolute -inset-1 blur-sm bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 animate-pulse rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Machine Body */}
            <div
                className={cn(
                    "relative w-[420px] h-[600px] md:w-[420px] md:h-[600px] transition-all duration-700"
                )}
            >
                {/* Machine Body Background (lowest layer) */}
                <div className="absolute inset-0 bg-[url('/imageAssets/GachaMachine.png')] bg-cover bg-center z-10"></div>

                {/* Machine Body Overlay (highest layer) */}
                <div className="absolute inset-0 bg-[url('/imageAssets/GachaMachine.png')] bg-cover bg-center z-30 pointer-events-none"></div>
                {/* Display Window */}
                <div className="relative w-full h-[77%] p-4 flex flex-col z-20">
                    <div
                        className="w-full h-full mt-6 px-4 rounded-xl bg-[url('/imageAssets/GachaBackground.png')] bg-cover bg-center overflow-hidden z-20"
                    >

                        {/* Active Display Area */}
                        <div className="relative z-25 grid grid-cols-3 gap-3 h-full p-2">
                            {isSpinning && !showBlindBoxModal
                                ? Array.from({ length: 9 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "rounded-2xl flex items-center justify-center transition-all duration-200 border-2 shadow-lg",
                                            blinkingCell === i
                                                ? cn(
                                                    "bg-gradient-to-br from-amber-300 to-amber-500 border-amber-200",
                                                    "ring-4 ring-amber-400/60 shadow-xl scale-105",
                                                    animationPhase === "landing" && "scale-110",
                                                    animationPhase === "landing" && i === 4 && "scale-125",
                                                )
                                                : "bg-white/10 border-white/20 backdrop-blur-sm",
                                        )}
                                    >
                                        {blinkingCell === i ? (
                                            <Sparkles
                                                className={cn(
                                                    "w-5 h-5 md:w-6 md:h-6 text-amber-800 drop-shadow-lg",
                                                    animationPhase === "fast" && "animate-ping",
                                                    animationPhase === "landing" && i === 4 && "animate-pulse",
                                                )}
                                            />
                                        ) : (
                                            <div className="text-sm md:text-base text-white/40 font-medium">?</div>
                                        )}
                                    </div>
                                ))
                                : showResults && currentResults.length > 0
                                    ? currentResults.slice(0, 9).map((item, i) => {
                                        const isNewest = i === 0 && !showBlindBoxModal
                                        return (
                                            <div
                                                key={`${item.id}-${item.name}-${i}`}
                                                className={cn(
                                                    "flex flex-col items-center justify-center text-center transition-all duration-500 shadow-lg",
                                                    VERSION_STYLES[item.version],
                                                    isNewest
                                                        ? "ring-4 ring-amber-400/60 scale-105 shadow-xl z-10 border-amber-300"
                                                        : "opacity-60 scale-90",
                                                    item.version === "hidden" && isNewest && "shadow-purple-500/30",
                                                )}
                                            >
                                                {isNewest && (
                                                    <div className="text-[8px] md:text-[9px] font-bold leading-none mt-1 opacity-80">
                                                        {item.collection.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                    : Array.from({ length: 9 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-2xl flex items-center justify-center bg-white/10 border-2 border-white/20 backdrop-blur-sm shadow-lg"
                                        >
                                        </div>
                                    ))}
                        </div>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="relative w-full h-[23%] px-4 flex flex-col justify-between">

                    {/* Turn Knob and Dispensing Area */}
                    <div className="flex justify-between items-end">
                        {/* Dispensing Chute */}
                        <div className="flex flex-col items-center z-20">
                            <div
                                className="w-[210px] h-[75px] ml-9 my-2 flex items-center justify-center bg-[url('/imageAssets/ItemPlacement.png')] bg-auto z-40 object-contain"
                            >
                                {showBlindBoxModal && (
                                    <div className="text-3xl md:text-4xl animate-bounce drop-shadow-lg">📦</div>
                                )}
                            </div>
                        </div>

                        {/* Turn Knob */}
                        <div className="flex flex-col items-center z-50">
                            <button
                                onClick={onPullGacha}
                                disabled={coins < 1 || isSpinning || showBlindBoxModal}
                                className={cn(
                                    "relative mr-1 rounded-full transition-all duration-500 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group z-50",
                                    leverPulled ? "bg-[url('/imageAssets/GachaAfter.png')] bg-cover bg-center" : "bg-[url('/imageAssets/GachaBefore.png')] bg-cover bg-center",
                                    "shadow-lg hover:shadow-xl",
                                    "border-1 border-[#703B48]",
                                    !(coins < 1 || isSpinning || showBlindBoxModal) &&
                                    "hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/25 active:scale-95",
                                )}
                                style={{ width: "100px", height: "100px" }}
                                aria-label="Turn Gacha Knob"
                            >
                            </button>
                        </div>
                    </div>
                </div>
                {/* Machine Idle Effects */}
                <MachineIdleEffects isActive={isSpinning || showBlindBoxModal} />
            </div>
            <p className="text-center text-sm text-black">
                &copy; {new Date().getFullYear()} IPPYGACHA. All rights reserved.
            </p>
        </div>
    )
} 