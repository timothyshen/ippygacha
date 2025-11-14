# TC-003: Marketplace Trading Process

**Priority:** P0 - Core Function
**Risk Level:** 🟡 Medium Risk
**Test Time:** ~30 minutes

---

## Test Objective

Verify the complete process of NFT listing, purchasing, cancellation, and price updates.

---

## Background

### Marketplace Mechanism
```
Listing: User approve → listItem(tokenId, price)
Purchase: Other user buyItem() → IP transferred to seller
Withdraw: Seller withdrawProceeds() → Receive IP
```

### Data Structure
```solidity
struct Listing {
    uint256 price;
    address seller;
}
mapping(address => mapping(uint256 => Listing)) s_listings;
mapping(address => uint256) s_proceeds;  // Pending withdrawal amount
```

### Contract Address
- NFTMarketplace: `0x8D2729D9807E9FdD7d648BD3045c39B80aB2E5c7`

---

## Test Cases

### TC-003-01: List NFT
**Preconditions:**
- Own at least 1 revealed NFT
- Wallet has ≥0.01 IP (gas)

**Steps:**
1. Visit `/inventory`
2. Select an NFT
3. Click "List"
4. Enter price: 0.05 IP
5. Confirm `approve(marketplace)` transaction
6. Confirm `listItem()` transaction

**Expected Results:**
- ✅ Both transactions successful
- ✅ NFT appears on `/market` page
- ✅ Price displays correctly
- ✅ NFT marked as "Listed" in Inventory

**Actual Results:**
```
Transaction hash 1 (approve):
Transaction hash 2 (listItem):
Listed price:
[ ] Pass / [ ] Fail
```

---

### TC-003-02: Purchase NFT (Single Buyer)
**Preconditions:**
- At least 1 listing in marketplace
- Use different wallet (buyer ≠ seller)

**Steps:**
1. Visit `/market`
2. Find the listed NFT
3. Click "Buy"
4. Confirm transaction (pay listing price)

**Expected Results:**
- ✅ Transaction successful
- ✅ NFT transferred to buyer
- ✅ Seller's `proceeds` increased
- ✅ Listing automatically removed
- ✅ Buyer sees NFT in `/inventory`

**Actual Results:**
```
Transaction hash:
Buyer received NFT: [ ] Yes / [ ] No
Seller proceeds:
[ ] Pass / [ ] Fail
```

---

### TC-003-03: Seller Withdrawal
**Preconditions:**
- Completed TC-003-02
- Seller's `proceeds` > 0

**Steps:**
1. Seller visits `/market`
2. View "Pending withdrawal amount"
3. Click "Withdraw"
4. Confirm transaction

**Expected Results:**
- ✅ Transaction successful
- ✅ Seller wallet balance increased (= proceeds - gas)
- ✅ `proceeds` cleared to zero
- ✅ UI updated to show "0 IP pending withdrawal"

**Actual Results:**
```
Balance before withdrawal:
Balance after withdrawal:
Proceeds:
[ ] Pass / [ ] Fail
```

---

### TC-003-04: Cancel Listing
**Preconditions:**
- At least 1 NFT listed

**Steps:**
1. Visit `/inventory`
2. Select listed NFT
3. Click "Cancel listing"
4. Confirm transaction

**Expected Results:**
- ✅ Transaction successful
- ✅ NFT removed from marketplace
- ✅ NFT marked as "Unlisted" in Inventory
- ✅ Contract `s_listings[nftAddress][tokenId]` cleared

**Actual Results:**
```
Transaction hash:
Market status: [ ] Delisted / [ ] Still showing
[ ] Pass / [ ] Fail
```

---

### TC-003-05: Update Listing Price
**Preconditions:**
- At least 1 NFT listed

**Steps:**
1. Visit `/inventory`
2. Select listed NFT
3. Click "Modify price"
4. Enter new price: 0.08 IP
5. Confirm transaction

**Expected Results:**
- ✅ Transaction successful
- ✅ Marketplace page price updated
- ✅ No need to re-`approve`
- ✅ Listing still valid

**Actual Results:**
```
Transaction hash:
New price:
[ ] Pass / [ ] Fail
```

---

### TC-003-06: Seller Buying Own NFT (Should Fail)
**Preconditions:**
- Listed own NFT

**Steps:**
1. Don't switch wallet
2. Attempt to buy own NFT in `/market`

**Expected Results:**
- ✅ UI disables "Buy" button
- ✅ Or transaction reverts with: "Cannot buy your own NFT"

