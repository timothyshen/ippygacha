// Complete contract type definitions for type-safe event handling

import { Address, Log } from 'viem';

// ==========================================
// Base Event Interface
// ==========================================

export interface BaseContractEvent {
  blockNumber: bigint;
  transactionHash: string;
  logIndex: number;
}

// ==========================================
// Marketplace Events
// ==========================================

export interface ItemListedEventArgs {
  nftAddress: Address;
  tokenId: bigint;
  price: bigint;
  seller: Address;
}

export interface ItemListedEvent extends BaseContractEvent {
  eventName: 'ItemListed';
  args: ItemListedEventArgs;
}

export interface ItemBoughtEventArgs {
  nftAddress: Address;
  tokenId: bigint;
  price: bigint;
  buyer: Address;
  seller: Address;
}

export interface ItemBoughtEvent extends BaseContractEvent {
  eventName: 'ItemBought';
  args: ItemBoughtEventArgs;
}

export interface ItemCanceledEventArgs {
  nftAddress: Address;
  tokenId: bigint;
  seller: Address;
}

export interface ItemCanceledEvent extends BaseContractEvent {
  eventName: 'ItemCanceled';
  args: ItemCanceledEventArgs;
}

export type MarketplaceEvent = ItemListedEvent | ItemBoughtEvent | ItemCanceledEvent;

// ==========================================
// Marketplace Contract Read Returns
// ==========================================

export interface MarketplaceListingData {
  price: bigint;
  seller: Address;
}

// ==========================================
// BlindBox Events
// ==========================================

export interface BoxPurchasedEventArgs {
  user: Address;
  amount: bigint;
  totalPaid: bigint;
}

export interface BoxPurchasedEvent extends BaseContractEvent {
  eventName: 'BoxPurchased';
  args: BoxPurchasedEventArgs;
}

export interface BoxOpenRequestedEventArgs {
  user: Address;
  amount: bigint;
  sequenceNumber: bigint;
}

export interface BoxOpenRequestedEvent extends BaseContractEvent {
  eventName: 'BoxOpenRequested';
  args: BoxOpenRequestedEventArgs;
}

export interface BoxOpenedEventArgs {
  user: Address;
  nftIds: bigint[];
  nftTypes: bigint[];
}

export interface BoxOpenedEvent extends BaseContractEvent {
  eventName: 'BoxOpened';
  args: BoxOpenedEventArgs;
}

export type BlindBoxEvent = BoxPurchasedEvent | BoxOpenRequestedEvent | BoxOpenedEvent;

// ==========================================
// BlindBox Contract Read Returns
// ==========================================

export interface PendingBoxOpenData {
  user: Address;
  amount: bigint;
  processed: boolean;
}

// ==========================================
// Raffle Events
// ==========================================

export interface RaffleEnteredEventArgs {
  user: Address;
  raffleId: bigint;
  entryFee: bigint;
  sequenceNumber: bigint;
}

export interface RaffleEnteredEvent extends BaseContractEvent {
  eventName: 'RaffleEntered';
  args: RaffleEnteredEventArgs;
}

export interface PrizeWonEventArgs {
  user: Address;
  raffleId: bigint;
  prizeAmount: bigint;
  tierIndex: bigint;
  wonNFT: boolean;
}

export interface PrizeWonEvent extends BaseContractEvent {
  eventName: 'PrizeWon';
  args: PrizeWonEventArgs;
}

export interface RaffleFinalizedEventArgs {
  user: Address;
  raffleId: bigint;
  totalPayout: bigint;
  wonNFT: boolean;
}

export interface RaffleFinalizedEvent extends BaseContractEvent {
  eventName: 'RaffleFinalized';
  args: RaffleFinalizedEventArgs;
}

export interface PrizeDistributedEventArgs {
  winner: Address;
  ipTokenAmount: bigint;
  nftTokenId: bigint;
  prizeIndex: bigint;
}

export interface PrizeDistributedEvent extends BaseContractEvent {
  eventName: 'PrizeDistributed';
  args: PrizeDistributedEventArgs;
}

