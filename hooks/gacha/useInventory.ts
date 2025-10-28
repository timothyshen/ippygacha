import { useState, useEffect, useCallback, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { GachaItem } from "@/types/gacha";
import {
  getUserNFTs,
  getUserNFTTypeCounts,
  getUserBlindBoxBalance,
  getContractInfo,
} from "../contractRead";
import { blindBoxABI, blindBoxAddress } from "@/lib/contract";
import { metadataService, NFTMetadata, BlindBoxMetadata } from "@/lib/metadata";
import { readClient } from "@/lib/contract";
import { NFT_TYPE_MAPPING, ContractInfo } from "@/types/inventory";

export const useInventory = () => {
  const { user } = usePrivy();
  const address = user?.wallet?.address as `0x${string}` | undefined;

  // State management
  const [inventory, setInventory] = useState<GachaItem[]>([]);
  const [unrevealedItems, setUnrevealedItems] = useState<GachaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [stats, setStats] = useState({
    totalNFTs: 0,
    unrevealedBoxes: 0,
    hiddenNFTs: 0,
    nftTypeCounts: {} as Record<string, number>,
  });

  // Track metadata loading state
  const [metadataLoading, setMetadataLoading] = useState(false);
  const blindBoxMetadataRef = useRef<BlindBoxMetadata | null | undefined>(undefined);
  const blindBoxMetadataPromiseRef = useRef<Promise<BlindBoxMetadata | null> | null>(null);

  // Convert contract NFT data to GachaItem format
  const mapContractNFTToGachaItem = useCallback(
    (
      tokenId: number,
      nftType: number,
      tokenURI: string,
      typeName?: string
    ): GachaItem => {
      const typeInfo =
        NFT_TYPE_MAPPING[nftType as keyof typeof NFT_TYPE_MAPPING];
      const isHidden = nftType === 0;

      return {
        id: `nft-${tokenId}`,
        name: typeInfo?.name || typeName || `IPPY #${tokenId}`,
        description: typeInfo?.description || `IPPY NFT Token #${tokenId}`,
        emoji: typeInfo?.emoji || "🎁",
        collection: "ippy" as const,
        version: isHidden ? "hidden" : "standard",
        // Enhanced fields for metadata
        tokenId,
        nftType,
        tokenURI,
        rarity: typeInfo?.rarity,
        metadataLoading: true, // Will be set to false once metadata loads
      } as GachaItem;
    },
    []
  );

  const ensureBlindBoxMetadata = useCallback(async (): Promise<BlindBoxMetadata | null> => {
    if (blindBoxMetadataRef.current !== undefined) {
      return blindBoxMetadataRef.current;
    }

    if (!blindBoxMetadataPromiseRef.current) {
      blindBoxMetadataPromiseRef.current = (async () => {
        try {
          const blindBoxURI = (await readClient.readContract({
            address: blindBoxAddress,
            abi: blindBoxABI,
            functionName: "uri",
            args: [BigInt(1)],
          })) as string;

          const metadata = await metadataService.getBlindBoxMetadata(blindBoxURI);
          blindBoxMetadataRef.current = metadata ?? null;
          return blindBoxMetadataRef.current;
        } catch (error) {
          console.error("Error fetching blind box metadata:", error);
          blindBoxMetadataRef.current = null;
          return null;
        } finally {
          blindBoxMetadataPromiseRef.current = null;
        }
      })();
    }

    return blindBoxMetadataPromiseRef.current;
  }, []);

  // Create unrevealed box items
  const createUnrevealedItems = useCallback(
    async (count: number): Promise<GachaItem[]> => {
      if (count === 0) return [];

      const blindBoxMetadata = await ensureBlindBoxMetadata();

      if (!blindBoxMetadata) {
        return Array.from({ length: count }, (_, index) => ({
          id: `unrevealed-${index}`,
          name: "IPPY Mystery Box",
          description:
            "Unopened blind box containing a mystery IPPY NFT. Open to reveal your prize!",
          emoji: "📦",
          collection: "ippy" as const,
          version: "standard" as const,
          metadataError: "Failed to load metadata",
        }));
      }

      return Array.from(
        { length: count },
        (_, index) =>
          ({
            id: `unrevealed-${index}`,
            name: blindBoxMetadata.name || "IPPY Mystery Box",
            description:
              blindBoxMetadata.description ||
              "Unopened blind box containing a mystery IPPY NFT. Open to reveal your prize!",
            emoji: "📦",
            collection: "ippy" as const,
            version: "standard" as const,
            metadata: blindBoxMetadata,
            image: blindBoxMetadata.image,
            isBlindBox: true,
            svg: blindBoxMetadata.svg,
            metadataLoading: false,
          } as GachaItem)
      );
    },
    [ensureBlindBoxMetadata]
  );

  // Fetch metadata for NFT items
  const fetchMetadataForItems = useCallback(
    async (items: GachaItem[]): Promise<GachaItem[]> => {
      if (items.length === 0) {
        setMetadataLoading(false);
        return items;
      }

      setMetadataLoading(true);

      try {
        // Prepare items for batch metadata fetching
        const nftItems = items.filter(
          (item) => item.tokenId !== undefined && item.tokenURI
        );
        const nftMetadataRequests = nftItems.map((item) => ({
          tokenId: item.tokenId!,
          tokenURI: item.tokenURI!,
          nftType: item.nftType!,
        }));

        // Batch fetch metadata
        const metadataResults = await metadataService.batchGetIPPYMetadata(
          nftMetadataRequests
        );

        // Create a map of metadata by tokenId
        const metadataMap = new Map<number, NFTMetadata | null>();
        nftItems.forEach((item, index) => {
          metadataMap.set(item.tokenId!, metadataResults[index]);
        });

        // Update items with metadata
        const updatedItems = items.map((item) => {
          if (item.tokenId !== undefined) {
            const metadata = metadataMap.get(item.tokenId);

            return {
              ...item,
              metadata: metadata || undefined, // Convert null to undefined
              metadataLoading: false,
              metadataError: metadata ? undefined : "Failed to load metadata",
              // Update display fields from metadata
              image: metadata?.image || item.image,
              attributes: metadata?.attributes,
              theme: metadata?.theme,
              background_color: metadata?.background_color,
            };
          }
          return item;
        });

        return updatedItems;
      } catch (error) {
        console.error("Error fetching metadata:", error);

        // Return items with error state
        return items.map((item) => ({
          ...item,
          metadataLoading: false,
          metadataError: "Failed to load metadata",
        }));
      } finally {
        setMetadataLoading(false);
      }
    },
    []
  );

  // Fetch all inventory data from contracts
  const fetchInventory = useCallback(async () => {
    if (!address) {
      setInventory([]);
      setUnrevealedItems([]);
      setStats({
        totalNFTs: 0,
        unrevealedBoxes: 0,
        hiddenNFTs: 0,
        nftTypeCounts: {},
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all contract data in parallel
      const [nftsResult, blindBoxBalance, nftTypeCounts, contractInfoResult] =
        await Promise.all([
          getUserNFTs(address),
          getUserBlindBoxBalance(address),
          getUserNFTTypeCounts(address),
          getContractInfo(),
        ]);

      // Process NFT data
      const [tokenIds, nftTypes, tokenURIs, typeNames] = nftsResult as [
        bigint[],
        bigint[],
        string[],
        string[]
      ];

      // Convert to GachaItems (without metadata first)
      const contractInventory: GachaItem[] = tokenIds.map((tokenId, index) =>
        mapContractNFTToGachaItem(
          Number(tokenId),
          Number(nftTypes[index]),
          tokenURIs[index],
          typeNames[index]
        )
      );

      // Process type counts
      const [types, counts, typeNamesFromCounts] = nftTypeCounts as [
        bigint[],
        bigint[],
        string[]
      ];

      const nftTypeCountsObj: Record<string, number> = {};
      let hiddenCount = 0;

      types.forEach((type, index) => {
        const typeName = typeNamesFromCounts[index];
        const count = Number(counts[index]);
        nftTypeCountsObj[typeName] = count;

        if (Number(type) === 0) {
          // Hidden NFT type
          hiddenCount = count;
        }
      });

      // Create unrevealed items with metadata
      const unrevealedCount = Number(blindBoxBalance);
      const unrevealed = await createUnrevealedItems(unrevealedCount);

      // Update contract info
      const [price, totalSupply, currentSupply, remainingBoxes] =
        contractInfoResult as [bigint, bigint, bigint, bigint];

      setContractInfo({
        boxPrice: price,
        totalSupply,
        currentSupply,
        remainingBoxes,
      });

      const inventoryWithMetadata =
        contractInventory.length > 0
          ? await fetchMetadataForItems(contractInventory)
          : contractInventory;

      setInventory(inventoryWithMetadata);
      setUnrevealedItems(unrevealed);
      setStats({
        totalNFTs: inventoryWithMetadata.length,
        unrevealedBoxes: unrevealedCount,
        hiddenNFTs: hiddenCount,
        nftTypeCounts: nftTypeCountsObj,
      });
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load inventory from contract"
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    address,
    mapContractNFTToGachaItem,
    createUnrevealedItems,
    fetchMetadataForItems,
  ]);

  // Fetch data when address changes
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Function to manually refresh metadata
  const refreshMetadata = useCallback(async () => {
    if (inventory.length > 0) {
      const updatedItems = await fetchMetadataForItems(inventory);
      setInventory(updatedItems);
    }
  }, [inventory, fetchMetadataForItems]);

  // Get blind box metadata directly
  const getBlindBoxMetadata =
    useCallback(async (): Promise<BlindBoxMetadata | null> => {
      return ensureBlindBoxMetadata();
    }, [ensureBlindBoxMetadata]);

  return {
    // Core inventory data
    inventory,
    unrevealedItems,
    isLoading,
    error,
    stats,
    contractInfo,

    // Metadata state
    metadataLoading,

    // Actions
    refreshInventory: fetchInventory,
    refreshMetadata,
    getBlindBoxMetadata,

    // Utility functions
    mapContractNFTToGachaItem,
    createUnrevealedItems,
  };
};
