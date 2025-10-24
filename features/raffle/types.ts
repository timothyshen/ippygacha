// Contract-based interfaces
export interface ContractRaffleInfo {
  active: boolean;
  totalEntries: bigint;
  totalIPTokensCollected: bigint;
  contractBalance: bigint;
  nftPoolSize: bigint;
}

export interface ContractUserStats {
  totalUserEntries: bigint;
  totalWinnings: bigint;
  distributedPrizes: bigint;
}

export interface ContractEntry {
  user: string;
  entryCount: bigint;
  ipTokensSpent: bigint;
  timestamp: bigint;
}

export interface ContractPrize {
  winner: string;
  tier: number;
  ipTokenAmount: bigint;
  nftTokenId: bigint;
  distributed: boolean;
  timestamp: bigint;
}

export interface ContractNFTPoolInfo {
  commonCount: bigint;
}

// UI/Display interfaces
export interface Winner {
  id: number;
  name: string;
  prize: string;
  date: string;
  value: string;
  transactionHash?: string;
  tier?: number;
}

export interface Prize {
  id: number;
  name: string;
  icon: any; // Lucide icon component
  color: string;
  tier?: number;
  probability?: number;
}

export interface RaffleState {
  isSpinning: boolean;
  showConfetti: boolean;
  spinnerRotation: number;
  selectedPrize: string | null;
  selectedPrizeValue: string | null;
  showWinModal: boolean;
  lastSpinTime: number | null;
  canSpin: boolean;
  timeRemaining: string;
  walletConnected: boolean;
  walletAddress: string;
  isTransactionPending: boolean;
  cooldownHours: number;
  cooldownMinutes: number;
  cooldownSeconds: number;
  cooldownProgress: number;
  recentWinners: Winner[];
  // Contract data
  raffleInfo: ContractRaffleInfo | null;
  userStats: ContractUserStats | null;
  entryPrice: bigint | null;
}

// Transaction response interface
export interface RaffleTransactionResult {
  txHash: string;
  txReceipt: any;
  txLink: string;
}

// Cooldown management (now contract-based)
export interface CooldownState {
  canSpin: boolean;
  lastSpinTime: number | null;
  timeRemaining: string;
  cooldownHours: number;
  cooldownMinutes: number;
  cooldownSeconds: number;
  cooldownProgress: number;
}

export interface ContractCooldownStatus {
  canEnter: boolean;
  lastEntryTime: bigint;
  cooldownEndTime: bigint;
  timeRemaining: bigint;
}

export interface PrizeEvent {
  type: "guaranteed" | "bonus";
  tier: number;
  ipTokenAmount: bigint;
  nftTokenId: bigint;
  prizeIndex: bigint;
  transactionHash: string;
  blockNumber: bigint;
}
