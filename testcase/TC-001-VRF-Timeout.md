# TC-001: VRF Callback Timeout Handling

**Priority:** P0 - Cannot launch without fix
**Risk Level:** 🔴 Critical Risk
**Test Duration:** ~30 minutes

---

## Test Objective

Verify whether the system has timeout handling and retry mechanisms when the Entropy VRF provider is delayed or fails.

---

## Background

### VRF Workflow
```
1. User calls openBox(amount)
2. Contract calls Entropy.requestWithCallback()
3. Wait for Entropy provider to return random number
4. entropyCallback() is called, mint NFT
```

### Current Issues
- **No timeout handling:** If callback never comes, blind box is stuck forever
- **No status query:** Users cannot tell if it's "pending" or "failed"
- **No retry mechanism:** No manual trigger after callback failure

### Code Locations
- `hooks/blindbox/useBlindBox.ts` - `openBox()` function
- `contract/contracts/BlindBox.sol` - `entropyCallback()` function
- `contract/contracts/OnChainRaffle.sol` - same issue

---

## Test Cases

### TC-001-01: Normal VRF Callback
**Prerequisites:**
- Wallet has sufficient ETH
- Already purchased at least 1 blind box

**Steps:**
1. Call `openBox(1)`
2. Pay VRF fee
3. Wait for transaction confirmation
4. Wait 10 minutes (observe callback)

**Expected Results:**
- ✅ Transaction succeeds
- ✅ `entropyCallback()` is called within 10 minutes
- ✅ NFT appears in inventory
- ✅ UI shows "Revealing..." status

**Actual Results:**
```
[ ] Pass
[ ] Fail
Notes:
```

---

### TC-001-02: VRF Callback Delay (>30 minutes)
**Prerequisites:**
- TC-001-01 executed

**Steps:**
1. If no callback received within 30 minutes
2. Check contract state: `pendingBoxOpens[sequenceNumber]`
3. Check UI status display

**Expected Results:**
- ✅ Contract shows `processed = false` (pending)
- ✅ UI shows "Revealing, please wait..."
- ⚠️ Should have "If it takes more than 1 hour, contact support" prompt

**Actual Results:**
```
[ ] Pass
[ ] Fail
Current behavior:

Suggested fix:
```

---

### TC-001-03: Check Entropy Provider Status
**Prerequisites:**
- TC-001-01 executed

**Steps:**
1. Access Entropy contract: `0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a`
2. Call `getRequest(sequenceNumber)` to check request status
3. Check for `RequestFailed` events

**Expected Results:**
- ✅ Can query request
- ✅ Status is `Pending` or `Fulfilled`
- ❌ No `RequestFailed` events

**Actual Results:**
```
sequenceNumber:
Status:
Events:
```

---

### TC-001-04: Simulate VRF Failure Scenario
**Prerequisites:**
- Test network environment required

**Steps:**
1. Temporarily modify Entropy address to invalid address
2. Try `openBox(1)`
3. Observe error handling

**Expected Results:**
- ✅ Transaction reverts
- ✅ Shows friendly error: "VRF service temporarily unavailable"
- ✅ User's ETH and blind boxes are not deducted

**Actual Results:**
```
[ ] Pass
[ ] Fail
Error message:
```

---

### TC-001-05: Concurrent VRF Requests
**Prerequisites:**
- Wallet has sufficient ETH

**Steps:**
1. Quickly call `openBox(1)` three times consecutively
2. Observe if all three VRF requests are processed

**Expected Results:**
- ✅ All three requests succeed
- ✅ sequenceNumber increments (no conflicts)
- ✅ All three callbacks return correctly
- ✅ 3 NFTs are minted

**Actual Results:**
```
Request 1:
Request 2:
Request 3:
```

---

## Related Test Cases
- `TC-006-Raffle-Cooldown.md` - Raffle also uses VRF
- `TC-008-Concurrent-Operations.md` - Concurrent VRF requests

---

## Severity Assessment

**If This Test Fails, Impact:**
- 🔴 User's blind boxes can never be opened
- 🔴 User's ETH is deducted but cannot be refunded
- 🔴 Massive customer support pressure (unable to explain "why hasn't it opened")
- 🔴 Smart contract requires upgrade to fix (costly)

**Launch Recommendation:**
- ❌ If no timeout handling, **should not launch**
- ⚠️ Minimum requirement: Add UI prompt "If it takes more than 1 hour, contact support"
- ✅ Ideal solution: Implement complete timeout + retry + refund mechanism
