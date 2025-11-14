# TC-010: User Experience & Error Handling

**Priority:** P1 - Affects User Experience
**Risk Level:** 🟢 Low Risk
**Test Time:** ~20 minutes

---

## Test Objective

Verify users receive clear, friendly messages in various error scenarios.

---

## Error Message Tests

### TC-010-01: Insufficient Balance Error
**Preconditions:**
- Wallet balance <0.01 IP

**Steps:**
1. Attempt to purchase blindbox
2. Observe error message

**Expected Results:**
- ✅ Friendly message: "Insufficient balance, please recharge first"
- ✅ Provide recharge link or instructions
- ❌ Should not show: "execution reverted"

**Actual Results:**
```
Message text:
Friendliness: [ ] Friendly / [ ] Technical error / [ ] No message
[ ] Pass / [ ] Fail
```

---

### TC-010-02: Wallet Not Connected Error
**Preconditions:**
- Wallet not connected

**Steps:**
1. Attempt to purchase blindbox
2. Observe error handling

**Expected Results:**
- ✅ Auto-popup wallet connection window
- ✅ Or display: "Please connect wallet first"
- ✅ Provide "Connect Wallet" button

**Actual Results:**
```
Error handling: [ ] Auto-connect / [ ] Friendly message / [ ] No response
[ ] Pass / [ ] Fail
```

---

### TC-010-03: Network Error
**Preconditions:**
- Disconnect network

**Steps:**
1. Visit `/market`
2. Observe error message

**Expected Results:**
- ✅ Display: "Network connection failed, please check network"
- ✅ Provide "Retry" button
- ✅ Page doesn't crash (has Error Boundary)

**Actual Results:**
```
Message text:
Retry feature: [ ] Yes / [ ] No
Page status: [ ] Normal / [ ] White screen
[ ] Pass / [ ] Fail
```

---

### TC-010-04: Transaction Rejected
**Preconditions:**
- Wallet connected

**Steps:**
1. Click "Purchase blindbox"
2. Click "Reject" in wallet

**Expected Results:**
- ✅ Display: "Transaction canceled"
- ✅ Page state recovers (button clickable again)
- ❌ Should not stuck in "Loading" state

**Actual Results:**
```
Message text:
Page status: [ ] Recovered / [ ] Stuck
[ ] Pass / [ ] Fail
```

---

### TC-010-05: Gas Fee Estimation Failed
**Preconditions:**
- Network congestion or RPC issue

**Steps:**
1. Attempt to purchase blindbox
2. Observe gas estimation error

**Expected Results:**
- ✅ Display: "Gas estimation failed, please try again later"
- ✅ Provide "Retry" button
- ⚠️ Or use default gas limit

**Actual Results:**
```
Error handling: [ ] Friendly message / [ ] Technical error / [ ] Crash
[ ] Pass / [ ] Fail
```

---

## Loading State Tests

### TC-010-06: Transaction Waiting State
**Preconditions:**
- Wallet connected

**Steps:**
1. Click "Purchase blindbox"
2. Observe UI while waiting for transaction confirmation

**Expected Results:**
- ✅ Display loading animation
- ✅ Text: "Transaction confirming, please wait..."
- ✅ Button disabled (prevent duplicate clicks)
- ✅ Display transaction hash (clickable to view block explorer)

**Actual Results:**
```
Loading state: [ ] Yes / [ ] No
Button status: [ ] Disabled / [ ] Clickable
Transaction hash: [ ] Displayed / [ ] Not displayed
[ ] Pass / [ ] Fail
```

---

### TC-010-07: VRF Waiting State
**Preconditions:**
- Called `openBox()`, waiting for VRF callback

**Steps:**
1. Observe waiting UI after revealing blindbox

**Expected Results:**
- ✅ Display: "Revealing, estimated 5-10 minutes..."
- ✅ Display progress animation (spinning icon, etc.)
- ⚠️ If >30 minutes: Display "If not completed for long time, please contact support"

**Actual Results:**
```
Waiting message: [ ] Yes / [ ] No
Timeout message: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-010-08: Long List Loading (Pagination or Lazy Load)
**Preconditions:**
- Inventory has 100+ NFTs

**Steps:**
1. Visit `/inventory`
2. Scroll down

**Expected Results:**
- ✅ Initially load only first 20 (lazy load)
- ✅ Auto-load more when scrolling to bottom
- ✅ Display "Load more..." button or auto-load

**Actual Results:**
```
Loading method: [ ] Lazy load / [ ] Pagination / [ ] Load all at once
Performance: [ ] Smooth / [ ] Laggy
[ ] Pass / [ ] Fail
```

---

## Empty State Tests

### TC-010-09: Empty Inventory
**Preconditions:**
- New user, no NFTs

**Steps:**
1. Visit `/inventory`

**Expected Results:**
- ✅ Display: "You don't have any NFTs yet"
- ✅ Provide "Buy blindbox" button (guide user)
- ❌ Should not show blank page

**Actual Results:**
```
Empty state message: [ ] Yes / [ ] No
Guide button: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-010-10: Empty Marketplace
**Preconditions:**
- No listings in marketplace

