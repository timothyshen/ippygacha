"use client"

import { useState } from "react"
import Image from "next/image"
import { List, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { COLLECTION_GLOW } from "@/features/inventory/types"
import { cn } from "@/lib/utils"
import { useMarketplace, MarketplaceListing } from "@/hooks/marketplace/useMarketplace"
import { metadataMapping } from "@/lib/metadataMapping"
import { getImageDisplayUrl } from "@/lib/metadata"

interface MarketplaceBuyingModalProps {
    listing: MarketplaceListing
}

const traits = [
    { trait_type: "Background", value: "Light Blue", rarity: "15%" },
    { trait_type: "Body", value: "Chubby", rarity: "8%" },
    { trait_type: "Expression", value: "Peaceful", rarity: "12%" },
    { trait_type: "Type", value: "Standard", rarity: "45%" },
]

export const MarketplaceBuyingModal = ({ listing }: MarketplaceBuyingModalProps) => {
    const [isHovered, setIsHovered] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { buyItem } = useMarketplace()

    const handlePurchase = async () => {
        try {
            setLoading(true)
            await buyItem(listing.nftAddress, listing.tokenId, listing.priceInIP.toString())
        } catch (error) {
            console.error("Purchase failed:", error)
        } finally {
            setLoading(false)
        }
    }

    const getImage = (name: string) => {
        const key = name.toLowerCase() as keyof typeof metadataMapping
        return metadataMapping[key] || metadataMapping.ippy
    }

    const nft = listing.metadata || {
        name: "Unknown NFT",
        collection: "ippy",
        description: "NFT from marketplace listing",
        emoji: "🎁",
        version: "standard" as const,
    }

    // Use real metadata image if available, fallback to metadataMapping
    const imageUrl = listing.metadata?.image
        ? getImageDisplayUrl(listing.metadata.image)
        : nft.name
            ? getImage(nft.name.toLowerCase())
            : metadataMapping.ippy

    return (
        <div className="max-w-md mx-auto">
            <Card
                className={cn(
                    "p-0 transition-all duration-300 cursor-pointer border-2 shadow-lg hover:shadow-xl relative overflow-hidden",
                    COLLECTION_GLOW.ippy,
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <CardContent className="p-0">
                    <div className="relative" onClick={() => setDetailOpen(true)}>
                        <div className="aspect-square flex items-center justify-center relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                            <Image src={imageUrl} alt={nft.name} width={128} height={128} className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-blue-600">{nft.name}</h3>
                        </div>
                        <div className="flex justify-center gap-2">
                            <Badge
                                variant="secondary"
                                className="text-xs font-bold bg-blue-100 text-blue-800 border-blue-300 flex-shrink-0"
                            >
                                {nft.collection.toUpperCase()}
                            </Badge>
                            <Badge
                                className="text-xs font-bold px-2 py-0.5 flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-white/30 shadow-sm"
                            >
                                {nft.version.toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    <div className="w-full relative min-h-[40px]">
                        {isHovered ? (
                            <div className="flex w-full h-full animate-in slide-in-from-bottom-2 duration-500 ease-out">
                                <Drawer onClose={() => setIsHovered(false)}>
                                    <DrawerTrigger asChild>
                                        <Button
                                            size="lg"
                                            className="items-center bg-blue-300 hover:bg-blue-500/80 w-full active:bg-blue-800 rounded-none transition-all duration-300 ease-out hover:scale-105 hover:z-10 shadow-lg hover:shadow-blue-500/25 transform-gpu"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <List className="w-4 h-4 mr-2" />
                                            )}
                                            <span className="text-sm font-medium">
                                                {loading ? "Processing..." : "Buy Item"}
                                            </span>
                                        </Button>
                                    </DrawerTrigger>
                                    <DrawerContent className="w-full bg-gray-900 text-white border-gray-800">
                                        <DrawerHeader className="border-b border-gray-800 pb-4">
                                            <DrawerTitle className="text-white text-xl">Purchase Item</DrawerTitle>
                                        </DrawerHeader>

                                        <div className="py-6 space-y-6 max-w-4xl mx-auto w-[500px]">
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">1</div>
                                                item
                                            </div>

                                            <div className="bg-gray-800 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center text-lg">
                                                            <Image src={imageUrl} alt={nft.name} width={40} height={40} className="object-contain" />
                                                        </div>
                                                        <span className="font-medium">
                                                            {nft.collection.toUpperCase()} - {nft.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right">
                                                            <div>{listing.priceInIP.toFixed(2)} IP</div>
                                                            <div className="text-xs text-gray-400">(${(listing.priceInIP * 3).toFixed(2)})</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="bg-gray-800" />

                                            <div className="space-y-4">
                                                <div className="flex justify-between font-medium">
                                                    <span>Total</span>
                                                    <div className="text-right">
                                                        <div>{listing.priceInIP.toFixed(2)} IP</div>
                                                        <div className="text-xs text-gray-400">(${(listing.priceInIP * 3).toFixed(2)})</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    <p>Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</p>
                                                    <p>Token ID: #{listing.tokenId}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <Button
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                    onClick={handlePurchase}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Processing..." : "Confirm Purchase"}
                                                </Button>
                                            </div>
                                        </div>
                                    </DrawerContent>
                                </Drawer>
                            </div>
                        ) : (
                            <div className="flex w-full min-h-[40px] items-left justify-start bg-gray-800/80 backdrop-blur-sm animate-in fade-in-0 duration-300 ease-out px-2">
                                <div className="flex flex-col items-left ml-3 py-1">
                                    <p className="text-left text-gray-200 font-extrabold text-sm">
                                        {listing.priceInIP.toFixed(2)} IP
                                    </p>
                                    <p className="text-left text-gray-400 font-extrabold text-xs">
                                        (${(listing.priceInIP * 3).toFixed(2)})
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{nft.name}</DialogTitle>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center p-2">
                                <Image src={imageUrl} alt={nft.name} width={300} height={300} className="object-contain" />
                            </div>

                            <div className="flex gap-2">
                                <Badge variant="secondary">{nft.collection.toUpperCase()}</Badge>
                                <Badge variant="outline">{nft.version.toUpperCase()}</Badge>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{nft.description}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Details</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Token ID</span>
                                        <span>#{listing.tokenId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Seller</span>
                                        <span className="font-mono">{listing.seller.slice(0, 8)}...{listing.seller.slice(-6)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price</span>
                                        <span>{listing.priceInIP.toFixed(2)} IP</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Contract</span>
                                        <span className="font-mono">{listing.nftAddress.slice(0, 8)}...{listing.nftAddress.slice(-6)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Traits</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {traits.map((trait, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                                                {trait.trait_type}
                                            </div>
                                            <div className="font-medium">{trait.value}</div>
                                            <div className="text-xs text-blue-600">{trait.rarity}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 