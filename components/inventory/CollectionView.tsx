"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    GachaItemWithCount,
    COLLECTION_INFO,
    COLLECTION_TOTALS,
    COLLECTION_COLORS,
    VERSION_STYLES
} from "./inventory"

interface CollectionViewProps {
    collectionCompletionPercentage: CollectionStats
    getCollectionItems: (collection: string) => GachaItemWithCount[]
    onOpenCollectionDetail: (collection: string) => void
}

export function CollectionView({
    collectionCompletionPercentage,
    getCollectionItems,
    onOpenCollectionDetail
}: CollectionViewProps) {
    const openCollectionDetail = (collection: string) => {
        onOpenCollectionDetail(collection)
    }

    return (
        <div className="space-y-8">
            {/* IPPY NFT Collection Display */}
            {(() => {
                const collection = "ippy"
                const collectionItems = getCollectionItems(collection)
                const info = COLLECTION_INFO[collection]
                const completionPercentage = collectionCompletionPercentage[collection]

                return (
                    <Card
                        className="overflow-hidden border-2 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <div className="h-3 bg-blue-500" />

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <span className="text-2xl">{info.icon}</span>
                                    {info.name}
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openCollectionDetail(collection)}
                                    className="text-xs"
                                >
                                    View Collection
                                </Button>
                            </div>
                            <p className="text-sm text-slate-600">{info.description}</p>
                        </CardHeader>

                        <CardContent className="pb-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-sm font-medium">
                                    Collection Progress: {collectionItems.length} /{" "}
                                    {COLLECTION_TOTALS[collection]} items
                                </div>
                                <Badge
                                    className={cn(
                                        "text-xs",
                                        completionPercentage === 100
                                            ? "bg-green-100 text-green-800 border-green-300"
                                            : completionPercentage > 50
                                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                                : "bg-blue-100 text-blue-800 border-blue-300",
                                    )}
                                >
                                    {completionPercentage}% Complete
                                </Badge>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                                <div
                                    className="h-2.5 rounded-full bg-blue-500"
                                    style={{ width: `${completionPercentage}%` }}
                                ></div>
                            </div>

                            {/* Collection preview */}
                            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                {collectionItems.slice(0, 10).map((item, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "aspect-square rounded-lg border flex items-center justify-center text-2xl shadow-sm",
                                            COLLECTION_COLORS.ippy,
                                            VERSION_STYLES[item.version],
                                        )}
                                    >
                                        {item.emoji}
                                    </div>
                                ))}

                                {collectionItems.length > 10 && (
                                    <div className="aspect-square rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-600">
                                        +{collectionItems.length - 10} more
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        {completionPercentage === 100 && (
                            <CardFooter className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200 py-3 px-6">
                                <div className="flex items-center gap-2 text-green-800">
                                    <Award className="w-5 h-5 text-green-600" />
                                    <span className="font-medium">Collection Complete! 🎉</span>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                )
            })()}
        </div>
    )
} 