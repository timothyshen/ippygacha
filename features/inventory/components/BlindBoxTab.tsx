"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { GachaItem, isBlindBoxItem, getItemDisplayImage, getItemDisplayName } from "@/types/gacha"
import { getImageDisplayUrl } from "@/lib/metadata"
import { useState } from "react"
import Image from "next/image"

interface BlindBoxTabProps {
    unrevealedItems: GachaItem[]
    onRevealItem: (index: number) => void
}

export function BlindBoxTab({ unrevealedItems, onRevealItem }: BlindBoxTabProps) {
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    const handleImageError = (itemId: string) => {
        setImageErrors(prev => new Set([...prev, itemId]));
    };

    const handleRevealItem = (index: number) => {
        onRevealItem(index)
    }

    if (unrevealedItems.length === 0) {
        return (
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                    <Package className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-slate-700 mb-3">No Blind Boxes</h3>
                    <p className="text-slate-500 text-lg">
                        You don&apos;t have any unrevealed blind boxes. Pull some gacha to get new boxes!
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Get the first item to extract shared metadata (all blind boxes should have same metadata)
    const firstItem = unrevealedItems[0];
    const displayName = getItemDisplayName(firstItem);


    return (
        <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300 shadow-xl">
            <CardHeader>
                <CardTitle className="text-rose-800 flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    {displayName} ({unrevealedItems.length})
                </CardTitle>
                {/* Show metadata description if available */}
                {firstItem.metadata?.description && (
                    <p className="text-rose-700 text-sm mt-2">
                        {firstItem.metadata.description}
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                    {unrevealedItems.map((item, index) => {
                        const itemDisplayImage = getItemDisplayImage(item);
                        const itemSvg = isBlindBoxItem(item) ? (item as { svg?: string }).svg : null;
                        const hasImage = itemDisplayImage && !imageErrors.has(item.id);

                        return (
                            <button
                                key={index}
                                onClick={() => handleRevealItem(index)}
                                className="aspect-square bg-gradient-to-br from-rose-300 to-pink-400 rounded-xl border-2 border-rose-400 cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:from-rose-400 hover:to-pink-500 relative overflow-hidden"
                                disabled={item.metadataLoading}
                                style={{ borderColor: '#634048' }}
                            >
                                {/* Loading overlay */}
                                {item.metadataLoading && (
                                    <div className="absolute inset-0 bg-rose-400/80 flex items-center justify-center z-10">
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    </div>
                                )}

                                {/* Display actual blind box image/SVG */}
                                {hasImage ? (
                                    <Image
                                        src={getImageDisplayUrl(itemDisplayImage)}
                                        alt={getItemDisplayName(item)}
                                        fill
                                        className="object-cover rounded-lg"
                                        onError={() => handleImageError(item.id)}
                                        sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, (max-width: 1024px) 12vw, 8vw"
                                    />
                                ) : itemSvg ? (
                                    // Display SVG for blind boxes
                                    <div
                                        className="w-full h-full flex items-center justify-center p-1"
                                        dangerouslySetInnerHTML={{ __html: itemSvg }}
                                    />
                                ) : item.metadataError ? (
                                    // Error state
                                    <div className="flex flex-col items-center justify-center text-white/80">
                                        <AlertCircle className="w-6 h-6 mb-1" />
                                        <span className="text-xs">Error</span>
                                    </div>
                                ) : (
                                    // Fallback to emoji
                                    <span className="text-3xl">📦</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Show attributes if available from metadata */}
                {firstItem.metadata?.attributes && firstItem.metadata.attributes.length > 0 && (
                    <div className="bg-white/60 rounded-lg p-4 border border-rose-200">
                        <h4 className="font-semibold text-rose-800 mb-2">Box Properties</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {firstItem.metadata.attributes.slice(0, 4).map((attr, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-rose-700">{attr.trait_type}:</span>
                                    <span className="font-medium text-rose-900">{attr.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 