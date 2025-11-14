# TC-007: Contract Balance Monitoring

**Priority:** P0 - Critical for Game Operations
**Risk Level:** 🔴 Critical Risk
**Test Time:** ~15 minutes

---

## Test Objective

Verify contract balance monitoring mechanism ensures Raffle guaranteed return function doesn't crash due to insufficient balance.

---

## Background

### Raffle Economic Model
```
Per entry: 0.1 IP
Guaranteed return: 0.1 IP (paid immediately)
Additional reward: avg 0.09 IP (paid after VRF callback)
```

### Risks
- If contract balance <0.1 IP, user entry will fail
- If contract balance <additional reward, VRF callback will fail
- No balance monitoring = game suddenly becomes unplayable

---

## Test Cases

### TC-007-01: Query Contract Balance
**Preconditions:**
- Contract deployed

**Steps:**
1. Query using ethers.js:
   ```javascript
   const balance = await publicClient.getBalance(raffleAddress);
   console.log("Contract balance:", ethers.formatEther(balance), "IP");
   ```

**Expected Results:**
- ✅ Can successfully query balance
- ✅ Balance >0

**Actual Results:**
```
Contract balance:
[ ] Pass / [ ] Fail
```

---

### TC-007-02: Entry When Balance Insufficient (Should Fail)
**Preconditions:**
- Contract balance <0.1 IP

**Steps:**
1. Attempt to enter Raffle
2. Observe error handling

**Expected Results:**
- ✅ Transaction reverts
- ✅ Error message: "Insufficient contract balance"
- ✅ User's 0.1 IP not deducted

**Actual Results:**
```
Transaction status: [ ] Reverted / [ ] Success
Error message:
User balance: [ ] Not deducted / [ ] Deducted
[ ] Pass / [ ] Fail
```

---

### TC-007-03: Frontend Balance Check
**Preconditions:**
- Visit `/raffle`

**Steps:**
1. Check if page displays contract balance
2. Observe if there's balance warning

**Expected Results:**
- ✅ Display current contract balance
- ⚠️ If balance <10 IP, show warning: "Contract balance low"
- ⚠️ If balance <1 IP, disable entry button

**Actual Results:**
```
Balance display: [ ] Yes / [ ] No
Warning feature: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-007-04: VRF Callback Insufficient Balance
**Preconditions:**
- User entered Raffle
- VRF drew additional reward (e.g., +0.2 IP)
- Contract balance <0.2 IP

**Steps:**
1. Wait for VRF callback
2. Observe transaction result

**Expected Results:**
- ✅ Callback transaction reverts
- ⚠️ User already received guaranteed return (0.1 IP)
- ⚠️ Additional reward cannot be distributed
- ⚠️ Log event: "Reward distribution failed, insufficient balance"

**Actual Results:**
```
Callback status: [ ] Success / [ ] Fail
Guaranteed return: [ ] Received / [ ] Not received
Additional reward: [ ] Received / [ ] Not received
Event logged: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-007-05: Admin Recharge Contract
**Preconditions:**
- Contract has `receive()` function

**Steps:**
1. Use owner wallet to send IP:
   ```javascript
   await walletClient.sendTransaction({
     to: raffleAddress,
     value: ethers.parseEther("10")
   });
   ```

**Expected Results:**
- ✅ Transaction successful
- ✅ Contract balance increased by 10 IP

**Actual Results:**
```
Transaction hash:
Contract balance change:
[ ] Pass / [ ] Fail
```

---

### TC-007-06: Balance Depletion Scenario Simulation
**Preconditions:**
- Contract balance = 1 IP

**Steps:**
1. 10 users enter Raffle sequentially
2. Record contract balance after each entry
3. Observe when failures start

**Expected Results:**
- ✅ First N users succeed (N depends on balance)
- ✅ Subsequent users receive "insufficient balance" message
- ✅ No "deducted but not returned" situation