export interface PrizeAwardedEventArgs {
  winner: Address;
  tier: bigint;
  ipTokenAmount: bigint;
  nftTokenId: bigint;
  prizeIndex: bigint;
}

export interface PrizeAwardedEvent extends BaseContractEvent {
  eventName: 'PrizeAwarded';
  args: PrizeAwardedEventArgs;
}

export type RaffleEvent =
  | RaffleEnteredEvent
  | PrizeWonEvent
  | RaffleFinalizedEvent
  | PrizeDistributedEvent
  | PrizeAwardedEvent;

// ==========================================
// Raffle Contract Read Returns
// ==========================================

export interface RaffleEntryData {
  user: Address;
  raffleId: bigint;
  entryTime: bigint;
  claimed: boolean;
  prizeAmount: bigint;
  wonNFT: boolean;
  finalized: boolean;
}

export interface PrizeTierData {
  bonusAmount: bigint;
  probability: bigint;
  includesNFT: boolean;
}

// ==========================================
// IPPY NFT Events
// ==========================================

export interface NFTMintedEventArgs {
  to: Address;
  tokenId: bigint;
  nftType: bigint;
}

export interface NFTMintedEvent extends BaseContractEvent {
  eventName: 'NFTMinted';
  args: NFTMintedEventArgs;
}

export interface NFTRedeemedEventArgs {
  owner: Address;
  tokenId: bigint;
}

export interface NFTRedeemedEvent extends BaseContractEvent {
  eventName: 'NFTRedeemed';
  args: NFTRedeemedEventArgs;
}

export type IPPYNFTEvent = NFTMintedEvent | NFTRedeemedEvent;

// ==========================================
// Type Guards (Runtime Type Checking)
// ==========================================

export function isItemListedEvent(event: unknown): event is ItemListedEvent {
  if (!event || typeof event !== 'object') return false;
  const e = event as any;
  return (
    e.eventName === 'ItemListed' &&
    e.args &&
    typeof e.args.nftAddress === 'string' &&
    typeof e.args.tokenId === 'bigint' &&
    typeof e.args.price === 'bigint' &&
    typeof e.args.seller === 'string'
  );
}

export function isItemBoughtEvent(event: unknown): event is ItemBoughtEvent {
  if (!event || typeof event !== 'object') return false;
  const e = event as any;
  return (
    e.eventName === 'ItemBought' &&
    e.args &&
    typeof e.args.nftAddress === 'string' &&
    typeof e.args.tokenId === 'bigint' &&
    typeof e.args.buyer === 'string' &&
    typeof e.args.seller === 'string'
  );
}

export function isBoxOpenedEvent(event: unknown): event is BoxOpenedEvent {
  if (!event || typeof event !== 'object') return false;
  const e = event as any;
  return (
    e.eventName === 'BoxOpened' &&
    e.args &&
    typeof e.args.user === 'string' &&
    Array.isArray(e.args.nftIds) &&
    Array.isArray(e.args.nftTypes)
  );
}

export function isRaffleEnteredEvent(event: unknown): event is RaffleEnteredEvent {
  if (!event || typeof event !== 'object') return false;
  const e = event as any;
  return (
    e.eventName === 'RaffleEntered' &&
    e.args &&
    typeof e.args.user === 'string' &&
    typeof e.args.raffleId === 'bigint' &&
    typeof e.args.entryFee === 'bigint'
  );
}

export function isRaffleFinalizedEvent(event: unknown): event is RaffleFinalizedEvent {
  if (!event || typeof event !== 'object') return false;
  const e = event as any;
  return (
    e.eventName === 'RaffleFinalized' &&
    e.args &&
    typeof e.args.user === 'string' &&
    typeof e.args.raffleId === 'bigint' &&
    typeof e.args.totalPayout === 'bigint'
  );
}

// ==========================================
// Helper Types
// ==========================================

// Generic event log with args
export interface ContractEventLog<T = unknown> extends Log {
  args: T;
  eventName: string;
}

// Type-safe event extraction
export type ExtractEventArgs<T> = T extends { args: infer A } ? A : never;
