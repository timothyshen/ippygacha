"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    GachaItemWithCount,
    CollectionStats,
    COLLECTION_INFO,
    COLLECTION_TOTALS,
    COLLECTION_COLORS,
    VERSION_STYLES
} from "./inventory"

interface CollectionModalProps {
    selectedCollectionDetail: string | null
    showModal: boolean
    onClose: () => void
    collectionStats: CollectionStats
    collectionCompletionPercentage: CollectionStats
    getCollectionItems: (collection: string) => GachaItemWithCount[]
}

export function CollectionModal({
    selectedCollectionDetail,
    showModal,
    onClose,
    collectionStats,
    collectionCompletionPercentage,
    getCollectionItems,
}: CollectionModalProps) {
    if (!showModal || !selectedCollectionDetail) {
        return null
    }

    const collection = selectedCollectionDetail as keyof typeof COLLECTION_INFO
    const info = COLLECTION_INFO[collection]
    const completionPercentage = collectionCompletionPercentage[collection]
    const items = getCollectionItems(selectedCollectionDetail)

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card className="max-w-4xl w-full bg-white shadow-2xl">
                <div
                    className={cn(
                        "h-3",
                        COLLECTION_COLORS.ippy,
                    )}
                />

                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <span className="text-3xl">{info.icon}</span>
                            {info.name}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            ✕
                        </Button>
                    </div>
                    <p className="text-slate-600">{info.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Collection progress */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">Collection Progress</div>
                            <Badge
                                className={cn(
                                    completionPercentage === 100
                                        ? "bg-green-100 text-green-800 border-green-300"
                                        : "bg-blue-100 text-blue-800 border-blue-300",
                                )}
                            >
                                {completionPercentage}% Complete
                            </Badge>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                            <div
                                className={cn(
                                    "h-3 rounded-full",
                                    COLLECTION_COLORS.ippy
                                )}
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>

                        <div className="text-sm text-slate-600">
                            {collectionStats[collection]} of {COLLECTION_TOTALS[collection] * 2} items collected
                        </div>
                    </div>

                    {/* Collection items grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((item, index) => (
                            <Card
                                key={index}
                                className={cn(
                                    "transition-all duration-300 border-2 shadow-md",
                                    COLLECTION_COLORS.ippy,
                                    VERSION_STYLES[item.version],
                                )}
                            >
                                <CardContent className="p-4 text-center">
                                    <div className="text-4xl mb-3">{item.emoji}</div>
                                    <h4 className="font-bold mb-1">{item.name}</h4>

                                    <div className="flex justify-between items-center">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs",
                                                item.version === "hidden"
                                                    ? "border-white/50 text-white bg-white/20"
                                                    : "border-slate-300 text-slate-600",
                                            )}
                                        >
                                            {item.version.toUpperCase()}
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs",
                                                item.version === "hidden"
                                                    ? "border-white/50 text-white bg-white/20"
                                                    : "border-slate-400 text-slate-700 bg-slate-50",
                                            )}
                                        >
                                            ×{item.count}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Collection rewards */}
                    {completionPercentage === 100 && (
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Award className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-800">Collection Complete!</h4>
                                    <p className="text-sm text-green-700">
                                        You&apos;ve collected all items in this collection. Special rewards have been unlocked!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>

                <CardFooter className="flex justify-end gap-3 border-t p-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 