**Actual Results:**
```
Successful entries:
Failed entries:
Fund loss: [ ] None / [ ] Yes (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

## Balance Monitoring Mechanism

### TC-007-07: Auto Balance Alert (If Implemented)
**Preconditions:**
- Assume backend monitoring service exists

**Steps:**
1. Simulate balance dropping below threshold
2. Check if alert triggered

**Expected Results:**
- ✅ Balance <10 IP: Send warning email
- ✅ Balance <1 IP: Send emergency alert
- ✅ Balance <0.5 IP: Auto-pause game

**Actual Results:**
```
Monitoring system: [ ] Exists / [ ] Doesn't exist
Alert feature: [ ] Normal / [ ] Not triggered
[ ] Pass / [ ] Fail (acceptable, but recommended to add)
```

---

### TC-007-08: Emergency Pause Function
**Preconditions:**
- Contract has `pause()` function

**Steps:**
1. Owner calls `pause()`
2. Other users attempt to enter

**Expected Results:**
- ✅ Pause successful
- ✅ Users cannot enter
- ✅ Error message: "Game temporarily under maintenance"

**Actual Results:**
```
Pause function: [ ] Exists / [ ] Doesn't exist
User message: [ ] Friendly / [ ] Technical error
[ ] Pass / [ ] Fail
```

---

## Economic Simulation

### TC-007-09: 100 Users 7-Day Consumption
**Calculation:**
```
Assume cooldown = 6 hours
Daily draws per user: 24 / 6 = 4 times
Average consumption per draw: 0.09 IP (additional reward average)
Daily single user consumption: 4 * 0.09 = 0.36 IP
100 users daily consumption: 36 IP
7-day total consumption: 252 IP
```

**Assessment:**
- [ ] Initial balance sufficient for 7 days
- [ ] Need regular recharge
- [ ] Need dynamic reward ratio adjustment

---

### TC-007-10: Break-Even Point Analysis
**Calculation:**
```
User payment: 0.1 IP
Contract expenses:
  - Guaranteed return: 0.1 IP
  - Additional reward (expected value):
    * 10% * 0 = 0
    * 40% * 0.04 = 0.016
    * 30% * 0.12 = 0.036
    * 20% * 0.2 = 0.04
    * Total: 0.092 IP
  - NFT cost: Ignore (pre-minted)

Total expense: 0.192 IP
Net loss: 0.092 IP / draw
```

**Assessment:**
- 🔴 Each draw contract loses 0.092 IP
- 🔴 Need external funding (sponsorship, ads, other game profits)
- ⚠️ Or adjust reward ratios

---

## Code Location

### Contracts
- `contract/contracts/OnChainRaffle.sol` - Balance check logic
  ```solidity
  require(address(this).balance >= guaranteedReturn, "Insufficient balance");
  ```

### Frontend
- `hooks/raffle/useRaffleStats.ts` - Balance query
- `app/raffle/page.tsx` - Balance display

---

## Fix Recommendations

### Immediate Fix (Before Launch)
```solidity
// 1. Add balance check
function enterRaffle() external payable {
    require(msg.value == entryFee, "Incorrect fee");
    require(address(this).balance >= entryFee, "Insufficient contract balance");
    // ... other logic
}

// 2. Add emergency pause
bool public paused;
modifier whenNotPaused() {
    require(!paused, "Game paused");
    _;
}
```

### Frontend Improvements
```typescript
// Display contract balance
const contractBalance = await publicClient.getBalance(raffleAddress);

if (contractBalance < parseEther("1")) {
  return <Alert>Insufficient contract balance, cannot participate temporarily</Alert>;
}
```

---

## Linus's Review

> "A payment system without balance check is like a car without fuel gauge. You don't know when it will stop, but you know it will stop."

### Root Cause
- Assume contract balance is always sufficient
- No monitoring mechanism
- No emergency response plan

### Lesson
```
✅ Should do:
  1. Check balance before each transaction
  2. Frontend displays contract balance
  3. Disable feature when balance low
  4. Admin receives balance alerts

❌ Shouldn't:
  - Assume "I'll remember to recharge"
  - Wait for users to report "game broken" to discover
```

---

## Severity Assessment

**Impact if Balance Monitoring Not Implemented:**
- 🔴 Game suddenly becomes unavailable (terrible user experience)
- 🔴 Huge customer service pressure (can't explain "why can't play")
- 🔴 May cause fund loss (user pays but doesn't receive return)
- 🟡 Economic model unsustainable (0.092 IP loss per draw)

**Launch Recommendations:**
- ✅ Must add contract balance check (TC-007-02)
- ✅ Frontend display balance and warning (TC-007-03)
- ⚠️ Recommend adding pause function (TC-007-08)
- ⚠️ Recommend adding auto-monitoring (TC-007-07)
- 🔴 Must prepare sufficient funds (at least 100 IP)

---

## Test Data Recording

| Test Time | Contract Balance | User Count | Consumption Rate | Estimated Depletion Time |
|---------|---------|--------|---------|------------|
|         |         |        |         |            |

**Final Assessment:**
```
[ ] Balance monitoring complete, can launch
[ ] Missing balance monitoring, must add
```
