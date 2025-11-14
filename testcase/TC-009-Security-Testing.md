# TC-009: Security & Edge Case Testing

**Priority:** P2 - Security Protection
**Risk Level:** 🟡 Medium Risk
**Test Time:** ~30 minutes

---

## Test Objective

Verify system protection against malicious input, permission bypass, price manipulation and other attacks.

---

## Attack Scenario Tests

### TC-009-01: Zero Price Listing Attack
**Preconditions:**
- Own NFT

**Steps:**
1. Attempt to list NFT with price set to 0
2. Observe system response

**Expected Results:**
- ✅ Frontend disables "Submit" button
- ✅ Or contract reverts: "Price must be >0"
- ✅ Listing not created

**Actual Results:**
```
Frontend check: [ ] Blocked / [ ] Not blocked
Contract check: [ ] Blocked / [ ] Not blocked
[ ] Pass / [ ] Fail
```

---

### TC-009-02: Payment Amount Mismatch Attack
**Preconditions:**
- Listing in marketplace (price 0.05 IP)

**Steps:**
1. Use script to call contract directly:
   ```javascript
   await marketplace.buyItem(nftAddress, tokenId, {
     value: ethers.parseEther("0.01")  // ❌ Underpayment
   });
   ```

**Expected Results:**
- ✅ Transaction reverts: "Insufficient payment"
- ✅ NFT not transferred
- ✅ Seller doesn't receive payment

