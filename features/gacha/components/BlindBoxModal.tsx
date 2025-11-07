"use client"
import { cn } from "@/lib/utils"
import { GachaItem } from "@/types/gacha"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share, ExternalLink, Box } from "lucide-react"
import { shareToTwitter } from "@/utils/twitter-share"
import { useNotifications } from "@/contexts/notification-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { UnrevealedBoxView } from "./UnrevealedBoxView"
import { RevealedItemView } from "./RevealedItemView"

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

    // Reset revealing state when item is revealed
    useEffect(() => {
        if (isRevealed) {
            setIsRevealing(false);
        }
    }, [isRevealed]);

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
            addNotification({
                type: "error",
                title: "Reveal Failed",
                message: error instanceof Error ? error.message : "Failed to reveal box",
                icon: "❌",
                duration: 5000,
            });
        } finally {
            setIsRevealing(false);
        }
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
                            aria-label="View transaction on StoryScan"
                        >
                            {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                        </button>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            ✓ Verified on-chain
                        </p>
                    </div>
                )}

                {/* State-specific content */}
                {isRevealed ? (
                    <RevealedItemView item={item} onClose={handleClose} />
                ) : (
                    <UnrevealedBoxView
                        item={item}
                        onReveal={handleReveal}
                        isRevealing={isRevealing}
                        unrevealedBoxes={unrevealedBoxes}
                    />
                )}

                <div className="space-y-4 mt-4">

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