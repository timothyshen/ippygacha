# TC-008: Concurrent Operations & Race Conditions

**Priority:** P1 - Affects Multi-User Scenarios
**Risk Level:** 🟡 Medium Risk
**Test Time:** ~30 minutes

---

## Test Objective

Verify that the system correctly handles race conditions and concurrent conflicts when multiple users or tabs operate simultaneously.

---

## Background

### Potential Race Conditions
1. **Double-spend Problem:** Two buyers purchase same NFT simultaneously
2. **Inventory Desync:** Blindbox count displays incorrectly
3. **VRF Conflict:** Multiple VRF requests processed simultaneously
4. **Cache Inconsistency:** Multi-tab cache conflicts

---

## Test Cases

### TC-008-01: Two Buyers Purchase Same NFT Simultaneously
**Preconditions:**
- 1 listing in marketplace (0.05 IP)
- Prepare 2 wallets (Buyer A, Buyer B)

**Steps:**
1. Buyer A and B both open `/market`
2. Both click "Buy" on same NFT simultaneously
3. Submit transactions almost simultaneously

**Expected Results:**
- ✅ Only 1 transaction succeeds (first come first served)
- ✅ Other transaction reverts: "NFT already sold"
- ✅ NFT only transferred to successful buyer
- ✅ Seller only receives one payment