**Actual Results:**
```
UI status: [ ] Button disabled / [ ] Clickable
Transaction result: [ ] Reverted / [ ] Success (BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-003-07: Insufficient Payment (Should Fail)
**Preconditions:**
- Listing in marketplace (e.g., 0.05 IP)
- Buyer wallet balance <0.05 IP (only enough for gas)

**Steps:**
1. Attempt to purchase NFT
2. Observe error message

**Expected Results:**
- ✅ Transaction reverts
- ✅ Error message: "Insufficient balance"
- ✅ NFT still in marketplace

**Actual Results:**
```
Error message:
[ ] Pass / [ ] Fail
```

---

### TC-003-08: Duplicate Purchase (Should Fail)
**Preconditions:**
- Listing in marketplace

**Steps:**
1. Buyer A purchases NFT
2. Before transaction confirms
3. Buyer B also attempts to purchase same NFT

**Expected Results:**
- ✅ Only one transaction succeeds
- ✅ Other transaction reverts: "NFT already sold"
- ✅ Marketplace page auto-updates (listing disappears)

**Actual Results:**
```
Buyer A: [ ] Success / [ ] Fail
Buyer B: [ ] Success / [ ] Fail
[ ] Pass / [ ] Fail
```

---

## Event Scanning Tests

### TC-003-09: First Load Marketplace (Cold Start)
**Preconditions:**
- Clear localStorage
- ≥10 listings in marketplace

**Steps:**
1. Visit `/market`
2. Record loading time
3. Check Network panel (RPC call count)

**Expected Results:**
- ✅ Loading time <10 seconds
- ✅ Display all listings
- ✅ RPC calls: `getLogs` once for full scan

**Actual Results:**
```
Loading time:
RPC call count:
Listing count:
[ ] Pass / [ ] Fail
```

---

### TC-003-10: Incremental Cache Loading (Hot Start)
**Preconditions:**
- Completed TC-003-09
- localStorage has cache

**Steps:**
1. Refresh `/market` page
2. Record loading time

**Expected Results:**
- ✅ Loading time <2 seconds
- ✅ RPC calls: `getLogs` from cached block
- ✅ Incremental scan (10-360x speedup)

**Actual Results:**
```
Loading time:
RPC call count:
Cache hit: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-003-11: Cache Sync Test (Multiple Tabs)
**Preconditions:**
- Open two browser tabs
- Both tabs visit `/market`

**Steps:**
1. Tab A: Purchase an NFT
2. Wait for transaction confirmation
3. Tab B: Manual refresh

**Expected Results:**
- ✅ Tab A: Listing immediately disappears
- ✅ Tab B: Listing disappears after refresh
- ⚠️ Tab B won't auto-update (no WebSocket)

**Actual Results:**
```
Tab A: [ ] Updated / [ ] Not updated
Tab B: [ ] Updated / [ ] Not updated
[ ] Pass / [ ] Fail
```

---

## Code Location

### Frontend Hooks
- `hooks/marketplace/useMarketplace.ts` - Event scanning and caching
- `hooks/marketplace/useListingActions.ts` - List/cancel/update

### Contracts
- `contract/contracts/NFTMarketplace.sol` - Core logic

### UI Components
- `features/market/MarketplacePage.tsx` - Marketplace main page
- `features/market/MarketplaceBuyingModal.tsx` - Purchase modal
- `features/inventory/ListingModal.tsx` - Listing modal

---

## Performance Metrics

| Operation | Target Time | Actual Time | Status |
|------|---------|---------|------|
| First load marketplace | <10s |  | |
| Incremental load | <2s |  | |
| Listing transaction confirmation | <15s |  | |
| Purchase transaction confirmation | <10s |  | |

---

## Edge Cases

### TC-003-12: List at Price = 0 (Should Fail)
**Expected:**
- ✅ UI disables submit button
- ✅ Or contract reverts: "Price must be >0"

**Actual:**
```
[ ] Pass / [ ] Fail
```

---

### TC-003-13: List at Price = 1000000 IP (Extreme)
**Expected:**
- ✅ Transaction succeeds (no upper limit in contract)
- ⚠️ UI can add warning: "Price too high"

**Actual:**
```
[ ] Pass / [ ] Fail
```

---

### TC-003-14: List NFT Without Approval
**Expected:**
- ✅ UI guides user to approve first
- ✅ Or `listItem()` reverts: "Not approved"

**Actual:**
```
[ ] Pass / [ ] Fail
```

---

## Severity Assessment

**Impact if Failed:**
- TC-003-01/02/03: 🔴 Marketplace unusable, game economy collapses
- TC-003-04/05: 🟡 Affects user experience, but doesn't block trading
- TC-003-06/07/08: 🟡 Edge cases, but must have error handling
- TC-003-09/10: 🟡 Performance issue, but doesn't affect functionality
- TC-003-11: 🟢 Known limitation (no WebSocket), acceptable

**Launch Recommendations:**
- ✅ TC-003-01 to TC-003-08 must all pass
- ⚠️ TC-003-09/10 if >30s, need optimization
- ⚠️ TC-003-11 can document "manual refresh required"
