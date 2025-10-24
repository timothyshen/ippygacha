import { Coins, ImageIcon, Trophy } from "lucide-react";
import { Prize } from "./types";

// Contract-based prize tiers (matching OnChainRaffle.sol)
export const PRIZE_TIERS = {
  GUARANTEED: 1, // Guaranteed return (100% of entry)
  BONUS: 2, // Bonus prizes (40%, 120%, 200% + potential NFT)
} as const;

// Display prizes based on contract logic
export const PRIZES: Prize[] = [
  {
    id: 1,
    name: "Return",
    icon: Coins,
    color: "text-yellow-500",
    tier: PRIZE_TIERS.GUARANTEED,
    probability: 100, // Always awarded
  },
  {
    id: 2,
    name: "40% Bonus",
    icon: Coins,
    color: "text-green-500",
    tier: PRIZE_TIERS.BONUS,
    probability: 0.7, // 0.7% chance
  },
  {
    id: 3,
    name: "100% Bonus",
    icon: Trophy,
    color: "text-pink-500",
    tier: PRIZE_TIERS.BONUS,
    probability: 0.02, // 0.02% chance
  },
  {
    id: 4,
    name: "120% Bonus",
    icon: Trophy,
    color: "text-purple-500",
    tier: PRIZE_TIERS.BONUS,
    probability: 0.18, // 0.18% chance
  },
  {
    id: 5,
    name: "200% Bonus",
    icon: Trophy,
    color: "text-pink-500",
    tier: PRIZE_TIERS.BONUS,
    probability: 0.02, // 0.02% chance
  },
  {
    id: 6,
    name: "NFT",
    icon: ImageIcon,
    color: "text-purple-500",
    tier: PRIZE_TIERS.BONUS,
    probability: 0.18, // 0.18% chance
  },
];

// Contract constants (matching OnChainRaffle.sol)
export const CONTRACT_CONSTANTS = {
  ENTRY_PRICE: "0.1", // 0.1 ETH/IP tokens
  GUARANTEED_RETURN_RATE: 1000, // 100% (1000/1000)
  RATE_DENOMINATOR: 1000,
  BONUS_EV_PPM: 5000, // 0.5% expected value
  PPM_DENOM: 1000000, // 1e6 (parts per million)
} as const;

// Local cooldown period (5 minutes for demo - contract doesn't enforce cooldown)
// Cooldown period (5 minutes - matches smart contract)
export const COOLDOWN_PERIOD = 5 * 60; // 5 minutes in seconds (matches contract)
export const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// Prize colors for UI display
export const PRIZE_COLORS = [
  "bg-gradient-to-br from-yellow-400 to-yellow-600", // Guaranteed return
  "bg-gradient-to-br from-green-400 to-green-600", // 40% bonus
  "bg-gradient-to-br from-purple-400 to-purple-600", // 120% bonus + NFT
  "bg-gradient-to-br from-pink-400 to-pink-600", // 200% bonus
  "bg-gradient-to-br from-purple-400 to-purple-600", // NFT
  "bg-gradient-to-br from-pink-400 to-pink-600", // 100% bonus
];

// Contract event names (for listening to events)
export const CONTRACT_EVENTS = {
  RAFFLE_ENTERED: "RaffleEntered",
  PRIZE_AWARDED: "PrizeAwarded",
  PRIZE_DISTRIBUTED: "PrizeDistributed",
  DRAW_REQUESTED: "DrawRequested",
} as const;
