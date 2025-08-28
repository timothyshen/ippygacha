import { useNotifications } from "@/contexts/notification-context";
import {
  nftMarketplaceAddress,
  readClient,
  useWalletClient,
  NFTMarketplaceABI,
  ippyIPABI,
  ippyNFTAddress,
} from "@/lib/contract";
import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import { GachaItemWithCount } from "@/features/inventory/components/inventory";

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

// Mock metadata for testing - replace with actual NFT metadata fetching
const getMockMetadata = (tokenId: string): GachaItemWithCount => {
  const mockNames = [
    "IPPY",
    "BIPPY",
    "DIPPY",
    "TIPPY",
    "RIPPY",
    "SIPPY",
    "NIPPY",
  ];
  const mockName = mockNames[parseInt(tokenId) % mockNames.length] || "IPPY";

  return {
    id: tokenId,
    name: mockName,
    collection: "ippy",
    description: `A unique ${mockName} NFT from the IPPY collection`,
    emoji: "🎁",
    version: "standard",
    tokenId: parseInt(tokenId),
    count: 1,
    metadataLoading: false,
  } as GachaItemWithCount;
};

export const useMarketplace = () => {
  const { getWalletClient } = useWalletClient();
  const { addNotification } = useNotifications();

  const getAllActiveListings = async (): Promise<MarketplaceListing[]> => {
    try {
      // Get all ItemListed events
      const listedEvents = await readClient.getContractEvents({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        eventName: "ItemListed",
        fromBlock: "earliest",
        toBlock: "latest",
      });

      // Get all ItemBought events to filter out sold items
      const boughtEvents = await readClient.getContractEvents({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        eventName: "ItemBought",
        fromBlock: "earliest",
        toBlock: "latest",
      });

      // Get all ItemCanceled events to filter out cancelled items
      const canceledEvents = await readClient.getContractEvents({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        eventName: "ItemCanceled",
        fromBlock: "earliest",
        toBlock: "latest",
      });

      // Create sets of sold and cancelled items for quick lookup
      const soldItems = new Set(
        boughtEvents.map(
          (event) =>
            `${(event as any).args.nftAddress}-${(event as any).args.tokenId}`
        )
      );

      const cancelledItems = new Set(
        canceledEvents.map(
          (event) =>
            `${(event as any).args.nftAddress}-${(event as any).args.tokenId}`
        )
      );

      // Filter for active listings and get latest price for each item
      const activeListingsMap = new Map<string, MarketplaceListing>();

      for (const event of listedEvents) {
        const eventArgs = (event as any).args;
        const key = `${eventArgs.nftAddress}-${eventArgs.tokenId}`;

        // Skip if item was sold or cancelled
        if (soldItems.has(key) || cancelledItems.has(key)) {
          continue;
        }

        // Double-check by querying the contract directly
        try {
          const listing = await readClient.readContract({
            address: nftMarketplaceAddress,
            abi: NFTMarketplaceABI,
            functionName: "getListing",
            args: [eventArgs.nftAddress, eventArgs.tokenId],
          });

          // If price is 0, the listing doesn't exist (was cancelled/sold)
          if (!listing || (listing as any).price === BigInt(0)) {
            continue;
          }

          const marketplaceListing: MarketplaceListing = {
            nftAddress: eventArgs.nftAddress as string,
            tokenId: eventArgs.tokenId.toString(),
            price: (listing as any).price.toString(),
            priceInIP: parseFloat(formatEther((listing as any).price)),
            seller: (listing as any).seller as string,
            isActive: true,
            metadata: getMockMetadata(eventArgs.tokenId.toString()),
          };

          // Use the latest listing (in case of price updates)
          activeListingsMap.set(key, marketplaceListing);
        } catch (error) {
          console.log(`Failed to get listing for ${key}:`, error);
          // Skip this listing if we can't fetch it
          continue;
        }
      }

      return Array.from(activeListingsMap.values());
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
        message: `You have bought item ${tokenId} of ${nftAddress} for ${price} ETH!`,
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
        message: `You have updated listing of item ${tokenId} of ${nftAddress} to ${price} ETH!`,
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

  const getProceeds = async (nftAddress: string) => {
    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }

      const proceeds = await readClient.readContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "getProceeds",
        args: [nftAddress],
      });

      return proceeds;
    } catch (error) {
      console.error(error);
    }
  };

  return {
    listItem,
    cancelListing,
    buyItem,
    updateListing,
    getListing,
    getProceeds,
    isApprovedForMarketplace,
    getAllActiveListings,
  };
};

// Custom hook for fetching active marketplace listings
export const useActiveListings = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllActiveListings } = useMarketplace();

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

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
  };
};
