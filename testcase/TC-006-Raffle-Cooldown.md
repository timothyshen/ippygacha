# TC-006: Raffle Cooldown & Economics

**Priority:** P0 - Game Economy Collapse
**Risk Level:** 🔴 Critical Risk
**Test Time:** ~1 hour (need to wait for cooldown)

---

## Test Objective

Verify Raffle cooldown period is correctly implemented to prevent users from repeatedly drawing in short time, breaking game economics.

---

## Background

### Known BUG (Pending Fix)
```solidity
// contract/contracts/OnChainRaffle.sol:30
uint256 public constant COOLDOWN_PERIOD = 5 minutes;  // ❌ Should be 6 hours
```

### Raffle Mechanism
```
Entry fee: 0.1 IP
Guaranteed return: 0.1 IP (100%)
Additional rewards: VRF random draw
  - 40% chance: +40% (0.04 IP)
  - 30% chance: +120% + NFT (0.12 IP + 1 NFT)
  - 20% chance: +200% (0.2 IP)
Cooldown: Should be 6 hours, currently 5 minutes
```

### Economic Impact
If cooldown = 5 minutes:
- User can draw 12 times per hour
- Can draw 288 times per day
- Contract balance depletes in hours
- Game economy completely collapses

---

## Test Cases

### TC-006-01: First Raffle Entry
**Preconditions:**
- Wallet has ≥0.15 IP
- Never participated in Raffle

**Steps:**
1. Visit `/raffle`
2. Click "Enter raffle"
3. Pay 0.1 IP
4. Confirm transaction

**Expected Results:**
- ✅ Transaction successful
- ✅ Immediately receive 0.1 IP return (guaranteed return)
- ✅ Wait for VRF callback (additional reward)
- ✅ `userLastEntryTime[user]` recorded

**Actual Results:**
```
Transaction hash:
Guaranteed return: [ ] Received / [ ] Not received
VRF request: [ ] Success / [ ] Fail
[ ] Pass / [ ] Fail
```

---

### TC-006-02: Second Entry During Cooldown (Should Fail)
**Preconditions:**
- Completed TC-006-01
- <5 minutes since last entry (current setting)

**Steps:**
1. Immediately attempt to enter Raffle again
2. Observe error message

**Expected Results (Ideal - 6 hours):**
- ✅ UI displays: "Cooling down, need to wait X hours"
- ✅ Transaction button disabled
- ✅ If force send transaction, contract reverts: "CooldownNotElapsed"

**Actual Results (Current BUG - 5 minutes):**
```
Cooldown display:
UI status: [ ] Disabled / [ ] Clickable
Transaction result: [ ] Reverted / [ ] Success
[ ] As expected (6 hours) / [ ] BUG exists (5 minutes)
```

---

### TC-006-03: Entry After Cooldown
**Preconditions:**
- Completed TC-006-01
- Wait 5 minutes (current setting) or 6 hours (ideal setting)

**Steps:**
1. Wait for cooldown to end
2. Enter Raffle again

**Expected Results:**
- ✅ Transaction successful
- ✅ Receive guaranteed return again
- ✅ `userLastEntryTime[user]` updated

**Actual Results:**
```
Wait time:
Transaction status: [ ] Success / [ ] Fail
[ ] Pass / [ ] Fail
```

---

### TC-006-04: VRF Additional Reward Distribution
**Preconditions:**
- Completed TC-006-01
- VRF callback returned

**Steps:**
1. Wait for VRF callback
2. Check additional reward

**Expected Results:**
- ✅ 10% chance: No additional reward (only guaranteed return)
- ✅ 40% chance: +0.04 IP
- ✅ 30% chance: +0.12 IP + 1 NFT
- ✅ 20% chance: +0.2 IP
- ✅ Total probability = 100%

**Actual Results:**
```
Additional reward:
Amount:
NFT: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-006-05: Contract Balance Depleted Test
**Preconditions:**
- Contract balance <0.1 IP (insufficient for guaranteed return)

**Steps:**
1. Attempt to enter Raffle
2. Observe error

**Expected Results:**
- ✅ Transaction reverts
- ✅ Error message: "Insufficient contract balance"
- ⚠️ UI should check contract balance in advance and disable button

**Actual Results:**
```
Transaction result: [ ] Reverted / [ ] Success
Error message:
UI check: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-006-06: NFT Pool Depleted Test
**Preconditions:**
- Raffle NFT pool empty
- User draws "NFT reward"

**Steps:**
1. Enter Raffle
2. VRF returns "NFT reward" result
3. Observe handling

