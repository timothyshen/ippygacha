# IPPY Blind Box - Beta Testing Plan

> "Testing should focus on data flow and destructive user operations, not every button." —— Linus Testing Philosophy

## Testing Priority

### P0 - Critical (Cannot Launch Without Passing)
- Blind Box Purchase & Reveal Flow
- Marketplace Trading Flow
- Raffle Draw Flow
- VRF Callback Timeout Handling

### P1 - Affects UX But Not Critical
- Metadata Loading & Caching
- Event Scanning Performance
- Concurrent Operations
- Error Handling

### P2 - Security & Edge Cases
- API Key Exposure Check
- Rate Limiting Tests
- Malicious Input Tests

---

## Key Risk Points

### 🔴 Critical Risks

**1. VRF Callback Timeout (No Handling Logic)**
- **Location:** `hooks/blindbox/useBlindBox.ts`, `hooks/raffle/useRaffleEntry.ts`
- **Issue:** If Entropy provider doesn't respond for >24 hours, blind boxes are stuck in `PendingBoxOpen` forever
- **Test:** `TC-001-VRF-Timeout.md`

**2. Raffle Cooldown Setting Error**
- **Location:** `contract/contracts/OnChainRaffle.sol:30`
- **Issue:** `COOLDOWN_PERIOD = 5 minutes` (should be 6 hours)
- **Impact:** Users can draw every 5 minutes, game economics collapse
- **Test:** `TC-006-Raffle-Cooldown.md`

**3. Contract Balance Insufficient**
- **Location:** `OnChainRaffle.sol` - guarantees 100% return
- **Issue:** If balance < 0.1 ETH, transactions revert with no friendly message
- **Test:** `TC-007-Contract-Balance.md`

### 🟡 Medium Risks

**4. Marketplace Event Scanning Performance**
- **Location:** `hooks/marketplace/useMarketplace.ts`
- **Optimization:** Incremental caching implemented (10-360x speedup)
- **Remaining Risk:** Full scan needed when cache is corrupted (5+ seconds)
- **Test:** `TC-004-Marketplace-Cache.md`

---

## Testing Environment

### Contract Addresses (Sepolia Testnet)
```
BlindBox:        0x87d3FEE94B8306702Dfdba539c0BACAC0985594B
IPPYNFT:         0x702097673370e14F5b8a77dB55d2799D136767Bd
NFTMarketplace:  0x8D2729D9807E9FdD7d648BD3045c39B80aB2E5c7
OnChainRaffle:   (To be deployed)
```

### Prerequisites
1. At least 3 wallet addresses (simulate multi-user)
2. Each wallet has ≥0.5 ETH (Sepolia)
3. Database state cleared (test initial state)
4. localStorage cleared (test caching logic)

---

## Test Execution Order

```
1. Core Flow Tests (P0)
   └─> TC-001 (VRF Timeout)
   └─> TC-002 (Blind Box Purchase)
   └─> TC-003 (Marketplace Trading)
   └─> TC-006 (Raffle Draw)

2. Performance & Edge Tests (P1)
   └─> TC-004 (Cache Performance)
   └─> TC-008 (Concurrent Operations)

3. Security Tests (P2)
   └─> TC-009 (Malicious Input)
   └─> TC-010 (Permission Verification)
```

---

## Automation Recommendations

### Current Status: Zero Frontend Test Coverage

**Should Be Automated:**
- [ ] Contract Calls (using Hardhat + Ethers.js)
- [ ] API Endpoints (using Jest + Supertest)
- [ ] Database CRUD (using Prisma test environment)

**Not Worth Automating:**
- ❌ Animation Effects (GachaMachine, PullAnimation)
- ❌ UI Layout (visual inspection is faster)
- ❌ Wallet Connection (Privy SDK's responsibility)

---

## Launch Criteria

### Launch Threshold (Must All Pass)
- [ ] All P0 tests pass
- [ ] Raffle cooldown fixed to 6 hours
- [ ] VRF timeout handling logic implemented
- [ ] Contract balance monitoring mechanism

### Acceptable Risks (Can Launch With These)
- Occasional metadata loading failures (client-side retry)
- Marketplace initial load slow (acceptable if <5 seconds)
- Claw machine game bugs (non-core feature)

---

## Contact Information

**When Issues Are Found, Record:**
1. Wallet address
2. Transaction hash (if any)
3. Browser console errors
4. Steps to reproduce
5. Expected vs actual behavior

**Report Format:**
```
[TC-XXX] Test Case Title
Status: ❌ Failed / ⚠️ Partial Pass / ✅ Pass
Severity: P0 / P1 / P2
Description: [Brief issue description]
Steps to Reproduce: [Steps]
Impact: [What will users see?]
Suggestion: [Technical fix recommendation]
```
