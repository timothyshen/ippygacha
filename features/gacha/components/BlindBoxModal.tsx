"use client"
import { cn } from "@/lib/utils"
import { GachaItem } from "@/types/gacha"
import { COLLECTION_COLORS } from "@/types/gacha"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share, ExternalLink, Loader2, Box, Sparkles } from "lucide-react"
import { shareToTwitter } from "@/utils/twitter-share"
import { useNotifications } from "@/contexts/notification-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface BlindBoxModalProps {
    isOpen: boolean
    onClose: () => void
    item: GachaItem
    onReveal: () => void
    isRevealed: boolean
    unrevealedBoxes?: number
    transactionHash?: string | null
}

export const BlindBoxModal = ({
    isOpen = true,
    onClose,
    item,
    onReveal,
    isRevealed,
    unrevealedBoxes = 0,
    transactionHash,
}: BlindBoxModalProps) => {
    const { addNotification } = useNotifications();
    const router = useRouter();
    const [isRevealing, setIsRevealing] = useState(false);

    const handleShare = () => {
        if (item) {
            shareToTwitter()

            addNotification({
                type: "info",
                title: "Shared to Twitter!",
                message: "Show off your amazing pull!",
                icon: "🐦",
                duration: 3000,
            })
        }
    }

    const handleReveal = async () => {
        setIsRevealing(true);
        try {
            await onReveal();
        } catch (error) {
            console.error("Reveal error:", error);
            setIsRevealing(false);
        }
        // isRevealing will be set to false when the item is revealed via isRevealed prop
    }

    const handleClose = () => {
        onClose();
        router.push("/inventory");
    }

    const handleViewTransaction = () => {
        if (transactionHash) {
            window.open(`https://aeneid.storyscan.io/tx/${transactionHash}`, "_blank");
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg w-full shadow-2xl transition-all duration-700 border-0 items-center justify-center z-50 p-4 backdrop-blur-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Box className="h-5 w-5" />
                        {!isRevealed ? "Mystery Premium Box" : "Revealed!"}
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {!isRevealed
                        ? "What treasures await inside? Open to discover your prize!"
                        : "Congratulations on your new collectible!"}
                </DialogDescription>

                {/* Transaction Hash - Show for both states */}
                {transactionHash && (
                    <div className="bg-muted/50 p-3 rounded-lg text-center mb-2">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-semibold">Transaction Hash</span>
                        </div>
                        <button
                            onClick={handleViewTransaction}
                            className="text-xs text-primary hover:underline font-mono break-all"
                        >
                            {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                        </button>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            ✓ Verified on-chain
                        </p>
                    </div>
                )}

                {/* Unrevealed Boxes Counter */}
                {unrevealedBoxes > 0 && !isRevealed && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-center mb-4">
                        <div className="flex items-center justify-center gap-2">
                            <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                You have {unrevealedBoxes} unopened box{unrevealedBoxes !== 1 ? 'es' : ''}
                            </span>
                        </div>
                    </div>
                )}

                {!isRevealed ? (
                    // Enhanced Blind Box State
                    <div className="my-8 flex flex-col items-center justify-center">
                        <div className="text-6xl md:text-7xl mb-6 animate-bounce drop-shadow-lg">📦</div>
                        <h2
                            className="text-2xl md:text-3xl font-bold mb-3 text-black"
                        >
                            Mystery Premium Box
                        </h2>
                        <p
                            className={cn(
                                "mb-6 text-base md:text-lg font-medium",
                                "text-black"
                            )}
                        >
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
                ) : (
                    // Enhanced Revealed Item State
                    <div className="mb-8">
                        <div className="item-reveal text-center">
                            <div
                                className={cn(
                                    "mx-auto w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 p-6 md:p-8 flex flex-col items-center justify-center mb-6 transition-all duration-500 shadow-xl",
                                    COLLECTION_COLORS.ippy,
                                    item.collection === "ippy" && "legendary-glow",
                                )}
                            >
                                <div className="text-4xl md:text-5xl mb-2 drop-shadow-lg">
                                    <img src={item.image} alt={item.name} width={100} height={100} />
                                </div>
                                <div className="text-xs md:text-sm font-bold text-center leading-tight">
                                    {item.name}
                                </div>
                            </div>
                            <h2
                                className={cn(
                                    "text-2xl md:text-3xl font-bold mb-3",
                                    "text-black",
                                )}
                            >
                                {item.name}
                            </h2>
                            <p
                                className={cn(
                                    "mb-4 text-base md:text-lg font-medium",
                                    "text-black"
                                )}
                            >
                                {item.description}
                            </p>
                            <div className="flex justify-center gap-3 mb-4">
                                <Badge variant="secondary" className="text-sm font-bold px-3 py-1">
                                    {item.collection.toUpperCase()}
                                </Badge>
                                <Badge
                                    variant={item.version === "hidden" ? "default" : "outline"}
                                    className={`text-sm font-bold px-3 py-1 ${item.version === "hidden" ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white" : ""}`}
                                >
                                    {item.version.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {item.attributes?.map((attribute) => (
                                    <Badge variant="outline" className="text-sm font-bold px-3 py-1">
                                        {attribute.trait_type}: {attribute.value}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {!isRevealed ? (
                        <Button
                            onClick={handleReveal}
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
                    ) : (
                        <Button
                            onClick={handleClose}
                            size="lg"
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            ✓ View in Inventory
                        </Button>
                    )}

                    {/* Enhanced Share Button */}
                    <Button
                        onClick={handleShare}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Share className="w-5 h-5" />
                        Share Your Prize
                    </Button>

                    {/* Enhanced Skip Button */}
                    <Button
                        onClick={onClose}
                        variant="outline"
                        size="lg"
                        className={cn(
                            "w-full text-base font-medium transition-all duration-300",
                            "border-slate-300 hover:bg-slate-100 text-slate-700 backdrop-blur-sm"
                        )}
                    >
                        {isRevealed ? "Skip Sharing" : "🎰 Continue Gacha"}
                    </Button>
                </div>
            </DialogContent >
        </Dialog >
    )
} 