**Expected Results:**
- ✅ IP reward distributed normally
- ⚠️ NFT cannot be distributed (pool empty)
- ⚠️ Should log event: "NFT pool empty, cannot distribute"

**Actual Results:**
```
IP reward: [ ] Distributed / [ ] Not distributed
NFT reward: [ ] Distributed / [ ] Cannot distribute
Event logged: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

## Economic Stress Test

### TC-006-07: Rapid Repeated Drawing (Exploiting BUG)
**Preconditions:**
- Cooldown = 5 minutes (current BUG)
- Wallet has 1 IP

**Steps:**
1. Enter Raffle 10 times consecutively
2. Wait 5 minutes each time
3. Record contract balance changes

**Expected Impact (BUG Scenario):**
- ⚠️ Complete 10 draws in 50 minutes
- ⚠️ Contract pays 10 * 0.1 IP = 1 IP guaranteed return
- ⚠️ Contract also pays additional rewards (avg 0.09 IP/time)
- 🔴 Contract balance rapidly depletes

**Actual Results:**
```
Completed draws:
Total time:
Contract balance change:
[ ] Contract still has balance / [ ] Contract depleted
```

---

### TC-006-08: Normal Cooldown Economics Verification
**Preconditions:**
- Assume cooldown fixed to 6 hours

**Calculation:**
```
Draws per day: 24 / 6 = 4 times
Per user daily consumption: 4 * 0.09 IP (avg additional reward) = 0.36 IP
100 users daily consumption: 36 IP
```

**Assessment:**
- [ ] Contract balance can support 100 users for 1 week
- [ ] Need recharge mechanism
- [ ] Need dynamic reward ratio adjustment

---

## Code Location

### Contracts
```solidity
// contract/contracts/OnChainRaffle.sol:30
uint256 public constant COOLDOWN_PERIOD = 5 minutes;  // ❌ BUG

// Should be changed to:
uint256 public constant COOLDOWN_PERIOD = 6 hours;
```

### Frontend
- `hooks/raffle/useRaffleEntry.ts` - Entry logic
- `hooks/raffle/useRaffleStats.ts` - Cooldown display
- `app/raffle/page.tsx` - UI component

---

## Fix Recommendations

### Immediate Fix (Before Launch)
```solidity
// 1. Modify cooldown
- uint256 public constant COOLDOWN_PERIOD = 5 minutes;
+ uint256 public constant COOLDOWN_PERIOD = 6 hours;

// 2. Redeploy contract
```

### Frontend Supporting Changes
```typescript
// hooks/raffle/useRaffleStats.ts
const cooldownRemaining = useMemo(() => {
  const elapsed = Date.now() - lastEntryTime;
  const cooldown = 6 * 60 * 60 * 1000; // 6 hours in ms
  return Math.max(0, cooldown - elapsed);
}, [lastEntryTime]);
```

### Long-term Optimization
1. **Dynamic Cooldown:** Adjust cooldown based on contract balance
2. **Recharge Mechanism:** Allow admin to recharge contract balance
3. **Reward Decay:** Decrease additional reward probability with participation count
4. **NFT Pool Monitoring:** Auto-alert when NFT pool nearly depleted

---

## Linus's Review

> "A wrong constant destroys the entire game economy. This is why tests should verify business logic, not just whether code runs."

### Root Cause
- Set to 5 minutes during development for testing convenience
- Forgot to change back to 6 hours
- **No integration tests to verify economic logic**

### Lesson
```
✅ Should do: Write test to verify "maximum 4 draws in 24 hours"
❌ Shouldn't: Rely on developers remembering to change constant
```

---

## Severity Assessment

**Impact if Not Fixed:**
- 🔴 Game economy collapses within hours
- 🔴 Contract balance depletes, all transactions revert
- 🔴 Terrible user experience ("Why suddenly can't play?")
- 🔴 Need contract redeployment to fix

**Launch Recommendations:**
- ❌ Current state **absolutely cannot launch**
- ✅ Must fix to 6 hours and redeploy
- ✅ Add frontend balance check (early user warning)
- ✅ Add admin recharge functionality

---

## Test Data Recording

| Test Count | Cooldown | Success | Additional Reward | Notes |
|---------|---------|---------|---------|------|
| 1       |         |         |         |      |
| 2       |         |         |         |      |
| 3       |         |         |         |      |

**Final Assessment:**
```
[ ] Cooldown correct (6 hours)
[ ] Cooldown wrong (5 minutes) - Must fix before launch
```
