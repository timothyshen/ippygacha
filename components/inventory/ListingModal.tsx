"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, List, Loader2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GachaItemWithCount, COLLECTION_COLORS, VERSION_STYLES, COLLECTION_GLOW } from "./inventory"
import { getItemDisplayName, getRarityInfo, hasRichMetadata, getItemDisplayStyle } from "@/types/gacha"
import { metadataMapping } from "@/lib/metadataMapping"
import { cn } from "@/lib/utils"
import { useMarketplace } from "@/hooks/marketplace/useMarketplace"
import { ippyNFTAddress } from "@/lib/contract/contractAddress"


interface ImageCache {
    imageUrl: string | null;
    loading: boolean;
    error: boolean;
}

interface ListingModalProps {
    item: GachaItemWithCount
    key: number
    imageData: ImageCache
}

export const ListingModal = ({ item, key, imageData }: ListingModalProps) => {
    const [isHovered, setIsHovered] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [floorPrice, setFloorPrice] = useState(0)
    const [detailOpen, setDetailOpen] = useState(false)
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
    const { listItem } = useMarketplace();

    const handleImageError = (itemId: string) => {
        setImageErrors(prev => new Set([...prev, itemId]));
    };
    const rarityInfo = getRarityInfo(item);
    const imageUrl = metadataMapping[item.name.toLowerCase() as keyof typeof metadataMapping]

    const handleFloorPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || value === ".") {
            setFloorPrice(0);
        } else {
            setFloorPrice(Number(value));
        }
    };

    const handleList = async (tokenId: number) => {
        await listItem(ippyNFTAddress, tokenId.toString(), "2");
    };

    const handleCalculation = (floorPrice: number) => {
        const platformFeeRate = 0.005;
        const proceeds = floorPrice * (1 - platformFeeRate);
        const platformFee = floorPrice * platformFeeRate;
        return {
            proceeds,
            platformFee,
            platformFeeRate,
        }
    }

    const nft = {
        name: "THIPPY",
        collection: "IPPY",
        rarity: "STANDARD",
        image: "/images/thippy-nft.png",
        quantity: 1,
        floorPrice: "0.00",
        description:
            "A cute and chubby character from the IPPY collection. This adorable creature features a round, soft appearance with a gentle expression.",
        traits: [
            { trait_type: "Background", value: "Light Blue", rarity: "15%" },
            { trait_type: "Body", value: "Chubby", rarity: "8%" },
            { trait_type: "Expression", value: "Peaceful", rarity: "12%" },
            { trait_type: "Type", value: "Standard", rarity: "45%" },
        ],
        owner: "0x1234...5678",
        tokenId: "#1234",
    }

    return (

        <div className="max-w-md mx-auto">
            {(item.metadataLoading || imageData?.loading) && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            )}
            <Card
                className={cn(
                    "p-0 transition-all duration-300 cursor-pointer border-2 shadow-lg hover:shadow-xl relative overflow-hidden",
                    // Use metadata-based styling if available
                    hasRichMetadata(item) ? getItemDisplayStyle(item) : COLLECTION_COLORS.ippy,
                    VERSION_STYLES[item.version],
                    COLLECTION_GLOW.ippy,
                    // Enhanced styling for hidden/rare items
                    item.version === "hidden" && "ring-2 ring-purple-400/50 shadow-purple-200/50",
                    // Loading state styling
                    (item.metadataLoading || imageData?.loading) && "opacity-75"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <CardContent className="p-0">
                    <div className="relative">
                        <div className="aspect-square flex items-center justify-center relative">
                            <div className="absolute top-2 right-2">
                                <Badge className="text-sm bg-white text-black border-black">
                                    x{item.count}
                                </Badge>
                            </div>
                            <Image
                                src={imageUrl}
                                alt={getItemDisplayName(item)}
                                className="w-full h-full object-contain"
                                onError={() => handleImageError(item.id)}
                                width={128}
                                height={128}
                                loading="lazy"
                            />
                            {item.version === "hidden" && (
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
                            )}
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-blue-600">{item.name}</h3>
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
                                    `bg-gradient-to-r ${rarityInfo.color}`,
                                    "text-white border-white/30 shadow-sm"
                                )}
                            >
                                {rarityInfo.label.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                    <div className="w-full relative min-h-[40px]">
                        {isHovered ? (
                            <div className="flex w-full h-full animate-in slide-in-from-bottom-2 duration-500 ease-out">
                                {/* List Item Button */}
                                <Drawer>
                                    <DrawerTrigger asChild>
                                        <Button
                                            size="lg"
                                            className="bg-blue-300 hover:bg-blue-500/80 active:bg-blue-800 w-1/2 rounded-none border-r border-blue-500/20 transition-all duration-300 ease-out hover:scale-105 hover:z-10 shadow-lg hover:shadow-blue-500/25 transform-gpu"
                                            style={{
                                                animationDelay: '0.1s',
                                                transform: 'translateY(0)',
                                                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.1s'
                                            }}
                                        >
                                            <List className="w-4 h-4 mr-2 transition-transform duration-300 ease-out" />
                                            <span className="text-sm font-medium">List Item</span>
                                        </Button>
                                    </DrawerTrigger>
                                    <DrawerContent className="w-full bg-gray-900 text-white border-gray-800">
                                        <DrawerHeader className="border-b border-gray-800 pb-4">
                                            <DrawerTitle className="text-white text-xl">Create listing</DrawerTitle>
                                        </DrawerHeader>

                                        <div className="py-6 space-y-6 max-w-2xl mx-auto">
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">1</div>1
                                                item
                                            </div>

                                            <div className="bg-gray-800 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Image
                                                            src={imageUrl}
                                                            alt={getItemDisplayName(item)}
                                                            className="rounded"
                                                            onError={() => handleImageError(item.id)}
                                                            width={40}
                                                            height={40}
                                                            loading="lazy"
                                                        />
                                                        <span className="font-medium">
                                                            {nft.collection} - {nft.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm" disabled={true}>
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <span className="w-8 text-center">x {quantity}</span>
                                                        <Button variant="ghost" size="sm" disabled={true}>
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <Tabs defaultValue="reserve" className="w-full">
                                                <TabsContent value="reserve" className="mt-6">
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-5 gap-4 text-xs text-gray-400 uppercase tracking-wider">
                                                            <div>Floor</div>
                                                            <div>Trait Floor</div>
                                                            <div>Top Offer</div>
                                                            <div>Cost</div>
                                                            <div>Proceeds</div>
                                                        </div>

                                                        <div className="grid grid-cols-5 gap-4 items-center">
                                                            <div>—</div>
                                                            <div>—</div>
                                                            <div>—</div>
                                                            <div className="flex items-center gap-2">
                                                                <Input type="number" placeholder="0.00" className="bg-gray-800 border-gray-700" onChange={handleFloorPriceChange} />
                                                                <span className="text-sm">IP</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <div>0</div>
                                                                <div className="text-xs text-gray-400">IP</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>

                                            <Separator className="bg-gray-800" />

                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span>Total listing price</span>
                                                    <span>{floorPrice || 0} IP</span>
                                                </div>
                                                {/* 
                                                <div className="flex justify-between text-gray-400">
                                                    <span>Floor difference</span>
                                                    <span>—</span>
                                                </div> */}

                                                <div className="flex justify-between text-gray-400">
                                                    <span>Platform fees</span>
                                                    <span>{handleCalculation(floorPrice).platformFee} IP</span>
                                                </div>

                                                <Separator className="bg-gray-800" />

                                                <div className="flex justify-between font-medium">
                                                    <span>Total est. proceeds</span>
                                                    <div className="text-right">
                                                        <div>{handleCalculation(floorPrice).proceeds} IP</div>
                                                        <div className="text-xs text-gray-400">(${(handleCalculation(floorPrice).proceeds * 3).toFixed(2)})</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <Select defaultValue="30">
                                                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="7">7 days</SelectItem>
                                                        <SelectItem value="30">30 days</SelectItem>
                                                        <SelectItem value="90">90 days</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleList(item.tokenId || 0)}>Confirm listing</Button>
                                            </div>
                                        </div>
                                    </DrawerContent>
                                </Drawer>


                                {/* Details Button */}
                                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="lg"
                                            className="bg-blue-300 hover:bg-blue-500 active:bg-blue-800 w-1/2 rounded-none transition-all duration-300 ease-out hover:scale-105 shadow-lg transform-gpu"
                                            style={{
                                                animationDelay: '0.15s',
                                                transform: 'translateY(0)',
                                                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.15s'
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2 transition-transform duration-300 ease-out" />
                                            <span className="text-sm font-medium">Details</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl">{nft.name}</DialogTitle>
                                        </DialogHeader>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-6 flex items-center justify-center">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={getItemDisplayName(item)}
                                                        width={300}
                                                        height={300}
                                                        className="rounded-lg object-contain"
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <Badge variant="secondary">{item.collection}</Badge>
                                                    <Badge variant="outline">{item.rarity}</Badge>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="font-semibold mb-2">Description</h3>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold mb-3">Details</h3>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Token ID</span>
                                                            <span>{item.tokenId}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Owner</span>
                                                            <span className="font-mono">{nft.owner}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Floor Price</span>
                                                            <span>{nft.floorPrice} IP</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold mb-3">Traits</h3>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {nft.traits.map((trait, index) => (
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
                        ) : (
                            <div className="flex w-full min-h-[40px] items-center justify-center backdrop-blur-sm animate-in fade-in-0 duration-300 ease-out">
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-center text-gray-600 font-extrabold text-sm">
                                        Not Listed
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent >
            </Card >
        </div >
    )

}