**Steps:**
1. Visit `/market`

**Expected Results:**
- ✅ Display: "No items for sale"
- ✅ Provide "Refresh" button
- ⚠️ Or display "Coming soon" placeholder content

**Actual Results:**
```
Empty state message: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

## Input Validation Tests

### TC-010-11: Invalid Input Message
**Preconditions:**
- Visit list NFT page

**Steps:**
1. Enter "abc" (non-numeric) in price input
2. Observe validation message

**Expected Results:**
- ✅ Real-time display: "Please enter valid number"
- ✅ Submit button disabled
- ✅ Input field highlighted (red border)

**Actual Results:**
```
Validation message: [ ] Yes / [ ] No
Submit button: [ ] Disabled / [ ] Clickable
[ ] Pass / [ ] Fail
```

---

### TC-010-12: Price Range Warning
**Preconditions:**
- List NFT

**Steps:**
1. Enter price: 0.000001 IP (extremely low)
2. Enter price: 1000000 IP (extremely high)

**Expected Results:**
- ⚠️ Low price warning: "Price too low, may be hard to sell"
- ⚠️ High price warning: "Price too high, may be hard to sell"
- ✅ Allow submission (warning only, not mandatory)

**Actual Results:**
```
Low price warning: [ ] Yes / [ ] No
High price warning: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

## Success Feedback Tests

### TC-010-13: Transaction Success Message
**Preconditions:**
- Blindbox purchase successful

**Steps:**
1. Wait for transaction confirmation
2. Observe success message

**Expected Results:**
- ✅ Display success animation (✓ icon)
- ✅ Text: "Purchase successful!"
- ✅ Provide "View Inventory" or "Continue purchasing" button
- ⚠️ Auto-disappear after 3 seconds (not mandatory)

**Actual Results:**
```
Success message: [ ] Yes / [ ] No
Guide button: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-010-14: NFT Reveal Animation
**Preconditions:**
- Blindbox reveal successful

**Steps:**
1. Observe reveal animation and result display

**Expected Results:**
- ✅ Play unboxing animation (3-5 seconds)
- ✅ Display obtained NFT (image + name + rarity)
- ✅ Provide "View details" or "Continue revealing" button
- ⚠️ If rare NFT obtained, show special effects

**Actual Results:**
```
Animation smoothness: [ ] Smooth / [ ] Laggy
Information display: [ ] Complete / [ ] Missing
[ ] Pass / [ ] Fail
```
---

## Responsive Design Tests

### TC-010-15: Mobile Experience
**Preconditions:**
- Use phone or DevTools simulation

**Steps:**
1. Visit various pages
2. Check layout and interaction

**Expected Results:**
- ✅ Layout responsive (no horizontal scrollbar)
- ✅ Button size suitable for finger tap (≥44x44px)
- ✅ Font size readable (≥14px)
- ✅ Wallet connection works on mobile

**Actual Results:**
```
Layout: [ ] Normal / [ ] Broken
Interaction: [ ] Smooth / [ ] Difficult
[ ] Pass / [ ] Fail
```

---

## Severity Assessment

**Impact if Failed:**
- TC-010-01/02: 🟡 Basic experience, should fix
- TC-010-03/04/05: 🟡 Error handling, affects user trust
- TC-010-06/07: 🟡 Loading state, avoid user confusion
- TC-010-09/10: 🟢 Empty state optimization, doesn't affect functionality
- TC-010-13/14: 🟢 Success feedback, nice to have
- TC-010-15: 🟡 Mobile experience, depends on target users

**Launch Recommendations:**
- ✅ TC-010-01 to TC-010-07 should pass (basic experience)
- ⚠️ TC-010-15 if target users include mobile, must pass
- 🟢 Other test failures can be optimized in subsequent versions

---

## Test Data Recording

| Scenario | Message Text | Friendliness | Improvement Suggestions |
|------|---------|--------|---------|
| Insufficient balance |  |  | |
| Network error |  |  | |
| Transaction rejected |  |  | |
| Loading state |  |  | |

**Final Assessment:**
```
[ ] User experience good, can launch
[ ] Experience issues exist, recommend optimization
```
