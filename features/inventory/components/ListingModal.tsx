"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Eye, List, Loader2, Minus, Plus, Heart, Check, X } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { GachaItemWithCount, COLLECTION_COLORS, VERSION_STYLES, COLLECTION_GLOW } from "@/features/inventory/types"
import { getItemDisplayName, getRarityInfo, hasRichMetadata, getItemDisplayStyle } from "@/types/gacha"
import { metadataMapping } from "@/lib/metadataMapping"
import { cn } from "@/lib/utils"
import { useMarketplace } from "@/hooks/marketplace/useMarketplace"
import { ippyNFTAddress } from "@/lib/contract/contractAddress"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatEther } from "viem"
import { getImageDisplayUrl } from "@/lib/metadata"

interface ListingModalProps {
    item: GachaItemWithCount
    batchSelection?: {
        batchMode: boolean
        toggleItemSelection: (itemId: string) => void
        isSelected: (itemId: string) => boolean
    }
    favorites?: {
        toggleFavorite: (itemId: string) => void
        isFavorite: (itemId: string) => boolean
    }
    onListSuccess?: () => void
    onCancelSuccess?: () => void
}

export const ListingModal = ({ item, batchSelection, favorites, onListSuccess, onCancelSuccess }: ListingModalProps) => {
    const { user } = usePrivy()
    const isMobile = useIsMobile()
    const [isHovered, setIsHovered] = useState(false)
    const itemId = item.id || `${item.name}-${item.tokenId}`
    const isSelected = batchSelection?.isSelected(itemId) || false
    const isFavorited = favorites?.isFavorite(itemId) || false
    const quantity = 1
    const [floorPrice, setFloorPrice] = useState(0)
    const [detailOpen, setDetailOpen] = useState(false)
    const [listDrawerOpen, setListDrawerOpen] = useState(false)
    const { listItem, cancelListing, getListing } = useMarketplace();

    // Listing state
    const [isListed, setIsListed] = useState(false)
    const [listingPrice, setListingPrice] = useState<string>("0")
    const [listingLoading, setListingLoading] = useState(false)
    const [checkingListing, setCheckingListing] = useState(true)

    const handleImageError = () => {
        // We could show a fallback image here if desired.
    };
    const rarityInfo = getRarityInfo(item);

    // Use real metadata image if available, fallback to metadataMapping
    const imageUrl = item.image
        ? getImageDisplayUrl(item.image)
        : item.metadata?.image
            ? getImageDisplayUrl(item.metadata.image)
            : metadataMapping[item.name.toLowerCase() as keyof typeof metadataMapping] || metadataMapping.ippy

    // Fetch listing status on mount and when item changes
    useEffect(() => {
        const fetchListingStatus = async () => {
            if (!item.tokenId) {
                setCheckingListing(false)
                return
            }

            try {
                setCheckingListing(true)
                const listing = await getListing(ippyNFTAddress, item.tokenId.toString())

                if (listing && typeof listing === 'object' && 'price' in listing) {
                    const price = listing.price as bigint
                    if (price > BigInt(0)) {
                        setIsListed(true)
                        setListingPrice(formatEther(price))
                    } else {
                        setIsListed(false)
                        setListingPrice("0")
                    }
                } else {
                    setIsListed(false)
                    setListingPrice("0")
                }
            } catch (error) {
                console.error("Error fetching listing status:", error)
                setIsListed(false)
                setListingPrice("0")
            } finally {
                setCheckingListing(false)
            }
        }

        fetchListingStatus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.tokenId])

    const handleFloorPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || value === ".") {
            setFloorPrice(0);
        } else {
            setFloorPrice(Number(value));
        }
    };

    const handleList = async (tokenId: number, price: number) => {
        try {
            setListingLoading(true)
            await listItem(ippyNFTAddress, tokenId.toString(), price.toString());

            // Close drawer
            setListDrawerOpen(false)

            // Refetch listing status
            const listing = await getListing(ippyNFTAddress, tokenId.toString())
            if (listing && typeof listing === 'object' && 'price' in listing) {
                const priceValue = listing.price as bigint
                if (priceValue > BigInt(0)) {
                    setIsListed(true)
                    setListingPrice(formatEther(priceValue))
                }
            }

            // Notify parent to refresh
            if (onListSuccess) {
                onListSuccess()
            }
        } catch (error) {
            console.error("Error listing item:", error)
        } finally {
            setListingLoading(false)
        }
    };

    const handleCancelListing = async () => {
        if (!item.tokenId) return

        try {
            setListingLoading(true)
            await cancelListing(ippyNFTAddress, item.tokenId.toString())
            setIsListed(false)
            setListingPrice("0")

            // Notify parent to refresh
            if (onCancelSuccess) {
                onCancelSuccess()
            }
        } catch (error) {
            console.error("Error canceling listing:", error)
        } finally {
            setListingLoading(false)
        }
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

    // Get real data from item and user
    const ownerAddress = user?.wallet?.address || "Unknown"
    const formattedOwner = ownerAddress !== "Unknown"
        ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`
        : "Unknown"
    const itemTraits = item.metadata?.attributes || []

    // Determine glow animation based on rarity
    const getGlowAnimation = () => {
        if (item.version === "hidden") return "animate-pulse-glow-hidden";
        if (rarityInfo.label === "Rare" || rarityInfo.label === "Epic") return "animate-pulse-glow-rare";
        return "";
    };

    return (

        <div
            className="w-full group perspective-1000"
            style={{ perspective: "1000px" }}
        >
            {item.metadataLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            )}
            <Card
                className={cn(
                    "p-0 transition-all duration-500 cursor-pointer border-2 shadow-lg hover:shadow-2xl relative overflow-hidden w-full",
                    // 3D tilt effect on hover
                    "hover:-translate-y-2 hover:scale-105",
                    "transform-gpu",
                    // Use metadata-based styling if available
                    hasRichMetadata(item) ? getItemDisplayStyle(item) : COLLECTION_COLORS.ippy,
                    VERSION_STYLES[item.version],
                    COLLECTION_GLOW.ippy,
                    // Glow animations for rare items
                    getGlowAnimation(),
                    // Enhanced styling for hidden/rare items
                    item.version === "hidden" && "ring-2 ring-purple-400/50 shadow-purple-200/50",
                    // Loading state styling
                    item.metadataLoading && "opacity-75"
                )}
                onMouseEnter={() => !listingLoading && setIsHovered(true)}
                onMouseLeave={() => !listingLoading && setIsHovered(false)}
            >
                {/* Loading overlay on card */}
                {listingLoading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                            <p className="text-white text-sm font-medium">
                                {isListed ? "Canceling listing..." : "Creating listing..."}
                            </p>
                        </div>
                    </div>
                )}
                <CardContent className="p-0">
                    <div className="relative p-2 sm:p-2.5 md:p-3">
                        <div className="aspect-square flex items-center justify-center relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl overflow-hidden">
                            {/* Shimmer effect for rare items */}
                            {(item.version === "hidden" || rarityInfo.label === "Rare" || rarityInfo.label === "Epic") && (
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer -z-0"
                                    style={{
                                        backgroundSize: "200% 100%",
                                    }}
                                />
                            )}

                            {/* Top right badges and controls */}
                            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 flex gap-1.5">
                                {/* Batch selection checkbox */}
                                {batchSelection?.batchMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            batchSelection.toggleItemSelection(itemId)
                                        }}
                                        className={cn(
                                            "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200",
                                            isSelected
                                                ? "bg-blue-600 border-blue-600"
                                                : "bg-white/95 border-slate-300 hover:border-blue-400"
                                        )}
                                    >
                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                    </button>
                                )}

                                {/* Listed badge */}
                                {isListed && (
                                    <Badge className="text-xs sm:text-sm bg-green-500 text-white border-green-600 px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-sm">
                                        Listed
                                    </Badge>
                                )}

                                {/* Count badge */}
                                <Badge className="text-xs sm:text-sm bg-white/95 text-black border-black px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-sm">
                                    x{item.count}
                                </Badge>
                            </div>

                            {/* Top left - Favorite button (always visible) */}
                            {favorites && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        favorites.toggleFavorite(itemId)
                                    }}
                                    className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                                >
                                    <Heart
                                        className={cn(
                                            "w-4 h-4 transition-colors",
                                            isFavorited ? "fill-red-500 text-red-500" : "text-slate-400"
                                        )}
                                    />
                                </button>
                            )}
                            <Image
                                src={imageUrl}
                                alt={getItemDisplayName(item)}
                                className={cn(
                                    "w-full h-full object-contain p-2 sm:p-3 md:p-4 transition-transform duration-300",
                                    // Floating animation on hover
                                    "group-hover:animate-float"
                                )}
                                onError={handleImageError}
                                width={128}
                                height={128}
                                loading="lazy"
                            />
                            {item.version === "hidden" && (
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
                            )}

                            {/* Quick info overlay on hover (desktop only) */}
                            {!isMobile && isHovered && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                                    <div className="text-white space-y-1">
                                        <div className="text-xs font-semibold opacity-90">Collection</div>
                                        <div className="text-sm font-bold">{item.collection}</div>
                                        <div className="flex gap-2 mt-2">
                                            <div className="flex-1">
                                                <div className="text-xs opacity-75">Rarity</div>
                                                <div className="text-xs font-bold">{rarityInfo.label}</div>
                                            </div>
                                            {item.tokenId && (
                                                <div className="flex-1">
                                                    <div className="text-xs opacity-75">Token ID</div>
                                                    <div className="text-xs font-bold">#{item.tokenId}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-3 pb-3 pt-1 sm:px-4 sm:pb-4 sm:pt-2 md:px-4 md:pb-4 space-y-2 sm:space-y-2.5 md:space-y-3">
                        <div className="text-center">
                            <h3 className="font-bold text-sm sm:text-base md:text-lg text-blue-600 line-clamp-1">{item.name}</h3>
                        </div>
                        <div className="flex justify-center gap-1.5 sm:gap-2">
                            <Badge
                                variant="secondary"
                                className="text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-800 border-blue-300 flex-shrink-0 px-1.5 py-0.5 sm:px-2"
                            >
                                IPPY
                            </Badge>
                            <Badge
                                className={cn(
                                    "text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 flex-shrink-0",
                                    `bg-gradient-to-r ${rarityInfo.color}`,
                                    "text-white border-white/30 shadow-sm"
                                )}
                            >
                                {rarityInfo.label.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                    <div className="w-full relative min-h-[40px] sm:min-h-[44px] px-2 sm:px-2.5 md:px-3 pb-2 sm:pb-2.5 md:pb-3">
                        {checkingListing ? (
                            <div className="flex w-full min-h-[40px] sm:min-h-[44px] items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            </div>
                        ) : isListed ? (
                            /* Listed state - show price and cancel button */
                            (isMobile || isHovered) ? (
                                <div className="flex w-full h-full gap-1.5 sm:gap-2 flex-col animate-in slide-in-from-bottom-2 duration-500 ease-out">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500">Listed Price</div>
                                        <div className="text-sm sm:text-base font-bold text-green-600">{parseFloat(listingPrice).toFixed(4)} IP</div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleCancelListing}
                                        disabled={listingLoading}
                                        className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                                    >
                                        {listingLoading ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 animate-spin" />
                                                Canceling...
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                                Cancel Listing
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex w-full min-h-[40px] sm:min-h-[44px] items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500">Listed</div>
                                        <div className="text-sm font-bold text-green-600">{parseFloat(listingPrice).toFixed(4)} IP</div>
                                    </div>
                                </div>
                            )
                        ) : (
                            /* Not listed state - show list and details buttons */
                            (isMobile || isHovered) ? (
                                <div className="flex w-full h-full gap-1.5 sm:gap-2 animate-in slide-in-from-bottom-2 duration-500 ease-out ">
                                    {/* List Item Button */}
                                    <Drawer open={listDrawerOpen} onOpenChange={setListDrawerOpen}>
                                        <DrawerTrigger asChild>
                                            <Button
                                                size="sm"
                                                className="bg-blue-300 hover:bg-blue-500/80 active:bg-blue-800 flex-1 rounded-lg transition-all duration-300 ease-out hover:scale-105 hover:z-10 shadow-md hover:shadow-lg hover:shadow-blue-500/25 transform-gpu h-9 sm:h-10 text-xs sm:text-sm"
                                                style={{
                                                    animationDelay: '0.1s',
                                                    transform: 'translateY(0)',
                                                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.1s'
                                                }}
                                            >
                                                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5 transition-transform duration-300 ease-out" />
                                                <span className="font-medium hidden xs:inline">List</span>
                                                <span className="font-medium hidden sm:inline ml-0.5"> Item</span>
                                            </Button>
                                        </DrawerTrigger>
                                        <DrawerContent className="w-full bg-gray-900 text-white border-gray-800">
                                            <DrawerHeader className="border-b border-gray-800 pb-4">
                                                <DrawerTitle className="text-white text-xl">Create listing</DrawerTitle>
                                            </DrawerHeader>

                                            <div className="p-6 sm:p-8 md:p-10 space-y-6 max-w-2xl mx-auto">
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
                                                                onError={handleImageError}
                                                                width={40}
                                                                height={40}
                                                                loading="lazy"
                                                            />
                                                            <span className="font-medium">
                                                                {item.collection} - {item.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/* <Button variant="ghost" size="sm" disabled={true}>
                                                                <Minus className="w-4 h-4" />
                                                            </Button> */}
                                                            <span className="w-8 text-center">x {quantity}</span>
                                                            {/* <Button variant="ghost" size="sm" disabled={true}>
                                                                <Plus className="w-4 h-4" />
                                                            </Button> */}
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
                                                    <Button
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                        onClick={() => handleList(item.tokenId || 0, floorPrice)}
                                                        disabled={listingLoading || floorPrice <= 0}
                                                    >
                                                        {listingLoading ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Listing...
                                                            </>
                                                        ) : (
                                                            'Confirm listing'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DrawerContent>
                                    </Drawer>


                                    {/* Details Button */}
                                    {isMobile ? (
                                        <Drawer open={detailOpen} onOpenChange={setDetailOpen}>
                                            <DrawerTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-300 hover:bg-blue-500 active:bg-blue-800 flex-1 rounded-lg transition-all duration-300 ease-out hover:scale-105 shadow-md hover:shadow-lg transform-gpu h-9 sm:h-10 text-xs sm:text-sm"
                                                    style={{
                                                        animationDelay: '0.15s',
                                                        transform: 'translateY(0)',
                                                        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.15s'
                                                    }}
                                                >
                                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5 transition-transform duration-300 ease-out" />
                                                    <span className="font-medium hidden xs:inline">Details</span>
                                                </Button>
                                            </DrawerTrigger>
                                            <DrawerContent className="max-h-[90vh]">
                                                <DrawerHeader className="border-b pb-4">
                                                    <DrawerTitle className="text-xl">{item.name}</DrawerTitle>
                                                </DrawerHeader>
                                                <div className="overflow-y-auto p-4 space-y-6">
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
                                                                <span className="font-mono">{formattedOwner}</span>
                                                            </div>
                                                            {isListed && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Listed Price</span>
                                                                    <span>{parseFloat(listingPrice).toFixed(4)} IP</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {itemTraits.length > 0 && (
                                                        <div>
                                                            <h3 className="font-semibold mb-3">Traits</h3>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {itemTraits.map((trait: any, index: number) => (
                                                                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                                                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                                                                            {trait.trait_type}
                                                                        </div>
                                                                        <div className="font-medium">{trait.value}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </DrawerContent>
                                        </Drawer>
                                    ) : (
                                        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-300 hover:bg-blue-500 active:bg-blue-800 flex-1 rounded-lg transition-all duration-300 ease-out hover:scale-105 shadow-md hover:shadow-lg transform-gpu h-9 sm:h-10 text-xs sm:text-sm"
                                                    style={{
                                                        animationDelay: '0.15s',
                                                        transform: 'translateY(0)',
                                                        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.15s'
                                                    }}
                                                >
                                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5 transition-transform duration-300 ease-out" />
                                                    <span className="font-medium hidden xs:inline">Details</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl">{item.name}</DialogTitle>
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
                                                                    <span className="font-mono">{formattedOwner}</span>
                                                                </div>
                                                                {isListed && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Listed Price</span>
                                                                        <span>{parseFloat(listingPrice).toFixed(4)} IP</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {itemTraits.length > 0 && (
                                                            <div>
                                                                <h3 className="font-semibold mb-3">Traits</h3>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {itemTraits.map((trait: any, index: number) => (
                                                                        <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                                                                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                                                                                {trait.trait_type}
                                                                            </div>
                                                                            <div className="font-medium">{trait.value}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                </div>
                            ) : (
                                <div className="flex w-full min-h-[40px] sm:min-h-[44px] items-center justify-center backdrop-blur-sm animate-in fade-in-0 duration-300 ease-out">
                                    <p className="text-center text-gray-600 font-extrabold text-xs sm:text-sm">
                                        Not Listed
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </CardContent >
            </Card >
        </div >
    )

}
