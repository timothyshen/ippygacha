# Beta Testing Execution Checklist

> "Testing is not to prove the code works, but to find where it will crash." — Linus

---

## Test Preparation

### Environment Setup
- [ ] 3 test wallets (simulate multi-user)
- [ ] Each wallet has ≥0.5 ETH (Sepolia)
- [ ] Contracts deployed and verified
- [ ] Frontend deployed to test environment
- [ ] Database state cleared

### Tool Setup
- [ ] Browser DevTools (Network, Console)
- [ ] Sepolia blockchain explorer (Etherscan)
- [ ] Test recording sheet (Excel or Google Sheets)
- [ ] Screenshot tool (record bugs)

---

## P0 - Must Pass to Launch

### 🔴 Critical Risk (1 failure = Cannot launch)

#### VRF & Blindbox System
- [ ] **TC-001-01**: VRF callback returns normally
- [ ] **TC-001-02**: VRF delay handling (>30 minutes)
- [ ] **TC-002-03**: Reveal blindbox successfully
- [ ] **TC-002-07**: Metadata loads correctly

#### Marketplace Core Process
- [ ] **TC-003-01**: List NFT successfully
- [ ] **TC-003-02**: Purchase NFT successfully
- [ ] **TC-003-03**: Seller withdrawal successful
- [ ] **TC-008-01**: Prevent double-spend attack

#### Raffle Economics
- [ ] **TC-006-01**: Raffle entry successful
- [ ] **TC-006-02**: Cooldown check (⚠️ Current BUG: 5 minutes)
- [ ] **TC-007-02**: Block when contract balance insufficient

#### Security Tests
- [ ] **TC-009-02**: Payment amount validation
- [ ] **TC-009-04**: Reentrancy attack protection
- [ ] **TC-009-05**: Owner permission check
- [ ] **TC-009-10**: Contract owner permission

---

## P1 - Affects Experience But Not Critical

### 🟡 Medium Risk (Can launch with these, but should fix)

#### Performance Tests
- [ ] **TC-004-01**: Marketplace cold start <15s
- [ ] **TC-004-02**: Marketplace hot start <3s

#### Concurrency Tests
- [ ] **TC-008-03**: Concurrent VRF request handling
- [ ] **TC-008-04**: Seller cancel vs buyer purchase race
- [ ] **TC-008-11**: Prevent duplicate submission

#### Contract Balance
- [ ] **TC-007-03**: Frontend balance check
- [ ] **TC-007-05**: Admin recharge successful

#### User Experience
- [ ] **TC-010-01**: Insufficient balance friendly message
- [ ] **TC-010-04**: Transaction rejected handling
- [ ] **TC-010-06**: Transaction waiting state

---

## P2 - Optimization Items (Can fix in subsequent versions)

### 🟢 Low Risk (Doesn't affect core functionality)

#### Edge Tests
- [ ] **TC-002-08**: Blindbox animation smoothness
- [ ] **TC-003-11**: Multi-tab cache sync
- [ ] **TC-010-09**: Empty Inventory message

#### Advanced Features
- [ ] **TC-007-07**: Auto balance alert (optional)
- [ ] **TC-010-15**: Mobile experience

---

## Test Execution Order

### Phase 1: Core Functions (1-2 hours)
```
1. TC-002: Blindbox purchase & reveal (20 min)
2. TC-003: Marketplace trading (30 min)
3. TC-006: Raffle cooldown (need to wait 5 min)
4. TC-001: VRF timeout handling (30 min)
```

### Phase 2: Security & Performance (1 hour)
```
5. TC-009: Security testing (30 min)
6. TC-004: Cache performance (20 min)
7. TC-007: Contract balance (15 min)
```

### Phase 3: Concurrency & Edge Cases (1 hour)
```
8. TC-008: Concurrent operations (30 min)
9. TC-010: User experience (20 min)
```

**Total:** 3-4 hours (depending on wait time)

---

## Quick Regression Test (After Each Update)

### 15-Minute Smoke Test
- [ ] Purchase 1 blindbox
- [ ] Reveal 1 blindbox
- [ ] List 1 NFT
- [ ] Purchase 1 NFT
- [ ] Enter Raffle once
- [ ] Check API Key not leaked

---

## Known BUG List

### 🔴 Must Fix Before Launch
1. **Raffle cooldown = 5 minutes**
   - Location: `contract/contracts/OnChainRaffle.sol:30`
   - Fix: Change to `6 hours`
   - Impact: Game economics collapse

2. **VRF no timeout handling**
   - Location: `hooks/blindbox/useBlindBox.ts`
   - Fix: Add timeout message (>1 hour)
   - Impact: User doesn't know if "waiting" or "failed"

### 🟡 Recommend Fix
3. **Marketplace no real-time update**
   - Location: `hooks/marketplace/useMarketplace.ts`
   - Fix: Add WebSocket or polling
   - Impact: Need manual refresh to see latest listings

4. **Contract balance no frontend check**
   - Location: `app/raffle/page.tsx`
   - Fix: Display contract balance and warning
   - Impact: Poor user experience when balance depleted

---

## Launch Criteria

### Must Meet (All Required)
- [ ] All P0 tests pass
- [ ] Raffle cooldown fixed to 6 hours
- [ ] VRF has timeout message
- [ ] Contract balance ≥100 IP (support initial operations)
- [ ] Reentrancy attack protection
- [ ] Permission control complete

### Recommend Meet (Enhance Experience)
- [ ] ≥80% P1 tests pass
- [ ] Marketplace cache optimization effective
- [ ] Friendly error messages
