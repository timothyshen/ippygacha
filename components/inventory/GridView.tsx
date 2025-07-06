"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { GachaItemWithCount, COLLECTION_COLORS, VERSION_STYLES, COLLECTION_GLOW } from "./inventory"
import {
    getItemDisplayName,
    getRarityInfo,
    getItemDisplayStyle,
    hasRichMetadata,
} from "@/types/gacha"
import { useState, useEffect } from "react"
import Image from "next/image"
import { metadataMapping } from "@/lib/metadataMapping"
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
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
    const [imageCache, setImageCache] = useState<ImageCache>({});

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
            const promises = items.map(async (item) => {
                // Skip if already cached or no tokenURI
                if (!item.tokenURI || imageCache[item.id]) {
                    return;
                }

                // Set loading state
                setImageCache(prev => ({
                    ...prev,
                    [item.id]: { imageUrl: null, loading: true, error: false }
                }));

                try {
                    const imageUrl = await fetchIPFSJson(item.tokenURI);

                    setImageCache(prev => ({
                        ...prev,
                        [item.id]: { imageUrl, loading: false, error: !imageUrl }
                    }));
                } catch (error) {
                    console.error(`Error fetching image for ${item.name}:`, error);
                    setImageCache(prev => ({
                        ...prev,
                        [item.id]: { imageUrl: null, loading: false, error: true }
                    }));
                }
            });

            await Promise.all(promises);
        };

        fetchAllImages();
    }, [items, imageCache]);



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
                console.log(item);
                const imageData = imageCache[item.id];
                return (
                    <ListingModal item={item} imageData={imageData} key={index} />
                );
            })}
        </div>
    )
} 