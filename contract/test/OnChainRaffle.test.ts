import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { OnChainRaffle, MockEntropyV2 } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("OnChainRaffle with Pyth Entropy", function () {
  let raffle: OnChainRaffle;
  let mockEntropy: MockEntropyV2;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  const ENTRY_PRICE = ethers.parseEther("0.1");
  const COOLDOWN_PERIOD = 5 * 60; // 5 minutes
  const ONE_MILLION = 1_000_000;

  /**
   * Bonus distribution from contract:
   * - Bonus 0: 40% payout, 0.7% chance (probPpm: 7_000), no NFT
   * - Bonus 1: 120% payout, 0.18% chance (probPpm: 1_800), with NFT
   * - Bonus 2: 200% payout, 0.02% chance (probPpm: 200), no NFT
   * Total bonus probability: 0.9% (9_000 ppm)
   */
  const BONUS_OUTCOMES = {
    BONUS_40_PERCENT: {
      ppmRange: [0, 7_000],
      payout: 400_000, // 40% in ppm
      hasNFT: false,
    },
    BONUS_120_PERCENT: {
      ppmRange: [7_000, 8_800], // 7_000 + 1_800
      payout: 1_200_000, // 120% in ppm
      hasNFT: true,
    },
    BONUS_200_PERCENT: {
      ppmRange: [8_800, 9_000], // 8_800 + 200
      payout: 2_000_000, // 200% in ppm
      hasNFT: false,
    },
    NO_BONUS: {
      ppmRange: [9_000, ONE_MILLION],
      payout: 0,
      hasNFT: false,
    },
  };

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy MockEntropyV2
    const MockEntropyFactory = await ethers.getContractFactory("MockEntropyV2");
    mockEntropy = await MockEntropyFactory.deploy();
    await mockEntropy.waitForDeployment();

    // Deploy OnChainRaffle with mock entropy
    const RaffleFactory = await ethers.getContractFactory("OnChainRaffle");
    raffle = await RaffleFactory.deploy(
      await mockEntropy.getAddress(),
      ethers.ZeroAddress // NFT contract (not used in this test)
    );
    await raffle.waitForDeployment();

    // Fund the raffle contract for payouts
    await owner.sendTransaction({
      to: await raffle.getAddress(),
      value: ethers.parseEther("100"),
    });
  });

  describe("Basic Raffle Entry", function () {
    it("Should allow user to enter raffle", async function () {
      const tx = await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });
      await tx.wait();

      // Check user received guaranteed return immediately
      const userStats = await raffle.getUserStats(user1.address);
      expect(userStats.totalUserEntries).to.equal(1n);
      expect(userStats.totalWinnings).to.equal(ENTRY_PRICE); // 100% guaranteed return
    });

    it("Should enforce cooldown period", async function () {
      // First entry
      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });

      // Try immediate second entry - should fail
      await expect(
        raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE })
      ).to.be.revertedWith("Cooldown period not elapsed");

      // Fast forward time
      await time.increase(COOLDOWN_PERIOD);

      // Second entry should succeed now
      await expect(
        raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE })
      ).to.not.be.reverted;
    });
  });

  describe("Entropy Callback - Different Outcomes", function () {
    let sequenceNumber: bigint;

    beforeEach(async function () {
      // Enter raffle
      const tx = await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });
      const receipt = await tx.wait();

      // Extract sequence number from DrawRequested event
      const drawEvent = receipt?.logs.find(
        (log: any) => log.fragment?.name === "DrawRequested"
      );
      sequenceNumber = drawEvent?.args?.sequenceNumber;
    });

    it("Should give 40% bonus (Outcome 1)", async function () {
      // Generate random number that results in 40% bonus (ppm < 7,000)
      const randomPpm = 3500; // Middle of [0, 7,000) range
      const randomNumber = ethers.zeroPadValue(
        ethers.toBeHex(randomPpm),
        32
      );

      const initialWinnings = (await raffle.getUserStats(user1.address))
        .totalWinnings;

      // Fulfill the request
      await expect(
        mockEntropy.fulfillRequest(sequenceNumber, randomNumber)
      ).to.emit(raffle, "PrizeAwarded");

      // Verify user received 40% bonus
      const expectedBonus = (ENTRY_PRICE * 400_000n) / BigInt(ONE_MILLION);
      const finalWinnings = (await raffle.getUserStats(user1.address))
        .totalWinnings;

      expect(finalWinnings - initialWinnings).to.equal(expectedBonus);
    });

    it("Should give 120% bonus + NFT (Outcome 2)", async function () {
      // Need to deposit NFT first
      const MockNFT = await ethers.getContractFactory("MockERC721");
      const nft = await MockNFT.deploy("Test NFT", "TNFT");
      await nft.waitForDeployment();

      // Mint and deposit NFT
      const mintTx = await nft.mint(owner.address);
      await mintTx.wait();
      const tokenId = 1n; // First token minted
      await nft.approve(await raffle.getAddress(), tokenId);
      await raffle.depositNFTs(await nft.getAddress(), [tokenId]);

      // Generate random number that results in 120% bonus + NFT (7,000 <= ppm < 8,800)
      const randomPpm = 7500; // Middle of [7,000, 8,800) range
      const randomNumber = ethers.zeroPadValue(
        ethers.toBeHex(randomPpm),
        32
      );

      const initialWinnings = (await raffle.getUserStats(user1.address))
        .totalWinnings;

      // Fulfill the request
      await mockEntropy.fulfillRequest(sequenceNumber, randomNumber);

      // Verify user received 120% bonus
      const expectedBonus = (ENTRY_PRICE * 1_200_000n) / BigInt(ONE_MILLION);
      const finalWinnings = (await raffle.getUserStats(user1.address))
        .totalWinnings;

      expect(finalWinnings - initialWinnings).to.equal(expectedBonus);

      // Verify NFT was transferred
      expect(await nft.ownerOf(tokenId)).to.equal(user1.address);
    });

    it("Should give 200% bonus (Outcome 3)", async function () {
      // Generate random number that results in 200% bonus (8,800 <= ppm < 9,000)
      const randomPpm = 8900; // Middle of [8,800, 9,000) range
      const randomNumber = ethers.zeroPadValue(
        ethers.toBeHex(randomPpm),
        32
      );

      const initialWinnings = (await raffle.getUserStats(user1.address))
        .totalWinnings;

      // Fulfill the request
      await mockEntropy.fulfillRequest(sequenceNumber, randomNumber);

      // Verify user received 200% bonus
      const expectedBonus = (ENTRY_PRICE * 2_000_000n) / BigInt(ONE_MILLION);
      const finalWinnings = (await raffle.getUserStats(user1.address))
        .totalWinnings;

      expect(finalWinnings - initialWinnings).to.equal(expectedBonus);
    });

    it("Should give no bonus (No Outcome)", async function () {
      // Generate random number that results in no bonus (ppm >= 9,000)
      const randomPpm = 500_000; // Well outside bonus range
      const randomNumber = ethers.zeroPadValue(
        ethers.toBeHex(randomPpm),
        32
      );

      const initialWinnings = (await raffle.getUserStats(user1.address))
        .totalWinnings;

      // Fulfill the request
      await mockEntropy.fulfillRequest(sequenceNumber, randomNumber);

      // Verify user received no additional bonus (only guaranteed return from before)
      const finalWinnings = (await raffle.getUserStats(user1.address))
        .totalWinnings;

      expect(finalWinnings).to.equal(initialWinnings);
    });
  });

  describe("Multiple Users - Different Outcomes", function () {
    it("Should give different users different outcomes", async function () {
      // User 1 enters
      const tx1 = await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });
      const receipt1 = await tx1.wait();
      const seq1 = receipt1?.logs.find(
        (log: any) => log.fragment?.name === "DrawRequested"
      )?.args?.sequenceNumber;

      // Fast forward for cooldown
      await time.increase(COOLDOWN_PERIOD + 1);

      // User 2 enters
      const tx2 = await raffle.connect(user2).enterRaffle({ value: ENTRY_PRICE });
      const receipt2 = await tx2.wait();
      const seq2 = receipt2?.logs.find(
        (log: any) => log.fragment?.name === "DrawRequested"
      )?.args?.sequenceNumber;

      // Fast forward for cooldown
      await time.increase(COOLDOWN_PERIOD + 1);

      // User 3 enters
      const tx3 = await raffle.connect(user3).enterRaffle({ value: ENTRY_PRICE });
      const receipt3 = await tx3.wait();
      const seq3 = receipt3?.logs.find(
        (log: any) => log.fragment?.name === "DrawRequested"
      )?.args?.sequenceNumber;

      // Fulfill with different outcomes
      // User 1: 40% bonus (randomPpm = 3000)
      const random1 = ethers.zeroPadValue(ethers.toBeHex(3000), 32);
      await mockEntropy.fulfillRequest(seq1, random1);

      // User 2: No bonus (randomPpm = 50000)
      const random2 = ethers.zeroPadValue(ethers.toBeHex(50000), 32);
      await mockEntropy.fulfillRequest(seq2, random2);

      // User 3: 200% bonus (randomPpm = 8900)
      const random3 = ethers.zeroPadValue(ethers.toBeHex(8900), 32);
      await mockEntropy.fulfillRequest(seq3, random3);

      // Verify each user got different outcomes
      const user1Stats = await raffle.getUserStats(user1.address);
      const user2Stats = await raffle.getUserStats(user2.address);
      const user3Stats = await raffle.getUserStats(user3.address);

      // User 1: guaranteed (100%) + bonus (40%) = 140%
      const expected1 = (ENTRY_PRICE * 1_400_000n) / BigInt(ONE_MILLION);
      expect(user1Stats.totalWinnings).to.equal(expected1);

      // User 2: guaranteed (100%) only = 100%
      expect(user2Stats.totalWinnings).to.equal(ENTRY_PRICE);

      // User 3: guaranteed (100%) + bonus (200%) = 300%
      const expected3 = (ENTRY_PRICE * 3_000_000n) / BigInt(ONE_MILLION);
      expect(user3Stats.totalWinnings).to.equal(expected3);

      console.log("\n=== Different Outcomes Test ===");
      console.log(
        `User 1 winnings: ${ethers.formatEther(user1Stats.totalWinnings)} ETH (140%)`
      );
      console.log(
        `User 2 winnings: ${ethers.formatEther(user2Stats.totalWinnings)} ETH (100%)`
      );
      console.log(
        `User 3 winnings: ${ethers.formatEther(user3Stats.totalWinnings)} ETH (300%)`
      );
    });
  });

  describe("Probability Distribution Verification", function () {
    it("Should demonstrate outcome distribution over multiple entries", async function () {
      const outcomes = {
        bonus40: 0,
        bonus120: 0,
        bonus200: 0,
        noBonus: 0,
      };

      const testCases = [
        { ppm: 1000, expected: "bonus40" }, // 40% bonus
        { ppm: 5000, expected: "bonus40" },
        { ppm: 7500, expected: "bonus120" }, // 120% bonus
        { ppm: 8850, expected: "bonus200" }, // 200% bonus
        { ppm: 10000, expected: "noBonus" }, // No bonus
        { ppm: 50000, expected: "noBonus" },
        { ppm: 100000, expected: "noBonus" },
        { ppm: 500000, expected: "noBonus" },
      ];

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        // Create new user for each test
        const [newUser] = await ethers.getSigners();
        const userAddress = await ethers.Wallet.createRandom().getAddress();
        await owner.sendTransaction({
          to: userAddress,
          value: ethers.parseEther("1"),
        });

        const signer = await ethers.getImpersonatedSigner(userAddress);

        // Fast forward for cooldown
        if (i > 0) await time.increase(COOLDOWN_PERIOD + 1);

        // Enter raffle
        const tx = await raffle.connect(signer).enterRaffle({ value: ENTRY_PRICE });
        const receipt = await tx.wait();

        const seqNum = receipt?.logs.find(
          (log: any) => log.fragment?.name === "DrawRequested"
        )?.args?.sequenceNumber;

        const initialWinnings = (await raffle.getUserStats(userAddress))
          .totalWinnings;

        // Fulfill with specific random number
        const randomNumber = ethers.zeroPadValue(
          ethers.toBeHex(testCase.ppm),
          32
        );
        await mockEntropy.fulfillRequest(seqNum, randomNumber);

        const finalWinnings = (await raffle.getUserStats(userAddress))
          .totalWinnings;
        const bonusWon = finalWinnings - initialWinnings;

        // Categorize outcome
        if (bonusWon === 0n) {
          outcomes.noBonus++;
        } else {
          const bonusPercent = (bonusWon * BigInt(ONE_MILLION)) / ENTRY_PRICE;
          if (bonusPercent === 400_000n) outcomes.bonus40++;
          else if (bonusPercent === 1_200_000n) outcomes.bonus120++;
          else if (bonusPercent === 2_000_000n) outcomes.bonus200++;
        }
      }

      console.log("\n=== Outcome Distribution ===");
      console.log(`40% Bonus:  ${outcomes.bonus40} times`);
      console.log(`120% Bonus: ${outcomes.bonus120} times`);
      console.log(`200% Bonus: ${outcomes.bonus200} times`);
      console.log(`No Bonus:   ${outcomes.noBonus} times`);

      // Verify we got the expected outcomes
      expect(outcomes.bonus40).to.equal(2);
      expect(outcomes.bonus120).to.equal(1);
      expect(outcomes.bonus200).to.equal(1);
      expect(outcomes.noBonus).to.equal(4);
    });
  });

  describe("Statistical Distribution - 100 Random Draws", function () {
    it("Should demonstrate realistic outcome distribution over 100 random draws", async function () {
      this.timeout(120000); // Increase timeout for 100 draws

      const outcomes = {
        bonus40: 0,
        bonus120: 0,
        bonus200: 0,
        noBonus: 0,
      };

      const totalDraws = 100;
      console.log(`\n=== Running ${totalDraws} Random Draws ===`);

      for (let i = 0; i < totalDraws; i++) {
        // Create new user for each draw
        const userAddress = await ethers.Wallet.createRandom().getAddress();
        await owner.sendTransaction({
          to: userAddress,
          value: ethers.parseEther("1"),
        });
        const signer = await ethers.getImpersonatedSigner(userAddress);

        // Fast forward for cooldown
        if (i > 0) await time.increase(COOLDOWN_PERIOD + 1);

        // Enter raffle
        const tx = await raffle.connect(signer).enterRaffle({ value: ENTRY_PRICE });
        const receipt = await tx.wait();

        const seqNum = receipt?.logs.find(
          (log: any) => log.fragment?.name === "DrawRequested"
        )?.args?.sequenceNumber;

        const initialWinnings = (await raffle.getUserStats(userAddress))
          .totalWinnings;

        // Generate truly random number using block hash and iteration
        // Simulate what Pyth Entropy would provide
        const randomSeed = ethers.keccak256(
          ethers.solidityPacked(
            ["uint256", "uint256", "address", "uint256"],
            [i, await ethers.provider.getBlockNumber(), userAddress, Date.now()]
          )
        );
        const randomPpm = BigInt(randomSeed) % BigInt(ONE_MILLION);
        const randomNumber = ethers.zeroPadValue(ethers.toBeHex(randomPpm), 32);

        // Fulfill with random number
        await mockEntropy.fulfillRequest(seqNum, randomNumber);

        const finalWinnings = (await raffle.getUserStats(userAddress))
          .totalWinnings;
        const bonusWon = finalWinnings - initialWinnings;

        // Categorize outcome
        if (bonusWon === 0n) {
          outcomes.noBonus++;
        } else {
          const bonusPercent = (bonusWon * BigInt(ONE_MILLION)) / ENTRY_PRICE;
          if (bonusPercent === 400_000n) outcomes.bonus40++;
          else if (bonusPercent === 1_200_000n) outcomes.bonus120++;
          else if (bonusPercent === 2_000_000n) outcomes.bonus200++;
        }

        // Progress indicator every 20 draws
        if ((i + 1) % 20 === 0) {
          console.log(`Progress: ${i + 1}/${totalDraws} draws completed`);
        }
      }

      console.log("\n=== Final Distribution (100 Random Draws) ===");
      console.log(`40% Bonus:  ${outcomes.bonus40} times (${(outcomes.bonus40 / totalDraws * 100).toFixed(2)}%)`);
      console.log(`   Expected: ~0.7% (7,000 out of 1,000,000 PPM)`);
      console.log(`120% Bonus: ${outcomes.bonus120} times (${(outcomes.bonus120 / totalDraws * 100).toFixed(2)}%)`);
      console.log(`   Expected: ~0.18% (1,800 out of 1,000,000 PPM)`);
      console.log(`200% Bonus: ${outcomes.bonus200} times (${(outcomes.bonus200 / totalDraws * 100).toFixed(2)}%)`);
      console.log(`   Expected: ~0.02% (200 out of 1,000,000 PPM)`);
      console.log(`No Bonus:   ${outcomes.noBonus} times (${(outcomes.noBonus / totalDraws * 100).toFixed(2)}%)`);
      console.log(`   Expected: ~99.1% (991,000 out of 1,000,000 PPM)`);
      console.log(`\nTotal Bonus Rate: ${((outcomes.bonus40 + outcomes.bonus120 + outcomes.bonus200) / totalDraws * 100).toFixed(2)}%`);
      console.log(`Expected Bonus Rate: 0.9%`);

      // Verify total adds up
      expect(outcomes.bonus40 + outcomes.bonus120 + outcomes.bonus200 + outcomes.noBonus)
        .to.equal(totalDraws);

      // Statistical assertions (with reasonable tolerance for 100 draws)
      // With 100 draws, we expect roughly 0-2 bonus outcomes total
      const totalBonuses = outcomes.bonus40 + outcomes.bonus120 + outcomes.bonus200;
      expect(totalBonuses).to.be.lessThan(10); // Should be very rare (expected ~0.9 total)

      // No bonus should be the vast majority (expect 99+ out of 100)
      expect(outcomes.noBonus).to.be.greaterThan(90);
    });
  });

  describe("Large Scale Statistical Test - 10,000 Random Draws", function () {
    it("Should demonstrate accurate probability distribution over 10,000 random draws", async function () {
      this.timeout(600000); // 10 minutes timeout for 10k draws

      const outcomes = {
        bonus40: 0,
        bonus120: 0,
        bonus200: 0,
        noBonus: 0,
      };

      const totalDraws = 10000;
      console.log(`\n=== Running ${totalDraws.toLocaleString()} Random Draws ===`);
      console.log(`Expected outcomes based on PPM distribution:`);
      console.log(`  40% Bonus:  ~${(totalDraws * 0.007).toFixed(1)} times (0.7%)`);
      console.log(`  120% Bonus: ~${(totalDraws * 0.0018).toFixed(1)} times (0.18%)`);
      console.log(`  200% Bonus: ~${(totalDraws * 0.0002).toFixed(1)} times (0.02%)`);
      console.log(`  No Bonus:   ~${(totalDraws * 0.991).toFixed(1)} times (99.1%)`);
      console.log(`\nStarting test...`);

      const startTime = Date.now();

      // Get available signers from Hardhat (they have 10000 ETH each)
      const signers = await ethers.getSigners();

      for (let i = 0; i < totalDraws; i++) {
        // Reuse signers in rotation (skip owner which is index 0)
        const signerIndex = (i % (signers.length - 1)) + 1;
        const signer = signers[signerIndex];
        const userAddress = signer.address;

        // Fast forward for cooldown (only need to do this once per draw, not for first)
        if (i > 0) await time.increase(COOLDOWN_PERIOD + 1);

        // Enter raffle
        const tx = await raffle.connect(signer).enterRaffle({ value: ENTRY_PRICE });
        const receipt = await tx.wait();

        const seqNum = receipt?.logs.find(
          (log: any) => log.fragment?.name === "DrawRequested"
        )?.args?.sequenceNumber;

        const initialWinnings = (await raffle.getUserStats(userAddress))
          .totalWinnings;

        // Generate truly random number using cryptographic hash
        const randomSeed = ethers.keccak256(
          ethers.solidityPacked(
            ["uint256", "uint256", "address", "uint256"],
            [i, await ethers.provider.getBlockNumber(), userAddress, Date.now()]
          )
        );
        const randomPpm = BigInt(randomSeed) % BigInt(ONE_MILLION);
        const randomNumber = ethers.zeroPadValue(ethers.toBeHex(randomPpm), 32);

        // Fulfill with random number
        await mockEntropy.fulfillRequest(seqNum, randomNumber);

        const finalWinnings = (await raffle.getUserStats(userAddress))
          .totalWinnings;
        const bonusWon = finalWinnings - initialWinnings;

        // Categorize outcome
        if (bonusWon === 0n) {
          outcomes.noBonus++;
        } else {
          const bonusPercent = (bonusWon * BigInt(ONE_MILLION)) / ENTRY_PRICE;
          if (bonusPercent === 400_000n) outcomes.bonus40++;
          else if (bonusPercent === 1_200_000n) outcomes.bonus120++;
          else if (bonusPercent === 2_000_000n) outcomes.bonus200++;
        }

        // Progress indicator every 1000 draws
        if ((i + 1) % 1000 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const rate = ((i + 1) / (Date.now() - startTime) * 1000).toFixed(1);
          console.log(`Progress: ${(i + 1).toLocaleString()}/${totalDraws.toLocaleString()} draws | ${elapsed}s elapsed | ${rate} draws/sec`);
        }
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      const avgRate = (totalDraws / (Date.now() - startTime) * 1000).toFixed(1);

      console.log(`\n✓ Completed ${totalDraws.toLocaleString()} draws in ${totalTime}s (${avgRate} draws/sec)`);

      console.log("\n=== Final Distribution (10,000 Random Draws) ===");
      console.log(`40% Bonus:  ${outcomes.bonus40} times (${(outcomes.bonus40 / totalDraws * 100).toFixed(3)}%)`);
      console.log(`   Expected: ~70 times (0.700%)`);
      console.log(`   Deviation: ${((outcomes.bonus40 - 70) / 70 * 100).toFixed(1)}%`);

      console.log(`\n120% Bonus: ${outcomes.bonus120} times (${(outcomes.bonus120 / totalDraws * 100).toFixed(3)}%)`);
      console.log(`   Expected: ~18 times (0.180%)`);
      console.log(`   Deviation: ${((outcomes.bonus120 - 18) / 18 * 100).toFixed(1)}%`);

      console.log(`\n200% Bonus: ${outcomes.bonus200} times (${(outcomes.bonus200 / totalDraws * 100).toFixed(3)}%)`);
      console.log(`   Expected: ~2 times (0.020%)`);
      if (outcomes.bonus200 > 0) {
        console.log(`   Deviation: ${((outcomes.bonus200 - 2) / 2 * 100).toFixed(1)}%`);
      } else {
        console.log(`   Deviation: -100.0% (very rare event)`);
      }

      console.log(`\nNo Bonus:   ${outcomes.noBonus} times (${(outcomes.noBonus / totalDraws * 100).toFixed(3)}%)`);
      console.log(`   Expected: ~9910 times (99.100%)`);
      console.log(`   Deviation: ${((outcomes.noBonus - 9910) / 9910 * 100).toFixed(1)}%`);

      const totalBonuses = outcomes.bonus40 + outcomes.bonus120 + outcomes.bonus200;
      console.log(`\n=== Summary ===`);
      console.log(`Total Bonus Rate: ${(totalBonuses / totalDraws * 100).toFixed(3)}% (${totalBonuses}/${totalDraws})`);
      console.log(`Expected Bonus Rate: 0.900% (90/${totalDraws})`);
      console.log(`Deviation: ${((totalBonuses - 90) / 90 * 100).toFixed(1)}%`);

      // Verify total adds up
      expect(outcomes.bonus40 + outcomes.bonus120 + outcomes.bonus200 + outcomes.noBonus)
        .to.equal(totalDraws);

      // Statistical assertions with chi-square tolerance
      // With 10,000 draws, distribution should be very close to expected

      // Total bonus rate should be within reasonable range (0.5% - 1.5%)
      expect(totalBonuses).to.be.greaterThan(30); // At least 0.3%
      expect(totalBonuses).to.be.lessThan(150); // At most 1.5%

      // 40% bonus should appear roughly 60-80 times (0.6% - 0.8%)
      expect(outcomes.bonus40).to.be.greaterThan(40); // Allow wide tolerance
      expect(outcomes.bonus40).to.be.lessThan(100);

      // No bonus should be overwhelming majority (>98.5%)
      expect(outcomes.noBonus).to.be.greaterThan(9850);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle boundary values correctly", async function () {
      const boundaryTests = [
        { ppm: 0, shouldGetBonus: true, description: "Exact 0 (first bonus)" },
        { ppm: 6999, shouldGetBonus: true, description: "Just before 7000" },
        { ppm: 7000, shouldGetBonus: true, description: "Exact 7000 (second bonus)" },
        { ppm: 8799, shouldGetBonus: true, description: "Just before 8800" },
        { ppm: 8800, shouldGetBonus: true, description: "Exact 8800 (third bonus)" },
        { ppm: 8999, shouldGetBonus: true, description: "Just before 9000" },
        { ppm: 9000, shouldGetBonus: false, description: "Exact 9000 (no bonus)" },
        {
          ppm: ONE_MILLION - 1,
          shouldGetBonus: false,
          description: "Maximum value",
        },
      ];

      console.log("\n=== Boundary Value Tests ===");

      for (const test of boundaryTests) {
        const userAddress = await ethers.Wallet.createRandom().getAddress();
        await owner.sendTransaction({
          to: userAddress,
          value: ethers.parseEther("1"),
        });
        const signer = await ethers.getImpersonatedSigner(userAddress);

        await time.increase(COOLDOWN_PERIOD + 1);

        const tx = await raffle.connect(signer).enterRaffle({ value: ENTRY_PRICE });
        const receipt = await tx.wait();
        const seqNum = receipt?.logs.find(
          (log: any) => log.fragment?.name === "DrawRequested"
        )?.args?.sequenceNumber;

        const initialWinnings = (await raffle.getUserStats(userAddress))
          .totalWinnings;

        const randomNumber = ethers.zeroPadValue(ethers.toBeHex(test.ppm), 32);
        await mockEntropy.fulfillRequest(seqNum, randomNumber);

        const finalWinnings = (await raffle.getUserStats(userAddress))
          .totalWinnings;
        const bonusWon = finalWinnings - initialWinnings;

        const gotBonus = bonusWon > 0n;
        expect(gotBonus).to.equal(
          test.shouldGetBonus,
          `Failed for ${test.description} (ppm=${test.ppm})`
        );

        console.log(
          `PPM ${test.ppm.toString().padStart(7)}: ${test.description.padEnd(30)} - ${
            gotBonus ? "✓ Bonus" : "✗ No Bonus"
          }`
        );
      }
    });
  });
});

// Mock ERC721 for testing
describe("MockERC721", function () {
  it("Should deploy mock NFT contract", async function () {
    const MockNFT = await ethers.getContractFactory("MockERC721");
    const nft = await MockNFT.deploy("Test NFT", "TNFT");
    await nft.waitForDeployment();

    const [owner] = await ethers.getSigners();
    const mintTx = await nft.mint(owner.address);
    await mintTx.wait();
    const tokenId = 1n; // First token minted

    expect(await nft.ownerOf(tokenId)).to.equal(owner.address);
  });
});