**Actual Results:**
```
Transaction status: [ ] Reverted / [ ] Success (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-009-03: Purchase Own NFT
**Preconditions:**
- Listed own NFT

**Steps:**
1. Don't switch wallet
2. Directly call `buyItem()`

**Expected Results:**
- ✅ Frontend disables button
- ✅ Or contract reverts: "Cannot buy your own NFT"

**Actual Results:**
```
Frontend check: [ ] Blocked / [ ] Not blocked
Contract check: [ ] Blocked / [ ] Not blocked
[ ] Pass / [ ] Fail
```

---

### TC-009-04: Reentrancy Attack Test
**Preconditions:**
- Need to deploy malicious contract

**Steps:**
1. Create malicious contract:
   ```solidity
   contract Attacker {
       function attack(address marketplace) external {
           marketplace.buyItem{value: 0.05 ether}(...);
       }

       receive() external payable {
           // Attempt reentrancy
           marketplace.buyItem{value: 0.05 ether}(...);
       }
   }
   ```
2. Call `attack()`

**Expected Results:**
- ✅ Contract uses `nonReentrant` modifier
- ✅ Reentrancy attack fails
- ✅ Only purchase NFT once

**Actual Results:**
```
Reentrancy protection: [ ] Exists / [ ] Doesn't exist
Attack result: [ ] Failed / [ ] Success (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-009-05: Unauthorized Listing of Others' NFT
**Preconditions:**
- User A owns NFT (tokenId=123)

**Steps:**
1. User B attempts to list User A's NFT:
   ```javascript
   await marketplace.listItem(nftAddress, 123, price);
   ```

**Expected Results:**
- ✅ Transaction reverts: "Not NFT owner"
- ✅ Listing not created

**Actual Results:**
```
Transaction status: [ ] Reverted / [ ] Success (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-009-06: Integer Overflow Attack
**Preconditions:**
- Use script to call contract

**Steps:**
1. Attempt to purchase extreme quantity of blindboxes:
   ```javascript
   await blindBox.purchaseBoxes(2**256 - 1);
   ```

**Expected Results:**
- ✅ Solidity 0.8+ automatic overflow protection
- ✅ Transaction reverts: "Arithmetic overflow"

**Actual Results:**
```
Transaction status: [ ] Reverted / [ ] Success
[ ] Pass / [ ] Fail
```

---

## API Security Tests

### TC-009-07: SQL Injection Test
**Preconditions:**
- API endpoint: `/api/users`

**Steps:**
1. Attempt malicious input:
   ```bash
   curl "/api/users?username=admin' OR '1'='1"
   ```

**Expected Results:**
- ✅ Prisma ORM automatic protection
- ✅ Return empty result or error
- ✅ Don't leak database structure

**Actual Results:**
```
Response:
Data leak: [ ] None / [ ] Yes (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-009-08: XSS Attack Test
**Preconditions:**
- User can set username

**Steps:**
1. Set username to:
   ```html
   <script>alert('XSS')</script>
   ```
2. Visit user profile page

**Expected Results:**
- ✅ React automatic escaping
- ✅ Don't execute JavaScript
- ✅ Display as plain text

**Actual Results:**
```
Display content:
JavaScript execution: [ ] No / [ ] Yes (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-009-09: CSRF Attack Test
**Preconditions:**
- User logged in

**Steps:**
1. Initiate request from external website:
   ```html
   <form action="http://localhost:3000/api/users" method="POST">
     <input name="username" value="hacker" />
   </form>
   ```

**Expected Results:**
- ✅ API verify origin
- ✅ Request rejected
- ⚠️ Or use CSRF token

**Actual Results:**
```
Request status: [ ] Rejected / [ ] Success
CSRF protection: [ ] Yes / [ ] No
[ ] Pass / [ ] Fail
```

---

### TC-009-10: Contract Owner Permission
**Preconditions:**
- Contract has `onlyOwner` functions

**Steps:**
1. Non-owner attempts to call:
   ```javascript
   await raffle.withdrawFunds();  // onlyOwner
   ```

**Expected Results:**
- ✅ Transaction reverts: "Ownable: caller is not the owner"

**Actual Results:**
```
Transaction status: [ ] Reverted / [ ] Success (Serious BUG!)
[ ] Pass / [ ] Fail
```

---

### TC-009-11: Negative Number Input Test
**Preconditions:**
- API endpoint accepts numeric parameter

**Steps:**
1. Attempt to purchase -1 blindboxes:
   ```javascript
   await blindBox.purchaseBoxes(-1);
   ```

**Expected Results:**
- ✅ TypeScript type check blocks
- ✅ Or contract `uint256` type blocks

**Actual Results:**
```
Frontend check: [ ] Blocked / [ ] Not blocked
Contract check: [ ] Blocked / [ ] Not blocked
[ ] Pass / [ ] Fail
```

---

### TC-009-12: Empty String/null Input
**Preconditions:**
- API endpoint accepts string

**Steps:**
1. Attempt to set username to empty:
   ```bash
   curl -X POST /api/users -d '{"username": ""}'
   ```

**Expected Results:**
- ✅ API validation blocks
- ✅ Return 400 Bad Request
- ✅ Error message: "Username cannot be empty"

**Actual Results:**
```
Status code:
Error message:
[ ] Pass / [ ] Fail
```

---

### TC-009-13: Error Message Leakage
**Preconditions:**
- None

**Steps:**
1. Trigger various errors (insufficient balance, unauthorized, etc.)
2. Check error message content

**Expected Results:**
- ✅ Don't leak database structure
- ✅ Don't leak file paths
- ✅ Don't leak contract internal logic
- ✅ Only return user-friendly error messages

**Actual Results:**
```
Error message examples:
Information leak: [ ] None / [ ] Yes
[ ] Pass / [ ] Fail
```

---

## Code Location

### Smart Contract Security
- `contract/contracts/NFTMarketplace.sol` - Reentrancy protection, permission check
- `contract/contracts/BlindBox.sol` - Overflow protection
- `contract/contracts/OnChainRaffle.sol` - Cooldown check

### API Security
- `app/api/*/route.ts` - Input validation, permission check

---


## Security Checklist

### Smart Contracts
- [ ] No reentrancy vulnerability (use `nonReentrant`)
- [ ] No integer overflow (Solidity 0.8+)
- [ ] Complete permission checks (`onlyOwner`, owner verification)
- [ ] Payment amount validation
- [ ] State modification before transfer (Checks-Effects-Interactions)

### API Endpoints
- [ ] Input validation (type, range, format)
- [ ] SQL injection protection (ORM)
- [ ] XSS protection (React automatic escaping)
- [ ] CSRF protection (token or SameSite cookie)
- [ ] Rate limiting (prevent DoS)

### Frontend
- [ ] Sensitive information not on client
- [ ] API key on server-side
- [ ] Error messages don't leak internal logic
- [ ] User input escaped

---

## Severity Assessment

**Impact if Failed:**
- TC-009-02/04/05: 🔴 Serious security vulnerability, may cause fund loss
- TC-009-07/08: 🟡 Medium risk, may cause data leak
- TC-009-13: 🟡 Information leak risk, recommend fix
- TC-009-01/03/06: 🟡 Edge cases, but should have protection
- Others: 🟢 Low risk, but best to fix

**Launch Recommendations:**
- ✅ TC-009-02/04/05/10 **must pass** (prevent fund loss and permission vulnerabilities)
- ⚠️ TC-009-07/08/13 should pass (prevent data leak)
- 🟢 Other test failures can be fixed in subsequent versions

---
