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
};
