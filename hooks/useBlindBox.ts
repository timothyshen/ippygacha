import {
  blindBoxABI,
  readClient,
  useWalletClient,
  blindBoxAddress,
} from "@/lib/contract";
import { parseEther, formatEther } from "viem";
import { useNotifications } from "@/contexts/notification-context";
import { getContractInfo, getUserBlindBoxBalance } from "./contractRead";

export const useBlindBox = () => {
  const { getWalletClient } = useWalletClient();
  const { addNotification } = useNotifications();

  // Helper function to format contract info response
  const formatContractInfo = async () => {
    try {
      const result = await getContractInfo();
      const [price, maxPerTx, totalSupply, currentSupply, remainingBoxes] =
        result as [bigint, bigint, bigint, bigint, bigint];

      return {
        price: formatEther(price),
        maxPerTx: Number(maxPerTx),
        totalSupply: Number(totalSupply),
        currentSupply: Number(currentSupply),
        remainingBoxes: Number(remainingBoxes),
      };
    } catch (error) {
      console.error("Error getting contract info:", error);
      throw error;
    }
  };

  // Helper function to get user box balance
  const getUserBoxBalance = async (userAddress: string) => {
    try {
      const balance = await getUserBlindBoxBalance(
        userAddress as `0x${string}`
      );
      return Number(balance);
    } catch (error) {
      console.error("Error getting user balance:", error);
      throw error;
    }
  };

  // Check user's ETH balance
  const checkUserBalance = async (
    userAddress: string,
    requiredAmount: bigint
  ) => {
    try {
      const balance = await readClient.getBalance({
        address: userAddress as `0x${string}`,
      });

      return {
        hasEnough: balance >= requiredAmount,
        balance: formatEther(balance),
        required: formatEther(requiredAmount),
      };
    } catch (error) {
      console.error("Error checking user balance:", error);
      throw error;
    }
  };

  // purchaseBoxes(uint256 amount) payable - Buy blind boxes
  const purchaseBoxes = async (amount: number) => {
    try {
      // Step 1: Show preparing notification
      addNotification({
        title: "Purchasing boxes...",
        message: `Purchasing ${amount} box${amount > 1 ? "es" : ""}...`,
        type: "info",
        duration: 3000,
      });

      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }

      // Get the account address
      const [account] = await walletClient.getAddresses();

      // Calculate total cost
      const totalCost = parseEther("0.1") * BigInt(amount);

      // First simulate the contract call to ensure it will succeed
      const { request } = await readClient.simulateContract({
        address: blindBoxAddress,
        abi: blindBoxABI,
        functionName: "purchaseBoxes",
        value: totalCost,
        args: [BigInt(amount)],
        account,
      });

      // Step 2: Show submitting notification
      addNotification({
        title: "Submitting transaction...",
        message: `Sending purchase transaction for ${amount} box${
          amount > 1 ? "es" : ""
        }...`,
        type: "info",
        duration: 5000,
      });

      // Execute the actual transaction
      const txHash = await walletClient.writeContract(request);

      // Step 3: Show waiting for confirmation notification
      addNotification({
        title: "Transaction submitted!",
        message: `Waiting for confirmation... Hash: ${txHash.slice(0, 10)}...`,
        type: "info",
        duration: 8000,
      });

      // Step 4: Wait for transaction receipt
      await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const txLink = `https://aeneid.storyscan.io/tx/${txHash}`;

      // Step 5: Show success notification
      addNotification({
        title: "Boxes purchased successfully!",
        message: `You have purchased ${amount} box${amount > 1 ? "es" : ""}!`,
        type: "success",
        action: {
          label: "View on StoryScan",
          onClick: () => {
            window.open(txLink, "_blank");
          },
        },
        duration: 10000,
      });

      return txHash;
    } catch (error) {
      console.error("Error purchasing boxes:", error);

      // Show error notification
      addNotification({
        title: "Purchase failed",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        type: "error",
        duration: 8000,
      });

      throw error;
    }
  };

  // openBoxes(uint256 amount) - Open boxes to reveal NFTs
  const openBoxes = async (amount: number) => {
    try {
      // Step 1: Show preparing notification
      addNotification({
        title: "Preparing to open boxes...",
        message: `Setting up to open ${amount} boxes...`,
        type: "info",
        duration: 3000,
      });

      const walletClient = await getWalletClient();
      if (!walletClient) {
        throw new Error("No wallet connected");
      }

      // Get the account address
      const [account] = await walletClient.getAddresses();

      // Check if user has enough boxes
      const boxBalance = await getUserBoxBalance(account);
      if (boxBalance < amount) {
        throw new Error(
          `You only have ${boxBalance} box${
            boxBalance !== 1 ? "es" : ""
          } but trying to open ${amount}`
        );
      }

      // Step 2: Show submitting notification
      addNotification({
        title: "Submitting transaction...",
        message: `Opening ${amount} box${amount > 1 ? "es" : ""}...`,
        type: "info",
        duration: 5000,
      });

      // Execute the transaction
      const txHash = await walletClient.writeContract({
        address: blindBoxAddress,
        abi: blindBoxABI,
        functionName: "openBox",
        args: [BigInt(amount)],
        value: parseEther("0.01"),
        account,
      });

      // Step 3: Show waiting for confirmation notification
      addNotification({
        title: "Transaction submitted!",
        message: `Waiting for box${
          amount > 1 ? "es" : ""
        } to open... Hash: ${txHash.slice(0, 10)}...`,
        type: "info",
        duration: 8000,
      });

      // Step 4: Wait for transaction receipt
      await readClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const txLink = `https://aeneid.storyscan.io/tx/${txHash}`;

      // Step 5: Show success notification
      addNotification({
        title: "Boxes opened successfully!",
        message: `${amount} box${
          amount > 1 ? "es have" : " has"
        } been opened! Check your inventory for new items.`,
        type: "success",
        action: {
          label: "View on StoryScan",
          onClick: () => {
            window.open(txLink, "_blank");
          },
        },
        duration: 10000,
      });

      return txHash;
    } catch (error) {
      console.error("Error opening boxes:", error);

      // Show error notification
      addNotification({
        title: "Failed to open boxes",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        type: "error",
        duration: 8000,
      });

      throw error;
    }
  };

  return {
    purchaseBoxes,
    openBoxes,
    getContractInfo: formatContractInfo, // Use formatted version
    getUserBoxBalance,
    checkUserBalance,
  };
};
