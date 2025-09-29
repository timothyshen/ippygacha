import {
  onchainRaffleAddress,
  onchainRaffleABI,
  readClient,
  useWalletClient,
} from "@/lib/contract";
import { useNotifications } from "@/contexts/notification-context";

export const useRaffleEntry = () => {
  const { getWalletClient } = useWalletClient();
  const { addNotification } = useNotifications();

  const enterRaffle = async () => {
    const walletClient = await getWalletClient();
    if (!walletClient) {
      throw new Error("No wallet connected");
    }
    const [account] = await walletClient.getAddresses();

    const { request } = await readClient.simulateContract({
      address: onchainRaffleAddress,
      abi: onchainRaffleABI,
      functionName: "enterRaffle",
      args: [],
      value: parseEther("0.1"),
      account,
    });

    addNotification({
      title: "Submitting transaction...",
      message: `Entering raffle...`,
      type: "info",
      duration: 5000,
    });

    const txHash = await walletClient.writeContract(request);

    addNotification({
      title: "Transaction submitted!",
      message: `Waiting for confirmation... Hash: ${txHash.slice(0, 10)}...`,
      type: "info",
      duration: 8000,
    });

    const tx = await readClient.waitForTransactionReceipt({
      hash: txHash,
    });

    const txLink = `https://aeneid.storyscan.io/tx/${txHash}`;
  };
};

export default useRaffleEntry;
