import { useNotifications } from "@/contexts/notification-context";
import {
  nftMarketplaceAddress,
  readClient,
  useWalletClient,
  NFTMarketplaceABI,
} from "@/lib/contract";
import { useState } from "react";
import { parseEther } from "viem";

export const useMarketplace = () => {
  const { getWalletClient } = useWalletClient();
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const { addNotification } = useNotifications();

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

      const { request } = await readClient.simulateContract({
        address: nftMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "listItem",
        args: [nftAddress, tokenId, price],
        value: parseEther(price),
        account,
      });

      const txHash = await walletClient.writeContract(request);

      const tx = await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      addNotification({
        title: "Item listed successfully!",
        message: `You have listed item ${tokenId} of ${nftAddress} for ${price} ETH!`,
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

  const buyItem = async (nftAddress: string, tokenId: string) => {
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
  };
};
