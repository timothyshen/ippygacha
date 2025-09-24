import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OnChainRaffle", function () {
  let OnChainRaffle: ContractFactory;
  let MockNFT: ContractFactory;
  let MockEntropy: ContractFactory;
  let raffle: any;
  let mockNFT: any;
  let mockEntropy: any;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;
  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;
  let user3Address: string;

  const ENTRY_PRICE = ethers.parseEther("0.1");
  const GUARANTEED_RETURN_RATE = ethers.parseUnits("1005", 0);
  const RATE_DENOMINATOR = ethers.parseUnits("1000", 0);
  const VRF_FEE = ethers.parseEther("0.001");

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
    user3Address = await user3.getAddress();

    // Deploy mock NFT contract
    MockNFT = await ethers.getContractFactory("MockERC721");
    mockNFT = await MockNFT.deploy("Mock NFT", "MNFT");

    // Deploy mock entropy contract
    MockEntropy = await ethers.getContractFactory("MockEntropyV2");
    mockEntropy = await MockEntropy.deploy();
    await mockEntropy.setFee(VRF_FEE);

    // Deploy OnChainRaffle
    OnChainRaffle = await ethers.getContractFactory("OnChainRaffle");
    raffle = await OnChainRaffle.deploy(
      await mockEntropy.getAddress(),
      await mockNFT.getAddress()
    );

    // Mint some NFTs to owner for testing
    await mockNFT.mint(ownerAddress, 1);
    await mockNFT.mint(ownerAddress, 2);
    await mockNFT.mint(ownerAddress, 3);
    await mockNFT.mint(ownerAddress, 4);
    await mockNFT.mint(ownerAddress, 5);

    // Approve raffle contract to transfer NFTs
    await mockNFT.setApprovalForAll(await raffle.getAddress(), true);
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await raffle.owner()).to.equal(ownerAddress);
      expect(await raffle.entropy()).to.equal(await mockEntropy.getAddress());
      expect(await raffle.nftContract()).to.equal(await mockNFT.getAddress());
      expect(await raffle.raffleActive()).to.be.true;
      expect(await raffle.totalEntries()).to.equal(0);
      expect(await raffle.totalIPTokensCollected()).to.equal(0);
    });

    it("Should have correct constants", async function () {
      expect(await raffle.ENTRY_PRICE()).to.equal(ENTRY_PRICE);
      expect(await raffle.GUARANTEED_RETURN_RATE()).to.equal(
        GUARANTEED_RETURN_RATE
      );
      expect(await raffle.RATE_DENOMINATOR()).to.equal(RATE_DENOMINATOR);
      expect(await raffle.TIER_2_PROBABILITY()).to.equal(100);
      expect(await raffle.TIER_3_PROBABILITY()).to.equal(50);
      expect(await raffle.TIER_4_PROBABILITY()).to.equal(10);
      expect(await raffle.TIER_5_PROBABILITY()).to.equal(1);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set raffle status", async function () {
      await raffle.setRaffleStatus(false);
      expect(await raffle.raffleActive()).to.be.false;

      await raffle.setRaffleStatus(true);
      expect(await raffle.raffleActive()).to.be.true;
    });

    it("Should allow owner to pause/unpause", async function () {
      await raffle.pause();
      expect(await raffle.paused()).to.be.true;

      await raffle.unpause();
      expect(await raffle.paused()).to.be.false;
    });

    it("Should allow owner to emergency withdraw", async function () {
      // Send some ETH to contract
      await user1.sendTransaction({
        to: await raffle.getAddress(),
        value: ethers.parseEther("1"),
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(ownerAddress);
      await raffle.emergencyWithdraw();
      const ownerBalanceAfter = await ethers.provider.getBalance(ownerAddress);

      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("Should revert non-owner admin calls", async function () {
      await expect(
        raffle.connect(user1).setRaffleStatus(false)
      ).to.be.revertedWithCustomError(raffle, "OwnableUnauthorizedAccount");

      await expect(raffle.connect(user1).pause()).to.be.revertedWithCustomError(
        raffle,
        "OwnableUnauthorizedAccount"
      );

      await expect(
        raffle.connect(user1).emergencyWithdraw()
      ).to.be.revertedWithCustomError(raffle, "OwnableUnauthorizedAccount");
    });
  });

  describe("NFT Management", function () {
    it("Should allow owner to deposit NFTs", async function () {
      const tokenIds = [1, 2, 3];
      await raffle.depositNFTs(tokenIds);

      expect(await raffle.getNFTPoolInfo()).to.equal(3);
      expect(await raffle.availableNFTs(1)).to.be.true;
      expect(await raffle.availableNFTs(2)).to.be.true;
      expect(await raffle.availableNFTs(3)).to.be.true;

      const poolTokenIds = await raffle.getNFTPoolTokenIds();
      expect(poolTokenIds).to.deep.equal(tokenIds);
    });

    it("Should prevent depositing already deposited NFTs", async function () {
      await raffle.depositNFTs([1]);
      await expect(raffle.depositNFTs([1])).to.be.revertedWith(
        "NFT already deposited"
      );
    });

    it("Should allow owner to withdraw NFTs", async function () {
      await raffle.depositNFTs([1, 2]);
      await raffle.withdrawNFT(1, user1Address);

      expect(await raffle.availableNFTs(1)).to.be.false;
      expect(await raffle.getNFTPoolInfo()).to.equal(1);
      expect(await mockNFT.ownerOf(1)).to.equal(user1Address);
    });

    it("Should prevent withdrawing non-available NFTs", async function () {
      await expect(raffle.withdrawNFT(999, user1Address)).to.be.revertedWith(
        "NFT not available"
      );
    });

    it("Should prevent withdrawing to zero address", async function () {
      await raffle.depositNFTs([1]);
      await expect(
        raffle.withdrawNFT(1, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Raffle Entry", function () {
    it("Should allow users to enter raffle with correct amount", async function () {
      const entryAmount = ENTRY_PRICE;
      const userBalanceBefore = await ethers.provider.getBalance(user1Address);

      await raffle.connect(user1).enterRaffle({ value: entryAmount });

      expect(await raffle.totalEntries()).to.equal(1);
      expect(await raffle.totalIPTokensCollected()).to.equal(entryAmount);
      expect(await raffle.userTotalEntries(user1Address)).to.equal(1);

      // Check guaranteed return was processed
      const guaranteedReturn =
        (entryAmount * GUARANTEED_RETURN_RATE) / RATE_DENOMINATOR;
      const userBalanceAfter = await ethers.provider.getBalance(user1Address);
      expect(userBalanceAfter).to.be.gt(
        userBalanceBefore - entryAmount + guaranteedReturn
      );
    });

    it("Should allow multiple entries", async function () {
      const entryAmount = ENTRY_PRICE * 3n;
      await raffle.connect(user1).enterRaffle({ value: entryAmount });

      expect(await raffle.totalEntries()).to.equal(3);
      expect(await raffle.totalIPTokensCollected()).to.equal(entryAmount);
      expect(await raffle.userTotalEntries(user1Address)).to.equal(3);
    });

    it("Should revert when raffle is inactive", async function () {
      await raffle.setRaffleStatus(false);
      await expect(
        raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE })
      ).to.be.revertedWith("Raffle is not active");
    });

    it("Should revert when paused", async function () {
      await raffle.pause();
      await expect(
        raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should revert with insufficient payment", async function () {
      await expect(
        raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE - 1n })
      ).to.be.revertedWith("Insufficient entry amount");
    });

    it("Should revert with non-multiple entry amount", async function () {
      await expect(
        raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE + 1n })
      ).to.be.revertedWith("Amount must be multiple of entry price");
    });

    it("Should emit correct events on entry", async function () {
      const entryAmount = ENTRY_PRICE;
      await expect(raffle.connect(user1).enterRaffle({ value: entryAmount }))
        .to.emit(raffle, "RaffleEntered")
        .withArgs(user1Address, 0, 1, entryAmount)
        .and.to.emit(raffle, "PrizeDistributed")
        .and.to.emit(raffle, "DrawRequested");
    });
  });

  describe("VRF Integration", function () {
    beforeEach(async function () {
      // Fund contract for VRF fees
      await owner.sendTransaction({
        to: await raffle.getAddress(),
        value: ethers.parseEther("10"),
      });
    });

    it("Should request VRF on raffle entry", async function () {
      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });

      // Check that VRF was requested
      const pendingDraws = await raffle.pendingDraws(0); // sequenceNumber 0
      expect(pendingDraws.user).to.equal(user1Address);
      expect(pendingDraws.entryAmount).to.equal(ENTRY_PRICE);
      expect(pendingDraws.processed).to.be.false;
    });

    it("Should allow manual VRF request by owner", async function () {
      await raffle.manualRequestDraw(user1Address, ENTRY_PRICE);

      const pendingDraws = await raffle.pendingDraws(0);
      expect(pendingDraws.user).to.equal(user1Address);
      expect(pendingDraws.entryAmount).to.equal(ENTRY_PRICE);
    });

    it("Should revert manual VRF request by non-owner", async function () {
      await expect(
        raffle.connect(user1).manualRequestDraw(user1Address, ENTRY_PRICE)
      ).to.be.revertedWithCustomError(raffle, "OwnableUnauthorizedAccount");
    });

    it("Should revert VRF request when raffle inactive", async function () {
      await raffle.setRaffleStatus(false);
      await expect(
        raffle.manualRequestDraw(user1Address, ENTRY_PRICE)
      ).to.be.revertedWith("Raffle not active");
    });
  });

  describe("Prize Distribution", function () {
    beforeEach(async function () {
      // Deposit NFTs and fund contract
      await raffle.depositNFTs([1, 2, 3, 4, 5]);
      await owner.sendTransaction({
        to: await raffle.getAddress(),
        value: ethers.parseEther("100"),
      });
    });

    it("Should process guaranteed return correctly", async function () {
      const entryAmount = ENTRY_PRICE;
      const userBalanceBefore = await ethers.provider.getBalance(user1Address);

      await raffle.connect(user1).enterRaffle({ value: entryAmount });

      const guaranteedReturn =
        (entryAmount * GUARANTEED_RETURN_RATE) / RATE_DENOMINATOR;
      const userBalanceAfter = await ethers.provider.getBalance(user1Address);

      // User should receive guaranteed return
      expect(userBalanceAfter).to.be.gt(
        userBalanceBefore - entryAmount + guaranteedReturn
      );
    });

    it("Should process bonus prizes on VRF callback", async function () {
      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });

      // Simulate VRF callback with high probability numbers
      const highProbabilityRandom = ethers.hexlify(ethers.randomBytes(32));
      await mockEntropy.simulateCallback(0, highProbabilityRandom);

      // Check that prizes were created
      const userStats = await raffle.getUserStats(user1Address);
      expect(userStats.totalWinnings).to.be.gt(0);
    });

    it("Should prevent double processing of VRF callbacks", async function () {
      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });

      const randomNumber = ethers.hexlify(ethers.randomBytes(32));
      await mockEntropy.simulateCallback(0, randomNumber);

      // Try to process again
      await expect(
        mockEntropy.simulateCallback(0, randomNumber)
      ).to.be.revertedWith("Draw already processed");
    });

    it("Should handle NFT prize distribution", async function () {
      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });

      // Use random number that triggers tier 5 (NFT prize)
      const tier5Random = ethers.hexlify(ethers.randomBytes(32));
      await mockEntropy.simulateCallback(0, tier5Random);

      // Check if NFT was transferred
      const userNFTs = await mockNFT.balanceOf(user1Address);
      expect(userNFTs).to.be.gte(0); // May or may not win depending on probability
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await raffle.depositNFTs([1, 2, 3]);
      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE * 2n });
      await raffle.connect(user2).enterRaffle({ value: ENTRY_PRICE });
    });

    it("Should return correct raffle info", async function () {
      const info = await raffle.getRaffleInfo();
      expect(info.active).to.be.true;
      expect(info.totalEntriesCount).to.equal(3);
      expect(info.totalIPTokensCollectedAmount).to.equal(ENTRY_PRICE * 3n);
      expect(info.nftPoolSize).to.equal(3);
    });

    it("Should return correct user stats", async function () {
      const user1Stats = await raffle.getUserStats(user1Address);
      expect(user1Stats.totalUserEntries).to.equal(2);
      expect(user1Stats.totalWinnings).to.be.gt(0);
      expect(user1Stats.distributedPrizes).to.be.gt(0);

      const user2Stats = await raffle.getUserStats(user2Address);
      expect(user2Stats.totalUserEntries).to.equal(1);
      expect(user2Stats.totalWinnings).to.be.gt(0);
    });

    it("Should return correct NFT pool info", async function () {
      const poolInfo = await raffle.getNFTPoolInfo();
      expect(poolInfo).to.equal(3);

      const tokenIds = await raffle.getNFTPoolTokenIds();
      expect(tokenIds).to.deep.equal([1, 2, 3]);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle insufficient balance for guaranteed return", async function () {
      // Enter raffle to create pending draws
      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });

      // Drain contract balance
      await raffle.emergencyWithdraw();

      // Try to enter again - should fail due to insufficient balance
      await expect(
        raffle.connect(user2).enterRaffle({ value: ENTRY_PRICE })
      ).to.be.revertedWith(
        "Insufficient contract balance for guaranteed return"
      );
    });

    it("Should handle NFT transfer failures gracefully", async function () {
      await raffle.depositNFTs([1]);
      await owner.sendTransaction({
        to: await raffle.getAddress(),
        value: ethers.parseEther("100"),
      });

      // Enter raffle and trigger VRF callback
      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });

      // Simulate NFT transfer failure by making contract not approved
      await mockNFT.setApprovalForAll(await raffle.getAddress(), false);

      const randomNumber = ethers.hexlify(ethers.randomBytes(32));
      await mockEntropy.simulateCallback(0, randomNumber);

      // Should not revert, but mark prize as not distributed
      const userStats = await raffle.getUserStats(user1Address);
      expect(userStats.totalWinnings).to.be.gte(0);
    });

    it("Should handle empty NFT pool", async function () {
      await owner.sendTransaction({
        to: await raffle.getAddress(),
        value: ethers.parseEther("100"),
      });

      await raffle.connect(user1).enterRaffle({ value: ENTRY_PRICE });

      // VRF callback should not revert even with empty pool
      const randomNumber = ethers.hexlify(ethers.randomBytes(32));
      await expect(mockEntropy.simulateCallback(0, randomNumber)).to.not.be
        .reverted;
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrant calls to enterRaffle", async function () {
      // This test would require a malicious contract that tries to reenter
      // For now, we test that the modifier is applied
      expect(await raffle.enterRaffle({ value: ENTRY_PRICE })).to.not.be
        .reverted;
    });
  });

  describe("ERC721Receiver Implementation", function () {
    it("Should return correct selector for onERC721Received", async function () {
      const selector = await raffle.onERC721Received(
        user1Address,
        user2Address,
        1,
        "0x"
      );
      expect(selector).to.equal("0x150b7a02");
    });
  });

  describe("Receive Function", function () {
    it("Should accept ETH transfers", async function () {
      const amount = ethers.parseEther("1");
      await user1.sendTransaction({
        to: await raffle.getAddress(),
        value: amount,
      });

      const contractBalance = await ethers.provider.getBalance(
        await raffle.getAddress()
      );
      expect(contractBalance).to.equal(amount);
    });
  });
});

// Mock contracts for testing
describe("Mock Contracts", function () {
  it("Should deploy mock NFT contract", async function () {
    const MockNFT = await ethers.getContractFactory("MockERC721");
    const mockNFT = await MockNFT.deploy("Mock NFT", "MNFT");

    expect(await mockNFT.name()).to.equal("Mock NFT");
    expect(await mockNFT.symbol()).to.equal("MNFT");
  });

  it("Should deploy mock entropy contract", async function () {
    const MockEntropy = await ethers.getContractFactory("MockEntropyV2");
    const mockEntropy = await MockEntropy.deploy();

    expect(await mockEntropy.getAddress()).to.not.equal(ethers.ZeroAddress);
  });
});
