# TC-004: Marketplace Cache Performance Test

**Priority:** P1 - Affects User Experience
**Risk Level:** 🟡 Medium Risk
**Test Time:** ~20 minutes

---

## Test Objective

Verify the Marketplace event scanning incremental cache mechanism ensures performance optimization works.

---

## Background

### Performance Optimization History
**Previous Issues:**
- Every load scanned events from `block 0`
- O(n) complexity, slower as listings increased
- 100+ listings took >30 seconds to load

**After Optimization:**
- Use localStorage to cache last scanned block number
- Only scan new blocks for events (incremental scan)
- Performance improvement: 10-360x

### Cache Mechanism
```typescript
localStorage.setItem('marketplace-cache', JSON.stringify({
  lastScannedBlock: 12345678,
  listings: [...],
  timestamp: Date.now()
}));
```

---

## Test Cases

### TC-004-01: First Load (Cold Start)
**Preconditions:**
- Clear localStorage
- ≥20 listings in marketplace

**Steps:**
1. Open browser DevTools → Network
2. Visit `/market`
3. Record loading time
4. Check RPC calls

**Expected Results:**
- ✅ Loading time <15 seconds
- ✅ Display all listings
- ✅ RPC call `eth_getLogs` once (from: "earliest")
- ✅ localStorage cache generated

**Actual Results:**
```
Loading time:
RPC call count:
Listing count:
Cache status: [ ] Generated / [ ] Not generated
[ ] Pass / [ ] Fail
```

---

### TC-004-02: Hot Start (With Cache)
**Preconditions:**
- Completed TC-004-01
- localStorage has cache

**Steps:**
1. Refresh `/market` page
2. Record loading time

**Expected Results:**
- ✅ Loading time <3 seconds (5-10x faster than cold start)
- ✅ RPC call `eth_getLogs` (from: lastScannedBlock)
- ✅ Only scan new blocks

**Actual Results:**
```
Loading time:
RPC call: [ ] Incremental / [ ] Full
Performance improvement: [ ] >5x / [ ] <5x
[ ] Pass / [ ] Fail
```

---

### TC-004-03: Cache Expiration (After 1 Hour)
**Preconditions:**
- localStorage has cache
- Cache timestamp >1 hour old

**Steps:**
1. Modify localStorage `timestamp`:
   ```javascript
   const cache = JSON.parse(localStorage.getItem('marketplace-cache'));
   cache.timestamp = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
   localStorage.setItem('marketplace-cache', JSON.stringify(cache));
   ```
2. Refresh page

**Expected Results:**
- ✅ Cache cleared
- ✅ Full scan restart (from: "earliest")
- ⚠️ Loading time returns to cold start level

**Actual Results:**
```
Cache status: [ ] Expired / [ ] Still valid
Scan method: [ ] Full / [ ] Incremental
[ ] Pass / [ ] Fail
```

---

### TC-004-04: Corrupted Cache Recovery
**Preconditions:**
- localStorage has cache

**Steps:**
1. Manually corrupt cache:
   ```javascript
   localStorage.setItem('marketplace-cache', '{invalid json}');
   ```
2. Refresh page

