import { useMemo } from "react";
import { useInventory } from "./useInventory";
import {
  GachaItemWithCount,
  CollectionStats,
  COLLECTION_TOTALS,
} from "@/features/inventory/components/inventory";
import { useBlindBox } from "../useBlindBox";

export const useInventoryLogic = () => {
  const {
    inventory,
    unrevealedItems,
    refreshInventory,
    isLoading,
    error,
    stats,
    contractInfo,
  } = useInventory();

  const { openBoxes } = useBlindBox();

  // Create a proper grouping that treats each version as a separate item
  const getUniqueItems = useMemo((): GachaItemWithCount[] => {
    const itemMap = new Map<string, GachaItemWithCount>();

    inventory.forEach((item) => {
      // Create a unique key using name and version for proper grouping
      const key = `${item.name}-${item.version}`;

      if (itemMap?.has(key)) {
        itemMap.get(key)!.count += 1;
      } else {
        itemMap.set(key, { ...item, count: 1 });
      }
    });

    return Array.from(itemMap.values());
  }, [inventory]);

  // Use stats from the updated useInventory hook when available
  const totalItems = stats?.totalNFTs || inventory.length;
  const uniqueItems = getUniqueItems.length;
  const hiddenCount =
    stats?.hiddenNFTs ||
    getUniqueItems.filter((item) => item.version === "hidden").length;
  const unrevealedBoxes = stats?.unrevealedBoxes || unrevealedItems.length;

  const collectionStats: CollectionStats = useMemo(
    () => ({
      ippy: getUniqueItems.filter((item) => item.collection === "ippy").length,
    }),
    [getUniqueItems]
  );

  const collectionCompletionPercentage: CollectionStats = useMemo(
    () => ({
      ippy: Math.round((collectionStats.ippy / COLLECTION_TOTALS.ippy) * 100),
    }),
    [collectionStats]
  );

  // Get items for a specific collection
  const getCollectionItems = (collection: string): GachaItemWithCount[] => {
    return getUniqueItems.filter((item) => item.collection === collection);
  };

  // Get NFT type breakdown from contract stats
  const getNFTTypeBreakdown = () => {
    if (stats?.nftTypeCounts) {
      return Object.entries(stats.nftTypeCounts).map(([typeName, count]) => ({
        typeName,
        count,
      }));
    }
    return [];
  };

  // Reveal function using useBlindBox hook
  const revealItemFromInventory = async (index: number) => {
    if (index >= 0 && index < unrevealedItems.length) {
      try {
        const tx = await openBoxes(1);
        // Refresh inventory to get latest data from contract after successful transaction
        await refreshInventory();
        return tx;
      } catch (error) {
        console.error("Error opening box:", error);
        throw error; // Re-throw so the UI can handle it
      }
    } else {
      throw new Error("Invalid box index");
    }
  };

  // Filter and sort function
  const getFilteredItems = (
    searchTerm: string,
    selectedCollection: string,
    selectedVersion: string,
    sortBy: "name" | "collection" | "count" | "recent"
  ): GachaItemWithCount[] => {
    return getUniqueItems
      .filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCollection =
          selectedCollection === "all" ||
          item.collection === selectedCollection;
        const matchesVersion =
          selectedVersion === "all" || item.version === selectedVersion;
        return matchesSearch && matchesCollection && matchesVersion;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "collection":
            return a.collection.localeCompare(b.collection);
          case "count":
            return b.count - a.count;
          case "recent":
          default:
            return 0;
        }
      });
  };

  return {
    // From useInventory hook
    inventory,
    unrevealedItems,
    isLoading,
    error,
    refreshInventory,

    // Enhanced statistics using contract data
    totalItems,
    uniqueItems,
    hiddenCount,
    unrevealedBoxes,
    collectionStats,
    collectionCompletionPercentage,
    contractInfo, // Pass through contract info
    stats, // Pass through detailed stats from contract

    // Helper functions
    getUniqueItems,
    getCollectionItems,
    getFilteredItems,
    getNFTTypeBreakdown,

    // Actions
    revealItemFromInventory,
  };
};
