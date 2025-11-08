"use client"

import { useState } from "react"
import Image from "next/image"
import { List } from "lucide-react"
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

interface BuyingModalProps {
    listing: MarketplaceListing
}

export const BuyingModal = ({ listing }: BuyingModalProps) => {
    const [isHovered, setIsHovered] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const { buyItem } = useMarketplace();

    const handlePurchase = async () => {
        await buyItem(listing.nftAddress, listing.tokenId, listing.priceInETH.toString());
    };

    const handleCalculation = (price: number) => {
        const platformFeeRate = 0.005;
        const proceeds = price * (1 - platformFeeRate);
        const platformFee = price * platformFeeRate;
        return {
            proceeds,
            platformFee,
            platformFeeRate,
        }
    }
    const traits = [
        { trait_type: "Background", value: "Light Blue", rarity: "15%" },
        { trait_type: "Body", value: "Chubby", rarity: "8%" },
        { trait_type: "Expression", value: "Peaceful", rarity: "12%" },
        { trait_type: "Type", value: "Standard", rarity: "45%" },
    ]

    // Use listing data instead of hardcoded values
    const nft = listing.metadata || {
        name: "Unknown NFT",
        collection: "ippy",
        description: "NFT from marketplace listing",
        rarity: "STANDARD",
        owner: "0x1234...5678",
        floorPrice: "0.00",
        tokenId: parseInt(listing.tokenId),
        version: "standard" as const,
        count: 1,
        traits: [
            { trait_type: "Background", value: "Light Blue", rarity: "15%" },
            { trait_type: "Body", value: "Chubby", rarity: "8%" },
            { trait_type: "Expression", value: "Peaceful", rarity: "12%" },
            { trait_type: "Type", value: "Standard", rarity: "45%" },
        ],
    }

    return (

        <div className="max-w-md mx-auto">
            {/* {(item.metadataLoading || imageData?.loading) && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            )} */}
            <Card
                className={cn(
                    "p-0 transition-all duration-300 cursor-pointer border-2 shadow-lg hover:shadow-xl relative overflow-hidden",
                    // Use metadata-based styling if available
                    // hasRichMetadata(item) ? getItemDisplayStyle(item) : COLLECTION_COLORS.ippy,
                    // VERSION_STYLES[item.version],
                    COLLECTION_GLOW.ippy,
                    // Enhanced styling for hidden/rare items
                    // item.version === "hidden" && "ring-2 ring-purple-400/50 shadow-purple-200/50",
                    // Loading state styling
                    // (item.metadataLoading || imageData?.loading) && "opacity-75"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <CardContent className="p-0">
                    <div className="relative" onClick={() => setDetailOpen(true)} >
                        <div className="aspect-square flex items-center justify-center relative">
                            <Image
                                src="https://ipfs.io/ipfs/bafybeihi364i5re757do7h3nuctmg767kxbq6bf5uwasqz2z4wogjuxrz4"
                                alt="bippy"
                                className="w-full h-full object-contain"
                                width={128}
                                height={128}
                                loading="lazy"
                            />
                            {nft.rarity === "hidden" && (
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
                            )}
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
                                IPPY
                            </Badge>
                            <Badge
                                className={cn(
                                    "text-xs font-bold px-2 py-0.5 flex-shrink-0",
                                    // `bg-gradient-to-r ${rarityInfo.color}`,
                                    "text-white border-white/30 shadow-sm"
                                )}
                            >
                                {nft.rarity?.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                    <div className="w-full relative min-h-[40px]">
                        {isHovered ? (
                            <div className="flex w-full h-full animate-in slide-in-from-bottom-2 duration-500 ease-out">
                                {/* List Item Button */}
                                <Drawer onClose={() => setIsHovered(false)} >
                                    <DrawerTrigger asChild>
                                        <Button
                                            size="lg"
                                            className="items-center bg-blue-300 hover:bg-blue-500/80 w-full active:bg-blue-800 rounded-none border-r border-blue-500/20 transition-all duration-300 ease-out hover:scale-105 hover:z-10 shadow-lg hover:shadow-blue-500/25 transform-gpu"
                                            style={{
                                                animationDelay: '0.1s',
                                                transform: 'translateY(0)',
                                                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.1s'
                                            }}
                                        >
                                            <List className="w-4 h-4 mr-2 transition-transform duration-300 ease-out" />
                                            <span className="text-sm font-medium">Buy Item</span>
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
                                                        <Image
                                                            src="https://ipfs.io/ipfs/bafybeihi364i5re757do7h3nuctmg767kxbq6bf5uwasqz2z4wogjuxrz4"
                                                            alt="bippy"
                                                            className="rounded"
                                                            width={40}
                                                            height={40}
                                                            loading="lazy"
                                                        />
                                                        <span className="font-medium">
                                                            {nft.collection} - {nft.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right">
                                                            <div>{listing.priceInETH.toFixed(2)} ETH</div>
                                                            <div className="text-xs text-gray-400">(${(listing.priceInETH * 3).toFixed(2)})</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="bg-gray-800" />

                                            <div className="space-y-4">
                                                <div className="flex justify-between font-medium">
                                                    <span>Total</span>
                                                    <div className="text-right">
                                                        <div>{handleCalculation(listing.priceInETH).proceeds} ETH</div>
                                                        <div className="text-xs text-gray-400">(${(handleCalculation(listing.priceInETH).proceeds * 3).toFixed(2)})</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={!nft.tokenId} onClick={() => handlePurchase()}>Confirm listing</Button>
                                            </div>
                                        </div>
                                    </DrawerContent>
                                </Drawer>
                            </div>
                        ) : (
                            <div className="flex w-full min-h-[40px] items-left justify-start bg-gray-800/80 backdrop-blur-sm animate-in fade-in-0 duration-300 ease-out px-2">
                                <div className="flex flex-col items-left ml-3 py-1">
                                    <p className="text-left text-gray-200 font-extrabold text-sm">
                                        1.50 IP
                                    </p>
                                    <p className="text-left text-gray-400 font-extrabold text-xs">
                                        ($4.50)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent >
            </Card>
            {/* Details Button */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{nft.name}</DialogTitle>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-6 flex items-center justify-center">
                                <Image
                                    src="https://ipfs.io/ipfs/bafybeihi364i5re757do7h3nuctmg767kxbq6bf5uwasqz2z4wogjuxrz4"
                                    alt="bippy"
                                    width={300}
                                    height={300}
                                    className="rounded-lg object-contain"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Badge variant="secondary">{nft.collection}</Badge>
                                <Badge variant="outline">{nft.rarity}</Badge>
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
                                        <span>{nft.tokenId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Owner</span>
                                        <span className="font-mono">{listing.seller}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Floor Price</span>
                                        <span>{listing.priceInETH} ETH</span>
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