**Expected Results:**
- ✅ Detect corrupted cache
- ✅ Auto-clear cache
- ✅ Fallback to full scan
- ✅ Page loads normally (doesn't crash)

**Actual Results:**
```
Error handling: [ ] Normal / [ ] Crash
Page status: [ ] Normal / [ ] White screen
[ ] Pass / [ ] Fail
```

---

### TC-004-05: New Listing Incremental Update
**Preconditions:**
- localStorage has cache
- 20 listings in marketplace

**Steps:**
1. Don't refresh page
2. Another wallet lists 1 new NFT
3. Wait for transaction confirmation
4. Refresh `/market` page

**Expected Results:**
- ✅ Incremental scan detects new listing
- ✅ Listing count = 21
- ✅ Loading time <3 seconds

**Actual Results:**
```
Listing count:
New listing: [ ] Displayed / [ ] Not displayed
[ ] Pass / [ ] Fail
```

---

### TC-004-06: Cancel Listing Incremental Update
**Preconditions:**
- localStorage has cache
- 20 listings in marketplace

**Steps:**
1. Seller cancels 1 listing
2. Wait for transaction confirmation
3. Refresh `/market` page

**Expected Results:**
- ✅ Incremental scan detects `ItemCanceled` event
- ✅ Listing count = 19
- ✅ Canceled listing no longer displayed

**Actual Results:**
```
Listing count:
Canceled listing: [ ] Removed / [ ] Still showing
[ ] Pass / [ ] Fail
```

---

### TC-004-07: Purchase Incremental Update
**Preconditions:**
- localStorage has cache
- 20 listings in marketplace

**Steps:**
1. Buyer purchases 1 NFT
2. Wait for transaction confirmation
3. Refresh `/market` page

**Expected Results:**
- ✅ Incremental scan detects `ItemBought` event
- ✅ Listing count = 19
- ✅ Purchased listing no longer displayed

**Actual Results:**
```
Listing count:
Purchased listing: [ ] Removed / [ ] Still showing
[ ] Pass / [ ] Fail
```

---

## Performance Benchmark Tests

### TC-004-08: 100+ Listings Performance Test
**Preconditions:**
- Create 100 listings (test environment)

**Steps:**
1. Clear cache
2. Load `/market` (cold start)
3. Refresh page (hot start)

**Expected Results:**
| State | Loading Time | RPC Calls |
|-----|---------|---------|
| Cold start | <30s | 1 full scan |
| Hot start | <5s | 1 incremental |

**Actual Results:**
```
Cold start:
Hot start:
Performance improvement: [ ] >5x / [ ] <5x
[ ] Pass / [ ] Fail
```

---

### TC-004-09: RPC Call Optimization Verification
**Preconditions:**
- Completed TC-004-01

**Steps:**
1. Open DevTools → Network
2. Filter `eth_getLogs` calls
3. Check parameters

**Expected Results (Cold Start):**
```json
{
  "method": "eth_getLogs",
  "params": [{
    "fromBlock": "earliest",  // ✅ First full scan
    "toBlock": "latest",
    "address": "0x8D2729D9807E9FdD7d648BD3045c39B80aB2E5c7"
  }]
}
```

**Expected Results (Hot Start):**
```json
{
  "method": "eth_getLogs",
  "params": [{
    "fromBlock": "0x123456",  // ✅ From cached block
    "toBlock": "latest",
    "address": "0x8D2729D9807E9FdD7d648BD3045c39B80aB2E5c7"
  }]
}
```

**Actual Results:**
```
Cold start fromBlock:
Hot start fromBlock:
[ ] Pass / [ ] Fail
```

---

## Code Location

### Implementation Files
- `hooks/marketplace/useMarketplace.ts` - Cache logic

### Key Code
```typescript
// Incremental cache implementation
const cachedData = localStorage.getItem('marketplace-cache');
const fromBlock = cachedData?.lastScannedBlock || 'earliest';

const newEvents = await publicClient.getLogs({
  address: NFTMarketplaceAddress,
  fromBlock,
  toBlock: 'latest'
});

// Merge cache + new events
const allListings = [...cachedData.listings, ...processNewEvents(newEvents)];
```

---

## Edge Cases

### TC-004-10: Massive Listings (1000+)
**Steps:**
1. Assume marketplace has 1000+ listings
2. Test cold start performance

**Expected:**
- ⚠️ Loading time may be >60 seconds
- ⚠️ Need pagination or virtual scrolling

**Actual:**
```
Loading time:
Memory usage:
[ ] Acceptable / [ ] Needs optimization
```

---

### TC-004-11: Network Interruption Recovery
**Steps:**
1. Load marketplace page
2. Disconnect network
3. Reconnect
4. Refresh page

**Expected:**
- ✅ Use cache to quickly display old data
- ✅ Background update new data
- ✅ Display "Syncing..." message

**Actual:**
```
Cache: [ ] Used / [ ] Not used
Sync message: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

## Linus's Review

> "Caching is a good idea, but tests must verify it doesn't crash when cache expires. Simple solution: try-catch + fallback to full scan."

### Code Quality
```typescript
// ✅ Good practice
try {
  const cache = JSON.parse(localStorage.getItem('cache'));
  // ... use cache
} catch {
  // Cache corrupted, fallback to full scan
  fromBlock = 'earliest';
}

// ❌ Bad practice
const cache = JSON.parse(localStorage.getItem('cache')); // May throw exception
```

---

## Severity Assessment

**Impact if Failed:**
- TC-004-01/02: 🟡 Affects first experience, but doesn't block functionality
- TC-004-03/04: 🟡 Cache expires causing performance degradation, but still usable
- TC-004-05/06/07: 🟡 Data out of sync, but refresh resolves it
- TC-004-08: 🟡 Performance issue with many listings
- TC-004-09/10/11: 🟢 Edge cases, doesn't affect most users

**Launch Recommendations:**
- ✅ TC-004-01/02 must pass (core optimization)
- ⚠️ TC-004-04 must pass (prevent crash)
- ⚠️ TC-004-08 if >60s, need pagination
- 🟢 Other test failures can be documented

---

## Performance Data Recording

| Listing Count | Cold Start | Hot Start | Improvement Multiple |
|---------|--------|--------|---------|
| 10      |        |        |         |
| 50      |        |        |         |
| 100     |        |        |         |
| 1000    |        |        |         |

**Optimization Success Criteria:**
- [ ] Hot start >5x improvement
- [ ] 100 listings <5s loading
- [ ] Friendly message on cache expiration
