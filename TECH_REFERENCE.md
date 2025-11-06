# IPPY Blind Box - Technical Reference

> **Last Updated:** 2025-11-05
> **Project Status:** Testnet (Story Aeneid)
> **Codebase Quality:** 6.5/10 (See audit report below)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Smart Contracts](#smart-contracts)
5. [Frontend Structure](#frontend-structure)
6. [Key Data Flows](#key-data-flows)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Configuration](#configuration)
10. [Known Issues](#known-issues)
11. [Development Guide](#development-guide)

---

## Project Overview

**IPPY Blind Box** is a blockchain-based gacha game built on Story Protocol (Aeneid testnet). It combines NFT mechanics with gamification, allowing users to purchase mystery blind boxes, reveal NFTs with varying rarities, trade on a marketplace, and participate in a raffle system.

### Core Features

- **Blind Box System**: Purchase and open mystery boxes (0.1 IP each)
- **NFT Collection**: 7 types of NFTs with on-chain SVG metadata
- **Marketplace**: Trade NFTs with other users
- **Raffle System**: Enter raffles with guaranteed returns + bonus prizes
- **Inventory Management**: View and manage NFT collections
- **Points & Leveling**: Track progress through XP and levels

### Key Metrics

- **Max Box Supply**: 666,666 boxes
- **Box Price**: 0.1 IP
- **NFT Types**: 7 (BLIPPY, IPPY, BIPPY, THIPPY, STIPPY, RAIPPY, MIPPY)
- **Hidden NFT Chance**: 0.67% (BLIPPY)
- **Raffle Cooldown**: 5 minutes (⚠️ TODO: should be 6 hours)
- **Raffle Entry**: 0.1 IP with 100% guaranteed return

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 15)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Features   │  │   Hooks      │  │  Components  │      │
│  │  (UI Logic)  │  │ (State Mgmt) │  │   (UI/UX)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         └──────────────────┴──────────────┬─────────────────┘
│                                            │
│         ┌──────────────────────────────────┴─────────────────┐
│         │                Lib Layer                            │
│         │  ┌──────────────┐  ┌──────────────┐                │
│         │  │  Contracts   │  │   Metadata   │                │
│         │  │   (Viem)     │  │  (Alchemy)   │                │
│         │  └──────┬───────┘  └──────┬───────┘                │
│         └─────────┼──────────────────┼────────────────────────┘
│                   │                  │
├───────────────────┼──────────────────┼────────────────────────┤
│                   │                  │                         │
│  ┌────────────────▼──────┐  ┌────────▼────────────┐          │
│  │  Story Aeneid Chain   │  │  Alchemy NFT API    │          │
│  │  ┌─────────────────┐  │  └─────────────────────┘          │
│  │  │ BlindBox        │  │                                    │
│  │  │ IPPYNFT         │  │  ┌─────────────────────┐          │
│  │  │ NFTMarketplace  │  │  │  Supabase (PostgreSQL)        │
│  │  │ OnChainRaffle   │  │  │  - Users                       │
│  │  └─────────────────┘  │  │  - Activities                  │
│  └───────────────────────┘  └─────────────────────┘          │
│                                                                │
│  ┌─────────────────────┐   ┌─────────────────────┐           │
│  │ Pyth Entropy VRF    │   │ IPFS/Pinata         │           │
│  │ (Randomness)        │   │ (Metadata Storage)  │           │
│  └─────────────────────┘   └─────────────────────┘           │
└────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 15.2.4 | React framework with SSR/SSG |
| **UI Library** | React | 18.3.1 | Component-based UI |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **Components** | Radix UI | Various | Accessible component primitives |
| **Animation** | Framer Motion | 12.16.0 | Animations and transitions |
| **State** | Zustand | 5.0.5 | Lightweight state management |
| **Forms** | React Hook Form | 7.54.1 | Form handling + validation |
| **Validation** | Zod | 3.24.1 | Schema validation |
| **Charts** | Recharts | 2.15.0 | Data visualization |

### Web3 Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Wallet** | Privy | 2.14.1 | Wallet connection & embedded wallets |
| **Blockchain** | Viem | 2.31.0 | Ethereum interaction library |
| **Smart Wallets** | Permissionless | 0.2.47 | ERC-4337 account abstraction |
| **Chain** | Story Aeneid | Testnet | Story Protocol testnet (Chain ID: 1315) |

### Backend & Infrastructure

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Database** | PostgreSQL | - | User data & activities |
| **ORM** | Prisma | 6.16.3 | Type-safe database client |
| **NFT API** | Alchemy | - | NFT metadata fetching |
| **Storage** | Pinata | 2.4.9 | IPFS pinning service |
| **Deployment** | Vercel | - | Hosting & serverless functions |

### Smart Contracts

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Language** | Solidity 0.8.x | Smart contract development |
| **Standards** | ERC721, ERC1155 | NFT & multi-token standards |
| **VRF** | Pyth Entropy V2 | Verifiable random function |
| **Libraries** | OpenZeppelin | Security-audited contract templates |

### Development Tools

- **TypeScript** 5.x - Type safety
- **ESLint** 9 - Code linting
- **pnpm** - Package management
- **Hardhat** - Contract testing & deployment (inferred)

---

## Smart Contracts

### Contract Addresses (Story Aeneid Testnet)

```typescript
export const CONTRACT_ADDRESSES = {
  BlindBox: "0x41bDf3F1F12976DbE138a0743Ce95fefC0Ae569D",
  IPPYNFT: "0xe5805729d43B47cdC9daa8c0C182bf57D046Dda0",
  NFTMarketplace: "0xd1dE3E378868e89A3291E0b17BA6577B17cf827E",
  OnChainRaffle: "0x8Af8C2e8915d9Bc924D50b7e57b1395e36207797",
  EntropyV2: "0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c"
} as const;
```

### BlindBox.sol (ERC1155)

**Location:** `/contract/contracts/BlindBox.sol` (231 lines)

**Purpose:** Manages blind box purchases and opening with VRF.

**Key Functions:**

```solidity
function purchaseBoxes(uint256 amount) external payable nonReentrant;
function openBox(uint256 amount, bytes32 userRandomNumber) external payable nonReentrant;
function entropyCallback(uint64 sequenceNumber, bytes32 randomNumber) internal;
```

**Key State:**

```solidity
uint256 public boxPrice = 0.1 ether;
uint256 public maxTotalSupply = 666666;
uint256 public currentSupply;
mapping(uint64 => PendingBoxOpen) public pendingBoxOpens;
```

**Events:**

```solidity
event BoxPurchased(address indexed user, uint256 amount, uint256 totalPaid);
event BoxOpenRequested(address indexed user, uint256 amount, uint64 sequenceNumber);
event BoxOpened(address indexed user, uint256[] nftIds, uint256[] nftTypes);
```

**⚠️ Critical Issue:**
- Uses Pyth Entropy for randomness (good!)
- NFT distribution: 0.67% hidden (BLIPPY), rest equal distribution
- Gas optimized with unchecked arithmetic

### IPPYNFT.sol (ERC721)

**Location:** `/contract/contracts/IPPYNFT.sol` (296 lines)

**Purpose:** NFT contract with on-chain SVG metadata.

**Key Functions:**

```solidity
function mint(address to, uint256 nftType) external returns (uint256);
function tokenURI(uint256 tokenId) public view returns (string memory);
function redeem(uint256 tokenId) external;
```

**NFT Types:**

| ID | Name | Rarity |
|----|------|--------|
| 0 | BLIPPY | Hidden (0.67%) |
| 1 | IPPY | Standard |
| 2 | BIPPY | Standard |
| 3 | THIPPY | Standard |
| 4 | STIPPY | Standard |
| 5 | RAIPPY | Standard |
| 6 | MIPPY | Standard |

**Key State:**

```solidity
mapping(uint256 => uint256) public tokenIdToNFTType;
mapping(uint256 => bool) public isRedeemed;
mapping(uint256 => uint256) public nftTypeCounts;
mapping(address => mapping(uint256 => uint256)) public userNFTTypeCounts;
```

**Features:**
- On-chain SVG generation via `MetadataLibIPPYNFT`
- EIP-4906 metadata update events
- Redemption system (for physical goods?)
- Comprehensive statistics tracking

### NFTMarketplace.sol

**Location:** `/contract/contracts/nftmarketplace.sol` (170 lines)

**Purpose:** Standard NFT marketplace for buying/selling.

**Key Functions:**

```solidity
function listItem(address nftAddress, uint256 tokenId, uint256 price) external;
function buyItem(address nftAddress, uint256 tokenId) external payable;
function cancelListing(address nftAddress, uint256 tokenId) external;
function updateListing(address nftAddress, uint256 tokenId, uint256 newPrice) external;
```

**Events:**

```solidity
event ItemListed(address indexed nftAddress, uint256 indexed tokenId, uint256 price, address indexed seller);
event ItemBought(address indexed nftAddress, uint256 indexed tokenId, uint256 price, address indexed buyer, address seller);
event ItemCanceled(address indexed nftAddress, uint256 indexed tokenId, address indexed seller);
```

**⚠️ Issue:**
- Approval check only uses `getApproved()`, doesn't check `isApprovedForAll()`
- Forces individual token approvals instead of operator approvals

### OnChainRaffle.sol

**Location:** `/contract/contracts/OnChainRaffle.sol` (544 lines)

**Purpose:** Raffle system with guaranteed returns + bonus prizes.

**Key Functions:**

```solidity
function enterRaffle(bytes32 userRandomNumber) external payable;
function claimPrize(uint256 raffleId) external;
function entropyCallback(uint64 sequenceNumber, bytes32 randomNumber) internal;
```

**Economic Model:**

```solidity
uint256 public constant ENTRY_FEE = 0.1 ether;
uint256 public constant GUARANTEED_RETURN = 0.1 ether;  // 100%
uint256 public constant COOLDOWN_PERIOD = 5 minutes;  // ⚠️ TODO: 6 hours

// Prize tiers
struct PrizeTier {
    uint256 bonusAmount;    // Additional IP tokens
    uint256 probability;    // Out of 10000 (0.01% precision)
    bool includesNFT;
}

// Default tiers:
// Tier 1: 40% bonus (0.04 IP) - 0.7% chance (70/10000)
// Tier 2: 120% bonus (0.12 IP) + NFT - 0.18% chance (18/10000)
// Tier 3: 200% bonus (0.2 IP) - 0.02% chance (2/10000)
```

**⚠️ CRITICAL:**
```solidity
uint256 public constant COOLDOWN_PERIOD = 5 minutes;  // TODO: Change to 6 hours
```
**This MUST be fixed before mainnet deployment!**

**Expected Value Calculation:**
- Entry: 0.1 IP
- Guaranteed return: 0.1 IP
- Bonus pool EV: ~0.005 IP (0.7% × 0.04 + 0.18% × 0.12 + 0.02% × 0.2)
- House edge: Negative (players gain value over time)

---

## Frontend Structure

### Directory Layout

```
app/
├── page.tsx                    # Landing page
├── gacha/                      # Blind box purchase/reveal
│   └── page.tsx
├── inventory/                  # NFT collection view
│   └── page.tsx
├── market/                     # Marketplace
│   └── page.tsx
├── raffle/                     # Raffle entry
│   └── page.tsx
├── claw/                       # ⚠️ EXCLUDED FROM ANALYSIS
│   ├── loading.tsx
│   └── page.tsx
└── api/                        # Server endpoints
    ├── points/
    ├── users/
    └── activities/

components/
└── ui/                         # Radix UI components (shadcn/ui)

features/
├── gacha/                      # Gacha-specific components
├── inventory/                  # Inventory-specific components
├── market/                     # Marketplace-specific components
├── raffle/                     # Raffle-specific components
└── shared/                     # Shared components (Header, Footer, etc.)

hooks/
├── gacha/
│   ├── useBlindBox.ts         # Contract interactions (265 lines)
│   └── useGachaMachine.ts     # Animation state machine
├── inventory/
│   └── useInventory.ts        # NFT fetching (368 lines) ⚠️ TOO LARGE
├── marketplace/
│   └── useMarketplace.ts      # Marketplace logic (510 lines) ⚠️ TOO LARGE
└── raffle/
    ├── useRaffleEntry.ts      # Raffle entry logic
    └── useRaffleState.ts      # Raffle state management

lib/
├── contract/
│   ├── abi/                   # Contract ABIs
│   ├── client.ts              # Viem client configuration
│   └── config.ts              # Contract addresses
├── metadata.ts                # Metadata fetching & caching (213 lines)
├── privy.ts                   # Privy configuration
└── supabase.ts                # Supabase client

types/
├── gacha.ts                   # GachaItem, GachaItemWithCount
├── marketplace.ts             # MarketplaceListing
├── raffle.ts                  # RaffleEntry, PrizeTier
└── user.ts                    # User, Activity

utils/
├── format.ts                  # Formatting helpers
├── validation.ts              # Validation schemas
└── constants.ts               # App constants
```

---

## Key Data Flows

### 1. Purchase & Open Blind Box

```
User clicks "Purchase Box"
  ↓
useBlindBox.purchaseBoxes(amount)
  ↓
BlindBox.purchaseBoxes(amount)
  ↓ [Transaction mined]
User receives ERC1155 tokens
  ↓
User clicks "Open Box"
  ↓
useBlindBox.openBoxes(amount, userRandomNumber)
  ↓
BlindBox.openBox(amount, userRandomNumber)
  ↓
Request to Pyth Entropy VRF
  ↓ [Callback received after ~30 seconds]
BlindBox.entropyCallback(sequenceNumber, randomNumber)
  ↓
Calculate NFT types from randomNumber
  ↓
IPPYNFT.mint(user, nftType) × amount
  ↓ [NFTs minted]
Event: BoxOpened(user, nftIds, nftTypes)
  ↓
Frontend polls for transaction receipt
  ↓
useInventory.fetchInventory() refreshes
  ↓
Fetch metadata from Alchemy API
  ↓
MetadataService caches in localStorage
  ↓
UI displays NFTs in inventory
```

### 2. List & Buy on Marketplace

```
Seller: List NFT
  ↓
IPPYNFT.approve(marketplace, tokenId)
  ↓
NFTMarketplace.listItem(nftAddress, tokenId, price)
  ↓
Event: ItemListed(nftAddress, tokenId, price, seller)
  ↓
useMarketplace.getAllActiveListings()
  ↓
Scan blockchain events:
  - ItemListed
  - ItemBought
  - ItemCanceled
  ↓
Filter active listings (not sold/canceled)
  ↓
Fetch metadata for each listing
  ↓
Display in marketplace UI
  ↓
Buyer clicks "Buy"
  ↓
NFTMarketplace.buyItem(nftAddress, tokenId) + value
  ↓
Transfer NFT to buyer
  ↓
Credit proceeds to seller
  ↓
Event: ItemBought(...)
  ↓
UI updates listings
```

### 3. Enter Raffle

```
User clicks "Enter Raffle"
  ↓
Check cooldown: lastEntry + 5 minutes > now?
  ↓ [If cooldown passed]
Generate userRandomNumber (client-side)
  ↓
OnChainRaffle.enterRaffle(userRandomNumber) + 0.1 IP
  ↓
Request to Pyth Entropy VRF
  ↓ [Callback after ~30 seconds]
OnChainRaffle.entropyCallback(sequenceNumber, randomNumber)
  ↓
Determine prize tier from randomNumber
  ↓
Calculate total payout:
  - Base: 0.1 IP (guaranteed)
  - Bonus: prizeTier.bonusAmount
  - NFT: if prizeTier.includesNFT
  ↓
Transfer payout to user
  ↓
Mint NFT if won
  ↓
Event: RaffleEntered(user, raffleId, prize)
  ↓
Frontend displays result with animation
```

---

## API Endpoints

### Server-Side Routes (`/app/api`)

#### POST /api/points/award

**Purpose:** Award points to a user for completing actions.

**Request Body:**
```typescript
{
  walletAddress: string;
  points: number;
  xp: number;
  activityType: string;
  metadata?: Json;
}
```

**Response:**
```typescript
{
  success: boolean;
  user?: User;
  activity?: Activity;
  error?: string;
}
```

**⚠️ Issue:** No rate limiting, could be spammed.

#### GET /api/users/:walletAddress

**Purpose:** Fetch user profile by wallet address.

**Response:**
```typescript
{
  id: string;
  walletAddress: string;
  username: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  totalXp: number;
  currentLevel: number;
  createdAt: string;
  updatedAt: string;
}
```

#### GET /api/activities/:walletAddress

**Purpose:** Fetch activity history for a user.

**Response:**
```typescript
{
  activities: Activity[];
}
```

---

## Database Schema

**ORM:** Prisma
**Database:** PostgreSQL (Supabase)
**Schema File:** `/prisma/schema.prisma`

### Tables

#### users

```prisma
model User {
  id            String     @id @default(cuid())
  walletAddress String     @unique
  username      String?
  avatarUrl     String?
  totalPoints   Int        @default(0)
  totalXp       Int        @default(0)
  currentLevel  Int        @default(1)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  activities    Activity[]

  @@map("users")
}
```

**⚠️ Issues:**
- No index on `walletAddress` (should have for frequent queries)
- No checksum validation for Ethereum addresses
- `totalPoints` and `totalXp` can overflow (should use BigInt if huge)

#### activities

```prisma
model Activity {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  activityType String
  points       Int
  xp           Int
  metadata     Json?
  createdAt    DateTime @default(now())

  @@map("activities")
}
```

**⚠️ Issues:**
- No index on `userId` or `createdAt` for sorting
- `Json` type for metadata is unstructured (consider typed fields)

---

## Configuration

### Environment Variables

**File:** `.env` (⚠️ Not committed to git)

```bash
# Blockchain
NEXT_PUBLIC_ALCHEMY_API_KEY="..."          # ⚠️ EXPOSED TO CLIENT!
NEXT_PUBLIC_CHAIN_ID="1315"                # Story Aeneid testnet

# Contracts
NEXT_PUBLIC_BLIND_BOX_ADDRESS="0x41bDf3F1F12976DbE138a0743Ce95fefC0Ae569D"
NEXT_PUBLIC_IPPY_NFT_ADDRESS="0xe5805729d43B47cdC9daa8c0C182bf57D046Dda0"
NEXT_PUBLIC_MARKETPLACE_ADDRESS="0xd1dE3E378868e89A3291E0b17BA6577B17cf827E"
NEXT_PUBLIC_RAFFLE_ADDRESS="0x8Af8C2e8915d9Bc924D50b7e57b1395e36207797"
NEXT_PUBLIC_ENTROPY_ADDRESS="0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c"

# Privy (Wallet Authentication)
NEXT_PUBLIC_PRIVY_APP_ID="..."

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."        # ⚠️ EXPOSED TO CLIENT (intended)
SUPABASE_SERVICE_ROLE_KEY="..."            # Server-side only

# IPFS
PINATA_API_KEY="..."
PINATA_SECRET_API_KEY="..."
```

**⚠️ Critical Security Issue:**

`NEXT_PUBLIC_ALCHEMY_API_KEY` is exposed to the browser. Any user can:
1. Open DevTools → Network
2. Extract the API key
3. Abuse your Alchemy quota

**Fix:** Move Alchemy calls to server-side API routes:
```typescript
// /app/api/metadata/[contractAddress]/[tokenId]/route.ts
export async function GET(request, { params }) {
  const { contractAddress, tokenId } = params;
  const apiKey = process.env.ALCHEMY_API_KEY; // Not NEXT_PUBLIC_!
  // Fetch from Alchemy server-side
}
```

---

## Known Issues

### Critical (Must Fix Before Mainnet)

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Raffle cooldown TODO | `OnChainRaffle.sol:29` | Wrong game economics | Change 5 minutes → 6 hours |
| API Key exposure | `.env` | Security breach, cost abuse | Move to server API routes |
| Event scan inefficiency | `useMarketplace.ts:79` | Unscalable, slow UX | Implement incremental caching |
| Type safety (`any`) | 111 instances in 29 files | Runtime errors, bugs | Define proper interfaces |

### High Priority

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| No rate limiting | `/app/api/**` | API abuse | Add rate limiter middleware |
| No database indexes | `schema.prisma` | Slow queries | Add indexes on foreign keys |
| Console logs in prod | 131 instances | Bundle bloat | Use logger with env filtering |
| No tests | N/A | Bugs in production | Write tests (80% coverage goal) |

### Medium Priority

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Monster files | `useInventory.ts` (368 lines) | Hard to maintain | Split into 4 hooks |
| | `useMarketplace.ts` (510 lines) | Hard to maintain | Separate concerns |
| | `OnChainRaffle.sol` (544 lines) | Complex contract | Consider splitting |
| Commented code | Multiple files | Code clutter | Delete or document |
| Magic numbers | Throughout | Hard to understand | Extract to constants |

### Low Priority

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| No pagination | Inventory, marketplace | Slow with many items | Add virtual scrolling |
| LocalStorage cache | `metadata.ts` | Quota limits | Use IndexedDB or server cache |
| NFT approval check | `NFTMarketplace.sol:93` | UX friction | Check `isApprovedForAll` too |

---

## Development Guide

### Setup

```bash
# Clone repo
git clone <repo-url>
cd on-chain-blind-box

# Install dependencies
pnpm install

# Setup database
pnpm prisma migrate dev

# Copy environment variables
cp .env.example .env
# Edit .env with your keys

# Run development server
pnpm dev
```

### Smart Contract Development

```bash
cd contract

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network aeneid
```

### Useful Commands

```bash
# Type checking
pnpm tsc --noEmit

# Linting
pnpm eslint .

# Database migrations
pnpm prisma migrate dev
pnpm prisma generate

# View database
pnpm prisma studio
```

### Testing Strategy (Currently Missing!)

**Recommended test structure:**

```
tests/
├── unit/
│   ├── hooks/
│   │   ├── useBlindBox.test.ts
│   │   ├── useInventory.test.ts
│   │   └── useMarketplace.test.ts
│   └── lib/
│       └── metadata.test.ts
├── integration/
│   ├── gacha-flow.test.ts
│   ├── marketplace-flow.test.ts
│   └── raffle-flow.test.ts
└── e2e/
    └── full-game-flow.test.ts
```

**Tools to use:**
- Jest + React Testing Library (unit tests)
- Playwright (e2e tests)
- Hardhat (contract tests - already exists)

---

## Performance Optimization Opportunities

### 1. Event Caching Architecture

**Current problem:**
```typescript
// Scans entire blockchain history every time!
const events = await readClient.getContractEvents({
  fromBlock: "earliest",
  toBlock: "latest",
});
```

**Proposed solution:**
```typescript
interface EventCache {
  listings: Map<string, Listing>;
  lastScannedBlock: bigint;
  updatedAt: number;
}

async function getActiveListings() {
  const cache = loadCache();
  const newEvents = await getEventsSince(cache.lastScannedBlock);
  updateCache(cache, newEvents);
  return filterActive(cache.listings);
}
```

**Impact:** O(n) → O(Δ) complexity, 10x faster on average.

### 2. Metadata Fetching Optimization

**Current:** Fetches all NFTs in batches of 5 parallel requests.

**Issues:**
- No prioritization (visible NFTs vs. off-screen)
- No progressive loading
- No placeholder images

**Proposed:**
```typescript
// Priority queue: visible > nearby > off-screen
const queue = new PriorityQueue();
queue.enqueue(visibleNFTs, priority: HIGH);
queue.enqueue(nearbyNFTs, priority: MEDIUM);
queue.enqueue(offScreenNFTs, priority: LOW);
```

### 3. Virtual Scrolling for Inventory

**Current:** Renders all NFTs at once (DOM nodes = NFT count).

**Issue:** With 1000+ NFTs, browser becomes sluggish.

**Solution:** Use `react-window` or `react-virtual`:
```typescript
<VirtualList
  height={600}
  itemCount={inventory.length}
  itemSize={150}
  renderItem={({ index }) => <NFTCard nft={inventory[index]} />}
/>
```

---

## Security Checklist

### Pre-Mainnet Audit

- [ ] Smart contract security audit (CertiK, OpenZeppelin, etc.)
- [ ] Front-running analysis (marketplace buyItem)
- [ ] Reentrancy checks (all external calls)
- [ ] Integer overflow/underflow (check unchecked blocks)
- [ ] Access control (onlyOwner, onlyMinter, etc.)
- [ ] Event emission completeness
- [ ] Gas optimization (avoid DoS via block gas limit)

### Application Security

- [ ] Move all API keys to server-side
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Input validation on all API routes (Zod schemas)
- [ ] Sanitize user inputs (XSS prevention)
- [ ] CORS configuration (restrict origins)
- [ ] Content Security Policy headers
- [ ] SQL injection prevention (Prisma ORM helps here)

### Operational Security

- [ ] Multi-sig wallet for contract ownership
- [ ] Timelock for critical contract upgrades
- [ ] Bug bounty program
- [ ] Incident response plan
- [ ] Monitoring & alerting (Sentry, Datadog)
- [ ] Backup & disaster recovery

---

## Code Quality Metrics

**Generated from codebase scan (Nov 5, 2025):**

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| TypeScript `any` usage | 111 instances | 0 | 🔴 Critical |
| Console logs | 131 instances | 0 in prod | 🔴 Critical |
| Test coverage | ~0% (frontend) | 80% | 🔴 Critical |
| Average file size | ~150 lines | <200 lines | 🟡 Acceptable |
| Largest file | 544 lines (OnChainRaffle.sol) | <300 lines | 🔴 Refactor |
| Cyclomatic complexity | Medium-High | Low | 🟡 Acceptable |
| TODO count | 3 (1 in production code!) | 0 | 🔴 Critical |
| Commented code blocks | 15+ | 0 | 🟡 Cleanup |

**Overall Code Quality:** 6.5/10

---

## Roadmap to Production

### Phase 1: Critical Fixes (1-2 weeks)

1. Fix raffle cooldown in contract (redeploy)
2. Move Alchemy API to server-side
3. Implement event caching for marketplace
4. Remove all `any` types (define interfaces)
5. Add database indexes
6. Implement rate limiting

### Phase 2: Testing & Security (2-3 weeks)

7. Write comprehensive test suite (80% coverage)
8. Smart contract security audit
9. Penetration testing
10. Fix all high/critical vulnerabilities
11. Load testing (1000+ concurrent users)

### Phase 3: Optimization (1-2 weeks)

12. Split large files (useInventory, useMarketplace)
13. Implement virtual scrolling
14. Add pagination
15. Optimize bundle size
16. CDN & caching strategy

### Phase 4: Mainnet Deployment (1 week)

17. Deploy contracts to mainnet
18. Verify contracts on block explorer
19. Update frontend to mainnet contracts
20. Launch marketing campaign
21. Monitor & fix issues

**Total estimated time:** 5-8 weeks

---

## Contributing Guidelines

### Code Standards

1. **TypeScript:** No `any`, use strict mode
2. **React:** Functional components + hooks only
3. **Solidity:** Follow OpenZeppelin patterns
4. **Testing:** All new code requires tests
5. **Commits:** Conventional Commits format

### Pull Request Process

1. Create feature branch: `git checkout -b feat/your-feature`
2. Write code + tests
3. Run linter: `pnpm lint`
4. Run tests: `pnpm test`
5. Create PR with description
6. Wait for code review
7. Address feedback
8. Merge after approval

### Code Review Checklist

- [ ] No `any` types
- [ ] No console logs
- [ ] Tests pass
- [ ] No security vulnerabilities
- [ ] Performance considerations
- [ ] Documentation updated

---

## Contact & Support

- **GitHub Issues:** [Link to repo issues]
- **Discord:** [Link to Discord server]
- **Documentation:** [Link to docs]

---

## Changelog

### v0.2 (Current - Testnet)
- ✅ Blind box purchase & reveal
- ✅ NFT marketplace
- ✅ Raffle system
- ✅ Inventory management
- ✅ Points & leveling
- ⚠️ Known issues (see above)

### v0.1 (Initial)
- Basic smart contracts
- Simple frontend
- No marketplace

---

**Last Updated:** 2025-11-05
**Next Review:** Before mainnet deployment

**Status:** ⚠️ Testnet only - DO NOT deploy to mainnet without addressing critical issues!