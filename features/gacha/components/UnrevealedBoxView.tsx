"use client"
import { cn, plural } from "@/lib/utils"
import { GachaItem } from "@/types/gacha"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Box, Sparkles } from "lucide-react"

interface UnrevealedBoxViewProps {
    item: GachaItem
    onReveal: () => void
    isRevealing: boolean
    unrevealedBoxes: number
}

export const UnrevealedBoxView = ({
    item,
    onReveal,
    isRevealing,
    unrevealedBoxes,
}: UnrevealedBoxViewProps) => {
    return (
        <>
            {/* Unrevealed Boxes Counter */}
            {unrevealedBoxes > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-center mb-4">
                    <div className="flex items-center justify-center gap-2">
                        <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                            You have {plural(unrevealedBoxes, 'unopened box')}
                        </span>
                    </div>
                </div>
            )}

            {/* Blind Box Display */}
            <div className="my-8 flex flex-col items-center justify-center">
                <div className="text-6xl md:text-7xl mb-6 animate-bounce drop-shadow-lg">📦</div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-black">
                    Mystery Premium Box
                </h2>
                <p className={cn("mb-6 text-base md:text-lg font-medium", "text-black")}>
                    What treasures await inside? Open to discover your prize!
                </p>
                <Badge
                    className={cn(
                        "text-sm md:text-base px-4 py-2 font-bold",
                        "bg-slate-100 text-slate-800 border-slate-300"
                    )}
                >
                    🎁 PREMIUM MYSTERY BOX
                </Badge>
            </div>

            {/* Reveal Button */}
            <Button
                onClick={onReveal}
                size="lg"
                disabled={isRevealing}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isRevealing ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Revealing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Open Box
                    </>
                )}
            </Button>
        </>
    )
}
