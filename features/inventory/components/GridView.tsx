"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, Loader2 } from "lucide-react"
import { GachaItemWithCount } from "./inventory"

import { useState, useEffect, useRef } from "react"
import { ListingModal } from "./ListingModal"

interface GridViewProps {
    items: GachaItemWithCount[]
    inventoryLength: number
}

interface ImageCache {
    [itemId: string]: {
        imageUrl: string | null;
        loading: boolean;
        error: boolean;
    }
}

export function GridView({ items, inventoryLength }: GridViewProps) {
    const [imageCache, setImageCache] = useState<ImageCache>({});
    const [isLoading, setIsLoading] = useState(true);
    const imageCacheRef = useRef<ImageCache>({});

    const fetchIPFSJson = async (tokenURI: string) => {
        try {
            const response = await fetch(tokenURI, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://ippygacha.vercel.app/',
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const metadata = await response.json();

            return metadata.image;
        } catch (error) {
            console.error('Error fetching IPFS JSON:', error);
            return null;
        }
    };

    // Fetch images for all items when they change
    useEffect(() => {
        const fetchAllImages = async () => {
            // Reset loading state when items change
            setIsLoading(true);

            // If no items, don't show loading
            if (items.length === 0) {
                setIsLoading(false);
                return;
            }

            const promises = items.map(async (item) => {
                // Skip if already cached or no tokenURI
                if (!item.tokenURI || imageCacheRef.current[item.id]) {
                    return;
                }

                // Set loading state
                setImageCache(prev => {
                    const newCache = {
                        ...prev,
                        [item.id]: { imageUrl: null, loading: true, error: false }
                    };
                    imageCacheRef.current = newCache;
                    return newCache;
                });

                try {
                    const imageUrl = await fetchIPFSJson(item.tokenURI);

                    setImageCache(prev => {
                        const newCache = {
                            ...prev,
                            [item.id]: { imageUrl, loading: false, error: !imageUrl }
                        };
                        imageCacheRef.current = newCache;
                        return newCache;
                    });
                } catch (error) {
                    console.error(`Error fetching image for ${item.name}:`, error);
                    setImageCache(prev => {
                        const newCache = {
                            ...prev,
                            [item.id]: { imageUrl: null, loading: false, error: true }
                        };
                        imageCacheRef.current = newCache;
                        return newCache;
                    });
                }
            });

            await Promise.all(promises);
        };

        fetchAllImages();
    }, [items]);

    // Check loading status whenever imageCache changes
    useEffect(() => {
        if (items.length === 0) {
            setIsLoading(false);
            return;
        }

        const allItemsProcessed = items.every(item => {
            const cacheEntry = imageCache[item.id];
            return cacheEntry && !cacheEntry.loading;
        });

        if (allItemsProcessed) {
            setIsLoading(false);
        }
    }, [imageCache, items]);



    // Show loading state while images are being fetched
    if (isLoading) {
        return (
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <h3 className="text-xl font-semibold text-slate-700">Loading Collection</h3>
                        <p className="text-slate-500">
                            Fetching your NFT images...
                        </p>
                        <div className="w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (items.length === 0) {
        return (
            <Card className="bg-white/80 border-slate-200 shadow-lg backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                    <Package className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-slate-700 mb-3">No Items Found</h3>
                    <p className="text-slate-500 text-lg">
                        {inventoryLength === 0
                            ? "Your collection is empty. Start pulling some gacha to build your collection!"
                            : "No items match your current filters. Try adjusting your search criteria."}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {items.map((item, index) => {
                const imageData = imageCache[item.id];
                return (
                    <ListingModal item={item} imageData={imageData} key={index} />
                );
            })}
        </div>
    )
} 