import { useNotifications } from "@/contexts/notification-context";
import {
  nftMarketplaceAddress,
  readClient,
  useWalletClient,
  NFTMarketplaceABI,
  ippyIPABI,
} from "@/lib/contract";
import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import { GachaItemWithCount } from "@/features/inventory/types";
import { marketplaceCache } from "@/lib/events/cache";
import { getCacheKey } from "@/lib/events/types";
import {
  ItemListedEvent,
  ItemBoughtEvent,
  ItemCanceledEvent,
  MarketplaceListingData,
} from "@/types/contracts";
import { metadataService } from "@/lib/metadata";

// Unified marketplace listing interface
export interface MarketplaceListing {
  nftAddress: string;
  tokenId: string;
  price: string; // in wei
  priceInIP: number; // converted to IP for display
  seller: string;
  isActive: boolean;
  metadata?: GachaItemWithCount; // NFT metadata fetched separately
}

// Extended marketplace listing with all display data
export interface EnhancedMarketplaceListing extends MarketplaceListing {
  metadata: GachaItemWithCount;
  imageUrl?: string;
}

// Utility functions for data conversion
export const convertListingToGachaItem = (
  listing: MarketplaceListing
): GachaItemWithCount | null => {
  if (!listing.metadata) return null;

  return {
    ...listing.metadata,
    // Add marketplace-specific fields
    marketPrice: listing.priceInIP,
    seller: listing.seller,
    isListed: true,
  } as GachaItemWithCount & {
    marketPrice: number;
    seller: string;
    isListed: boolean;
  };
};

// Fetch real metadata from metadata service
const getMetadata = async (
  nftAddress: string,
  tokenId: string
): Promise<GachaItemWithCount | null> => {
  try {
    const result = await metadataService.getIPPYMetadata(
      parseInt(tokenId),
      nftAddress
    );

    if (!result) {
      return null;
    }

    const { metadata, cachedUrl } = result;

    return {
      id: tokenId,
      name: metadata.name,
      collection: "ippy",
      description: metadata.description,
      emoji: "🎁",
      version: (metadata.rarity === "hidden" ? "hidden" : "standard") as
        | "standard"
        | "hidden",
      tokenId: parseInt(tokenId),
      count: 1,
      metadataLoading: false,
      image: cachedUrl,
      metadata: metadata,
      rarity: metadata.rarity,
      theme: metadata.theme,
    } as GachaItemWithCount;
  } catch (error) {
    console.error(`Error fetching metadata for token ${tokenId}:`, error);
    return null;
  }
};

