// Re-export from the main types file
import type { GachaItem } from "@/types/gacha";
export type { GachaItem } from "@/types/gacha";

export interface GachaItemWithCount extends GachaItem {
  count: number;
}

export type ViewMode = "grid" | "list" | "collection";
export type SortBy = "name" | "collection" | "count" | "recent";

// Enhanced version styles with better gradients
export const VERSION_STYLES = {
  standard: "",
  hidden:
    "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-white/30 shadow-xl",
};

export const COLLECTION_COLORS = {
  ippy: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
};

export const COLLECTION_GLOW = {
  ippy: "hover:shadow-blue-200/50",
};

// Collection display names and icons
export const COLLECTION_INFO = {
  ippy: {
    name: "IPPY NFT Collection",
    icon: "🎁",
    description: "Exclusive IPPY NFT collectibles",
  },
};

export const COLLECTION_TOTALS = {
  ippy: 7, // 7 types: 1 hidden (type 0) + 6 standard (types 1-6)
};

export interface CollectionStats {
  ippy: number;
}
