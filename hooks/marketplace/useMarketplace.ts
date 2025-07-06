import { useNotifications } from "@/contexts/notification-context";
import { useWalletClient } from "@/lib/contract";
import { useState } from "react";
import { getContract } from "viem";

export const useMarketplace = () => {
  const { getWalletClient } = useWalletClient();
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const { addNotification } = useNotifications();

  const getMarketplaceContract = async () => {
    const walletClient = await getWalletClient();
    const contract = getContract({
      address: nftMarketplaceAddress,
      abi: nftMarketplaceABI,
      client: walletClient,
    });
  };
};