export const useMarketplace = () => {
  const { getWalletClient } = useWalletClient();
  const { addNotification } = useNotifications();

  const getAllActiveListings = async (): Promise<MarketplaceListing[]> => {
    try {
      // Step 1: Load or initialize cache
      let cache = marketplaceCache.loadCache();
      if (!cache) {
        cache = marketplaceCache.initEmptyCache();
      }

      // Step 2: Get current block number
      const latestBlock = await readClient.getBlockNumber();

      // Step 3: Calculate block range to scan
      const fromBlock =
        cache.lastScannedBlock === BigInt(0)
          ? "earliest"
          : cache.lastScannedBlock + BigInt(1);

      // Step 4: Fetch only NEW events since last scan (INCREMENTAL!)
      const [rawListedEvents, rawBoughtEvents, rawCanceledEvents] =
        await Promise.all([
          readClient.getContractEvents({
            address: nftMarketplaceAddress,
            abi: NFTMarketplaceABI,
            eventName: "ItemListed",
            fromBlock,
            toBlock: latestBlock,
          }),
          readClient.getContractEvents({
            address: nftMarketplaceAddress,
            abi: NFTMarketplaceABI,
            eventName: "ItemBought",
            fromBlock,
            toBlock: latestBlock,
          }),
          readClient.getContractEvents({
            address: nftMarketplaceAddress,
            abi: NFTMarketplaceABI,
            eventName: "ItemCanceled",
            fromBlock,
            toBlock: latestBlock,
          }),
        ]);

      // Type-safe event casting
      const listedEvents = rawListedEvents as unknown as ItemListedEvent[];
      const boughtEvents = rawBoughtEvents as unknown as ItemBoughtEvent[];
      const canceledEvents =
        rawCanceledEvents as unknown as ItemCanceledEvent[];

      // Step 5: Update cache with new events

      // Process new listings
      for (const event of listedEvents) {
        const { nftAddress, tokenId, price, seller } = event.args;
        const key = getCacheKey(nftAddress, tokenId);

        // Add to active listings
        cache.activeListings.set(key, {
          nftAddress,
          tokenId: tokenId.toString(),
          price: price.toString(),
          seller,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }

      // Process new purchases
      for (const event of boughtEvents) {
        const { nftAddress, tokenId } = event.args;
        const key = getCacheKey(nftAddress, tokenId);

        // Remove from active listings
        cache.activeListings.delete(key);
      }

      // Process new cancellations
      for (const event of canceledEvents) {
        const { nftAddress, tokenId } = event.args;
        const key = getCacheKey(nftAddress, tokenId);

        // Remove from active listings
        cache.activeListings.delete(key);
      }

      // Step 6: Update cache metadata
      cache.lastScannedBlock = latestBlock;
      cache.updatedAt = Date.now();

      // Step 7: Save updated cache
      marketplaceCache.saveCache(cache);

      // Step 8: Convert cached listings to MarketplaceListing format
      const activeListings: MarketplaceListing[] = [];

      // Process all listings in parallel
      const listingPromises = Array.from(cache.activeListings.entries()).map(
        async ([key, cachedListing]) => {
          try {
            // Verify listing is still active on-chain (belt and suspenders)
            const rawListing = await readClient.readContract({
              address: nftMarketplaceAddress,
              abi: NFTMarketplaceABI,
              functionName: "getListing",
              args: [cachedListing.nftAddress, BigInt(cachedListing.tokenId)],
            });

            // Type-safe casting
            const listing = rawListing as unknown as MarketplaceListingData;

            // If price is 0, the listing doesn't exist (was cancelled/sold)
            if (!listing || listing.price === BigInt(0)) {
              // Remove from cache
              cache.activeListings.delete(key);
              return null;
            }

            // Fetch real metadata
            const metadata = await getMetadata(
              cachedListing.nftAddress,
              cachedListing.tokenId
            );

            const marketplaceListing: MarketplaceListing = {
              nftAddress: cachedListing.nftAddress,
              tokenId: cachedListing.tokenId,
              price: listing.price.toString(),
              priceInIP: parseFloat(formatEther(listing.price)),
              seller: listing.seller,
              isActive: true,
              metadata: metadata || undefined,
            };

            return marketplaceListing;
          } catch (error) {
            console.error(`Error processing listing ${key}:`, error);
            return null;
          }
        }
      );

      const results = await Promise.all(listingPromises);

      // Filter out null results
      results.forEach((listing) => {
        if (listing) {
          activeListings.push(listing);
        }
      });

      // Return active listings
      return activeListings;
    } catch (error) {
      console.error("Error fetching active listings:", error);
      addNotification({
        title: "Failed to fetch marketplace listings",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
        duration: 5000,
      });
      return [];
    }
  };

  const isApprovedForMarketplace = async (
    nftAddress: string,
    tokenId: string
  ) => {
    try {
      const approvedAddress = await readClient.readContract({
        address: nftAddress as `0x${string}`,
        abi: ippyIPABI,
        functionName: "getApproved",
        args: [BigInt(tokenId)],
      });
      return approvedAddress === nftMarketplaceAddress;
    } catch (error) {
      console.error("Error checking approval:", error);
      return false;
    }
  };

  const listItem = async (
    nftAddress: string,
    tokenId: string,
    price: string
  ) => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }

      const [account] = await walletClient.getAddresses();

      // Check if marketplace is approved for this token
      const isApproved = await isApprovedForMarketplace(nftAddress, tokenId);

      // If not approved, approve the marketplace first
      if (!isApproved) {
        addNotification({
          title: "Approval required",
          message: "Approving marketplace to transfer your NFT...",
          type: "info",
          duration: 5000,
        });

        const { request: approveRequest } = await readClient.simulateContract({
          address: nftAddress as `0x${string}`,
          abi: ippyIPABI,
          functionName: "approve",
          args: [nftMarketplaceAddress, BigInt(tokenId)],
          account,
        });

        const approveTxHash = await walletClient.writeContract(approveRequest);

        await readClient.waitForTransactionReceipt({
          hash: approveTxHash,
        });

        addNotification({
          title: "Approval successful!",
          message: "Marketplace approved. Now listing your item...",
          type: "success",
          duration: 3000,
        });
      }

      // Now list the item
      const { request } = await readClient.simulateContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "listItem",
        args: [nftAddress, BigInt(tokenId), parseEther(price)],
        account,
      });

      const txHash = await walletClient.writeContract(request);

      const tx = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      addNotification({
        title: "Item listed successfully!",
        message: `You have listed item ${tokenId} for ${price} IP!`,
        type: "success",
        action: {
          label: "View on StoryScan",
          onClick: () => {
            window.open(
              `https://aeneid.storyscan.io/tx/${tx.transactionHash}`,
              "_blank"
            );
          },
        },
        duration: 10000,
      });
    } catch (error) {
      console.error("Error listing item:", error);
      addNotification({
        title: "Failed to list item",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
        duration: 5000,
      });
    }
  };

  const cancelListing = async (nftAddress: string, tokenId: string) => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }

      const [account] = await walletClient.getAddresses();

      const { request } = await readClient.simulateContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "cancelListing",
        args: [nftAddress, tokenId],
        account,
      });

      const txHash = await walletClient.writeContract(request);

      const tx = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      addNotification({
        title: "Listing cancelled successfully!",
        message: `You have cancelled listing of item ${tokenId} of ${nftAddress}!`,
        type: "success",
        action: {
          label: "View on StoryScan",
          onClick: () => {
            window.open(
              `https://aeneid.storyscan.io/tx/${tx.transactionHash}`,
              "_blank"
            );
          },
        },
        duration: 10000,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const buyItem = async (
    nftAddress: string,
    tokenId: string,
    price: string
  ) => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }

      const [account] = await walletClient.getAddresses();

      const { request } = await readClient.simulateContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "buyItem",
        args: [nftAddress, tokenId],
        value: parseEther(price),
        account,
      });

      const txHash = await walletClient.writeContract(request);

      const tx = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      addNotification({
        title: "Item bought successfully!",
        message: `You have bought item ${tokenId} of ${nftAddress} for ${price} IP!`,
        type: "success",
        action: {
          label: "View on StoryScan",
          onClick: () => {
            window.open(
              `https://aeneid.storyscan.io/tx/${tx.transactionHash}`,
              "_blank"
            );
          },
        },
        duration: 10000,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateListing = async (
    nftAddress: string,
    tokenId: string,
    price: string
  ) => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }

      const [account] = await walletClient.getAddresses();

      const { request } = await readClient.simulateContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "updateListing",
        args: [nftAddress, tokenId, price],
        account,
      });

      const txHash = await walletClient.writeContract(request);

      const tx = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      addNotification({
        title: "Listing updated successfully!",
        message: `You have updated listing of item ${tokenId} of ${nftAddress} to ${price} IP!`,
        type: "success",
        action: {
          label: "View on StoryScan",
          onClick: () => {
            window.open(
              `https://aeneid.storyscan.io/tx/${tx.transactionHash}`,
              "_blank"
            );
          },
        },
        duration: 10000,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getListing = async (nftAddress: string, tokenId: string) => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }
      const listing = await readClient.readContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "getListing",
        args: [nftAddress, tokenId],
      });

      return listing;
    } catch (error) {
      console.error(error);
    }
  };

  const getProceeds = async (sellerAddress: string) => {
    try {
      const proceeds = await readClient.readContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "getProceeds",
        args: [sellerAddress],
      });

      return proceeds;
    } catch (error) {
      console.error(error);
      return BigInt(0);
    }
  };

  const withdrawProceeds = async () => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }

      const [account] = await walletClient.getAddresses();

      // Check proceeds first
      const proceeds = await getProceeds(account);
      if (!proceeds || proceeds <= BigInt(0)) {
        addNotification({
          title: "No proceeds to withdraw",
          message: "You don't have any proceeds to withdraw from sales.",
          type: "info",
          duration: 5000,
        });
        return;
      }

      const { request } = await readClient.simulateContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "withdrawProceeds",
        account,
      });

      const txHash = await walletClient.writeContract(request);

      const tx = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const proceedsInIP = formatEther(proceeds as bigint);
      addNotification({
        title: "Proceeds withdrawn successfully!",
        message: `You have withdrawn ${proceedsInIP} IP from your sales!`,
        type: "success",
        action: {
          label: "View on StoryScan",
          onClick: () => {
            window.open(
              `https://aeneid.storyscan.io/tx/${tx.transactionHash}`,
              "_blank"
            );
          },
        },
        duration: 10000,
      });

      return tx;
    } catch (error) {
      console.error(error);
      addNotification({
        title: "Withdrawal failed",
        message:
          error instanceof Error
            ? error.message
            : "Failed to withdraw proceeds",
        type: "error",
        duration: 5000,
      });
      throw error;
    }
  };

  // Force refresh: clear cache and fetch fresh data
  const forceRefresh = async (): Promise<MarketplaceListing[]> => {
    marketplaceCache.clearCache();
    return await getAllActiveListings();
  };

  return {
    listItem,
    cancelListing,
    buyItem,
    updateListing,
    getListing,
    getProceeds,
    withdrawProceeds,
    isApprovedForMarketplace,
    getAllActiveListings,
    forceRefresh, // Expose force refresh to UI
  };
};

// Custom hook for fetching active marketplace listings
export const useActiveListings = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllActiveListings, forceRefresh } = useMarketplace();

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeListings = await getAllActiveListings();
      setListings(activeListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeListings = await forceRefresh();
      setListings(activeListings);
    } catch (err) {
      console.error("Error force refreshing listings:", err);
      setError(
        err instanceof Error ? err.message : "Failed to refresh listings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
    forceRefresh: handleForceRefresh, // Expose force refresh
  };
};
