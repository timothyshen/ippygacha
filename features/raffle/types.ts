export interface Winner {
  id: number
  name: string
  prize: string
  date: string
  value: string
}

export interface Web3Window extends Window {
  ethereum?: any
}

export interface CooldownResponse {
  canSpin: boolean
  lastSpinTime: number | null
  nextAllowedSpin: number | null
  remainingTime: number
}

export interface SpinResponse {
  success: boolean
  transactionHash: string
  prize: string
  nextAllowedSpin: number
}

export interface Prize {
  name: string
  icon: any // Lucide icon component
  color: string
}

export interface RaffleState {
  isSpinning: boolean
  showConfetti: boolean
  spinnerRotation: number
  selectedPrize: string | null
  selectedPrizeValue: string | null
  showWinModal: boolean
  tickerOffset: number
  lastSpinTime: number | null
  canSpin: boolean
  timeRemaining: string
  walletConnected: boolean
  walletAddress: string
  isTransactionPending: boolean
  cooldownHours: number
  cooldownMinutes: number
  cooldownSeconds: number
  cooldownProgress: number
  serverSyncStatus: "synced" | "syncing" | "error"
  contractValidation: "pending" | "valid" | "invalid"
  recentWinners: Winner[]
}

export interface MockServerAPI {
  checkCooldown(walletAddress: string): Promise<CooldownResponse>
  recordSpin(walletAddress: string, prize: string): Promise<SpinResponse>
}

export interface MockSmartContract {
  checkCooldown(walletAddress: string): Promise<boolean>
  spin(walletAddress: string): Promise<{ success: boolean; prize: string; transactionHash: string }>
}