**Actual Results:**
```
Buyer A transaction: [ ] Success / [ ] Fail
Buyer B transaction: [ ] Success / [ ] Fail
NFT belongs to: [ ] A / [ ] B / [ ] Both (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-008-02: Same User Purchases Blindboxes in Multiple Tabs
**Preconditions:**
- Wallet has 0.2 IP
- Open 2 browser tabs

**Steps:**
1. Tab A: Select purchase 10 blindboxes
2. Tab B: Simultaneously select purchase 5 blindboxes
3. Submit transactions almost simultaneously

**Expected Results:**
- ✅ Both transactions may succeed (if balance sufficient)
- ✅ Or second transaction reverts: "Insufficient balance"
- ✅ Blindbox total = actual purchased amount (no duplicate counting)

**Actual Results:**
```
Transaction A: [ ] Success / [ ] Fail
Transaction B: [ ] Success / [ ] Fail
Blindbox total:
[ ] Pass / [ ] Fail
```

---

### TC-008-03: Concurrent VRF Requests
**Preconditions:**
- Own 10 blindboxes

**Steps:**
1. Rapidly click "Reveal" button 3 times
2. Reveal 3 blindboxes each time
3. Observe VRF request handling

**Expected Results:**
- ✅ All 3 VRF requests succeed
- ✅ sequenceNumber doesn't conflict (increments)
- ✅ Finally mint 9 NFTs
- ✅ Blindbox count -9

**Actual Results:**
```
VRF request 1:
VRF request 2:
VRF request 3:
NFT count:
Blindbox remaining:
[ ] Pass / [ ] Fail
```

---

### TC-008-04: Seller Cancels Listing vs Buyer Purchases (Race)
**Preconditions:**
- 1 listing in marketplace
- Seller and buyer operate simultaneously

**Steps:**
1. Seller: Click "Cancel listing"
2. Buyer: Simultaneously click "Buy"
3. Both transactions go on-chain almost simultaneously

**Expected Results:**
- ✅ Only one transaction succeeds
- ✅ If buyer first: Purchase succeeds, cancel fails
- ✅ If seller first: Cancel succeeds, purchase fails
- ✅ No "NFT disappears" situation

**Actual Results:**
```
Seller transaction: [ ] Success / [ ] Fail
Buyer transaction: [ ] Success / [ ] Fail
NFT belongs to: [ ] Buyer / [ ] Seller / [ ] Lost (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-008-05: Multi-Tab Cache Conflict (localStorage)
**Preconditions:**
- Open 2 tabs visiting `/market`

**Steps:**
1. Tab A: Load marketplace (generate cache)
2. Tab B: Simultaneously load marketplace (generate cache)
3. Observe if cache conflicts

**Expected Results:**
- ✅ Two tabs read/write cache independently
- ✅ No mutual overwriting causing data corruption
- ⚠️ May have slight delay desync (acceptable)

**Actual Results:**
```
Tab A listing count:
Tab B listing count:
Cache conflict: [ ] None / [ ] Yes
[ ] Pass / [ ] Fail
```

---

### TC-008-06: Raffle Cooldown Race Condition
**Preconditions:**
- User just passed cooldown (e.g., 6 hours +1 second)

**Steps:**
1. Rapidly click "Enter Raffle" 2 times
2. Observe transaction results

**Expected Results:**
- ✅ 1st transaction succeeds
- ✅ 2nd transaction reverts: "Cooldown not elapsed"
- ✅ User only pays fee once

**Actual Results:**
```
Transaction 1: [ ] Success / [ ] Fail
Transaction 2: [ ] Success / [ ] Fail
Fee payment count:
[ ] Pass / [ ] Fail
```

---

### TC-008-07: High Concurrency Scenario (Stress Test)
**Preconditions:**
- 10 wallet addresses
- 20 listings in marketplace

**Steps:**
1. 10 users visit `/market` simultaneously
2. Each user randomly purchases 2-3 NFTs
3. Observe system stability

**Expected Results:**
- ✅ All transactions handled correctly
- ✅ No double-spend problem
- ✅ Final listing count correct
- ✅ Server doesn't crash

**Actual Results:**
```
Successful transactions:
Failed transactions:
Server status: [ ] Normal / [ ] Crash / [ ] Slow
Remaining listings:
[ ] Pass / [ ] Fail
```

---

## Data Consistency Verification

### TC-008-08: Blindbox Inventory Consistency
**Preconditions:**
- User owns 5 blindboxes

**Steps:**
1. Tab A: Reveal 3 blindboxes
2. Tab B: Refresh page
3. Check blindbox count display

**Expected Results:**
- ✅ Tab A: Immediately shows 2 blindboxes
- ✅ Tab B: Shows 2 blindboxes after refresh
- ✅ On-chain query: `balanceOf(user, 1)` = 2

**Actual Results:**
```
Tab A:
Tab B:
On-chain data:
[ ] Pass / [ ] Fail
```

---

### TC-008-09: Marketplace Listing Consistency
**Preconditions:**
- 10 listings in marketplace

**Steps:**
1. User A: Purchase 1 NFT
2. User B: Simultaneously refresh `/market` page
3. Check listing count

**Expected Results:**
- ✅ User A: Listing immediately disappears
- ✅ User B: Listing disappears after refresh
- ✅ On-chain query: Listing deleted

**Actual Results:**
```
User A listing count:
User B listing count:
On-chain data:
[ ] Pass / [ ] Fail
```

---

## Error Recovery Test

### TC-008-10: Retry After Transaction Failure
**Preconditions:**
- Wallet balance insufficient

**Steps:**
1. Attempt to purchase blindbox (fails)
2. Recharge wallet
3. Immediately retry purchase

**Expected Results:**
- ✅ 1st transaction reverts
- ✅ 2nd transaction succeeds
- ✅ No "stuck" state

**Actual Results:**
```
1st attempt: [ ] Reverted / [ ] Other
2nd attempt: [ ] Success / [ ] Fail
[ ] Pass / [ ] Fail
```

---

### TC-008-11: Network Delay Causing Duplicate Submission
**Preconditions:**
- Use DevTools to simulate slow network (Slow 3G)

**Steps:**
1. Click "Purchase blindbox"
2. Due to slow network, user gets impatient
3. Click "Purchase blindbox" again

**Expected Results:**
- ✅ UI disables button (prevent duplicate clicks)
- ✅ Only send 1 transaction
- ✅ Or 2nd transaction intercepted by client

**Actual Results:**
```
Transaction count:
Button status: [ ] Disabled / [ ] Clickable
[ ] Pass / [ ] Fail
```

---

## Code Location

### Smart Contracts
- `contract/contracts/NFTMarketplace.sol` - Buyer race handling
- `contract/contracts/BlindBox.sol` - VRF concurrent handling
- `contract/contracts/OnChainRaffle.sol` - Cooldown check

### Frontend
- `hooks/marketplace/useMarketplace.ts` - Cache sync
- `hooks/blindbox/useBlindBox.ts` - Transaction state management
- `hooks/raffle/useRaffleEntry.ts` - Cooldown frontend check

---

## Severity Assessment

**Impact if Failed:**
- TC-008-01: 🔴 Double-spend problem, serious security vulnerability
- TC-008-02/03: 🟡 User experience issue, but doesn't cause fund loss
- TC-008-04: 🔴 May cause NFT loss
- TC-008-05: 🟢 Cache desync, refresh resolves
- TC-008-06: 🟡 May cause multiple fee deductions
- TC-008-07: 🟡 Stress test, verify system stability
- TC-008-08/09: 🟡 Data consistency, doesn't affect on-chain true state
- TC-008-10/11: 🟡 User experience issue

**Launch Recommendations:**
- ✅ TC-008-01 and TC-008-04 **must pass** (prevent fund loss)
- ✅ TC-008-06 **must pass** (prevent multiple fee deductions)
- ⚠️ TC-008-11 should pass (prevent duplicate submission)
- 🟢 Other test failures can be documented or optimized
