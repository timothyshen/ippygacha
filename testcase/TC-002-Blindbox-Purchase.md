# TC-002: Blindbox Purchase & Reveal Process

**Priority:** P0 - Core Function
**Risk Level:** 🟡 Medium Risk
**Test Time:** ~20 minutes

---

## Test Objective

Verify that users can purchase blindboxes, pay fees, reveal NFTs, and see results in Inventory.

---

## Background

### Blindbox Mechanism
```
Blindbox Token ID = 1 (ERC1155)
NFT Token ID = [0, 1000000) (ERC1155)
```

### Process
```
1. purchaseBoxes(amount) - Mint token ID=1
2. openBox(amount) - Pay VRF fee
3. entropyCallback() - Randomly assign NFT
4. Metadata loaded from Alchemy API
```

### Contract Addresses
- BlindBox: `0x87d3FEE94B8306702Dfdba539c0BACAC0985594B`
- IPPYNFT: `0x702097673370e14F5b8a77dB55d2799D136767Bd`

---

## Test Cases

### TC-002-01: Purchase 1 Blindbox
**Preconditions:**
- Wallet connected successfully
- Wallet has ≥0.1 ETH

**Steps:**
1. Visit `/gacha`
2. Select purchase quantity: 1
3. Click "Purchase"
4. Confirm wallet transaction
5. Wait for transaction confirmation

**Expected Results:**
- ✅ Transaction successful
- ✅ UI shows "Purchase successful"
- ✅ Blindbox count +1
- ✅ Wallet balance decreased (gas fee)
- ✅ Contract `balanceOf(user, 1)` = 1

**Actual Results:**
```
Transaction hash:
Gas consumed:
Blindbox quantity:
[ ] Pass / [ ] Fail
```

---

### TC-002-03: Reveal 1 Blindbox
**Preconditions:**
- Own at least 1 blindbox

**Steps:**
1. Click "Reveal" button
2. View VRF fee display
3. Confirm transaction
4. Wait for VRF callback

**Expected Results:**
- ✅ Display estimated VRF fee (e.g., 0.001 ETH)
- ✅ Transaction successful
- ✅ Receive callback within 10 minutes
- ✅ NFT appears in `/inventory`
- ✅ Blindbox count -1

**Actual Results:**
```
VRF fee:
Callback delay:
NFT Token ID:
[ ] Pass / [ ] Fail
```

---

### TC-002-05: Insufficient Balance for Purchase
**Preconditions:**
- Wallet balance <0.01 ETH (only enough for gas)

**Steps:**
1. Attempt to purchase blindbox
2. Observe error message

**Expected Results:**
- ✅ Transaction reverts
- ✅ Display friendly error: "Insufficient balance"
- ✅ Wallet balance unchanged

**Actual Results:**
```
Error message:
[ ] Pass / [ ] Fail
```

---

### TC-002-06: Insufficient VRF Fee
**Preconditions:**
- Own blindbox
- Wallet balance < VRF fee

**Steps:**
1. Attempt to reveal blindbox
2. Observe error message

**Expected Results:**
- ✅ Transaction reverts
- ✅ Error message: "Insufficient VRF fee, need X ETH"
- ✅ Blindbox quantity unchanged

**Actual Results:**
```
Error message:
[ ] Pass / [ ] Fail
```

---

### TC-002-07: Metadata Loading
**Preconditions:**
- Revealed at least 1 NFT

**Steps:**
1. Visit `/inventory`
2. Observe NFT card
3. Check image, name, rarity

**Expected Results:**
- ✅ Image loads successfully (IPFS)
- ✅ Display name (e.g., "IPPY #12345")
- ✅ Display rarity (Common/Rare/Epic/Legendary)
- ✅ Loading time <3 seconds

**Actual Results:**
```
Loading time:
Image status: [ ] Success / [ ] Fail / [ ] Loading
Metadata completeness: [ ] Complete / [ ] Missing fields
```

---

### TC-002-08: Blindbox Animation Effect
**Preconditions:**
- Completed TC-002-03

**Steps:**
1. Observe reveal animation
2. Check for lag

**Expected Results:**
- ✅ Animation smooth (60fps)
- ✅ Sound effects normal (if any)
- ✅ Auto-navigate to results page after animation

**Actual Results:**
```
Animation smoothness: [ ] Smooth / [ ] Laggy / [ ] Crash
[ ] Pass / [ ] Fail (acceptable P1 issue)
```

---


## Code Location

### Frontend Hooks
- `hooks/blindbox/useBlindBox.ts` - Purchase and reveal logic
- `hooks/metadata/useMetadata.ts` - Metadata caching

### Contracts
- `contract/contracts/BlindBox.sol` - Core logic
- `contract/contracts/IPPYNFT.sol` - NFT minting

### UI Components
- `features/gacha/GachaMachine.tsx` - Main interface
- `features/gacha/PullAnimation.tsx` - Reveal animation

---

## Edge Cases

### TC-002-09: Purchase 0 Blindboxes
**Expected:**
- ❌ Should disable button or show error

**Actual:**
```
[ ] Button disabled
[ ] Show error
[ ] Transaction failed
```

---

### TC-002-10: Purchase 100 Blindboxes (Stress Test)
**Expected:**
- ⚠️ May exceed gas limit
- ⚠️ UI should limit maximum quantity

**Actual:**
```
Maximum allowed quantity:
Gas limit:
[ ] Pass / [ ] Fail
```

---

## Regression Test Checkpoints

### Previously Known Issues (Fixed)
- ✅ Alchemy API key exposure (moved to server-side)
- ✅ Metadata TypeScript type error (fixed)

### Fixes to Verify
1. Visit `/api/metadata?nftAddress=XXX&tokenId=123`
2. Check response header: `x-rate-limit-remaining`
3. Confirm no API key in client code

**Results:**
```
[ ] API key secure
[ ] Rate limit normal
```

---

## Performance Metrics

| Operation | Target Time | Actual Time | Status |
|------|---------|---------|------|
| Purchase blindbox transaction confirmation | <10s |  | |
| VRF callback return | <10min |  | |
| Metadata loading | <3s |  | |
| Page rendering | <1s |  | |

---

## Severity Assessment

**Impact if Failed:**
- TC-002-01/02: 🔴 Core function unusable
- TC-002-03/04: 🔴 Cannot reveal blindbox, game unplayable
- TC-002-05/06: 🟡 Edge case, but must have friendly prompt
- TC-002-07: 🟡 Affects user experience, but doesn't block gameplay
- TC-002-08: 🟢 Visual issue only, acceptable for launch

**Launch Recommendations:**
- ✅ TC-002-01 to TC-002-07 must all pass
- ⚠️ TC-002-08 can have minor issues (animation lag acceptable)
- ⚠️ TC-002-09/10 edge cases at minimum need UI disabled
