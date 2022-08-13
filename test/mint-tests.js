const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

/*
  Testing the mintBuddies function
*/
async function mintBuddies_tests() {
  it("Mint 1 buddy with correct value", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
      value: ethers.utils.parseEther("0.05"),
    });

    await expect(await buddies.balanceOf(addr1.address)).to.equal(1);
  });

  it("Mint 10 buddies with correct value", async function () {
    await buddies.connect(addr1).mintBuddies(10, {
      value: ethers.utils.parseEther("0.5"),
    });

    await expect(await buddies.balanceOf(addr1.address)).to.equal(10);
  });

  it("Mint 11 buddies with correct value", async function () {
    await expect(buddies.connect(addr1).mintBuddies(11, {
      value: ethers.utils.parseEther("0.55"),
    })).to.be.revertedWith("You cannot mint more than 10 Buddies");
  });

  it("Mint 0 buddy", async function () {
    await expect(buddies.connect(addr1).mintBuddies(0, {
      value: ethers.utils.parseEther("0.05"),
    })).to.be.revertedWith("You must mint more than 0 Buddies");
  });

  it("Mint 2 buddies with incorrect value", async function () {
    await expect(buddies.connect(addr1).mintBuddies(2, {
      value: ethers.utils.parseEther("0.07"),
    })).to.be.revertedWith("Buddies are 0.05 ETH each, you must provide enough ethereum to mint");
  });

  it("Mint 1 buddy with correct value but sale is not active", async function () {
    await buddies.connect(owner).flipSaleState();

    await expect(buddies.connect(addr1).mintBuddies(1, {
      value: ethers.utils.parseEther("0.05"),
    })).to.be.revertedWith("Sale is not active, you can't mint right now");
  });
}

/*
  Testing the giftBuddies function
*/
async function giftBuddies_tests() {
  it("Gift 1 buddy", async function () {
    await buddies.connect(owner).giftBuddies(1, addr1.address);

    await expect(await buddies.balanceOf(addr1.address)).to.equal(1);
  });

  it("Gift 11 buddies", async function () {
    await expect(buddies.connect(owner).giftBuddies(11, addr1.address))
    .to.be.revertedWith("You cannot gift more than 10 Buddies");
  });

  it("Gift 0 buddy", async function () {
    await expect(buddies.connect(owner).giftBuddies(0, addr1.address))
    .to.be.revertedWith("You must gift more than 0 Buddies");
  });

  it("Gift 1 buddy not from owner address", async function () {
    await expect(buddies.connect(addr1).giftBuddies(1, addr2.address))
    .to.be.revertedWith("Ownable: caller is not the owner");
  });
}

/*
  Testing the mintReservedBuddies function
*/
async function mintReservedBuddies_tests() {
  it("Mint 1 reserved buddy", async function () {
    await buddies.connect(owner).mintReservedBuddies(1);

    await expect(await buddies.balanceOf(owner.address)).to.equal(1);

    ownedBuddies = await buddies.buddiesOfOwner(owner.address);

    await expect(ownedBuddies[0]).to.equal(9000);
  });

  it("Mint 11 reserved buddies", async function () {
    await buddies.connect(owner).mintReservedBuddies(11);

    await expect(await buddies.balanceOf(owner.address)).to.equal(11);

    ownedBuddies = await buddies.buddiesOfOwner(owner.address);

    await expect(ownedBuddies[10]).to.equal(9010);
  });

  it("Mint 0 reserved buddy", async function () {
    await expect (buddies.connect(owner).mintReservedBuddies(0))
    .to.be.revertedWith("You must mint more than 0 Buddies");
  });

  it("Mint 1 reserved buddy not from owner address", async function () {
    await expect (buddies.connect(addr1).mintReservedBuddies(1))
    .to.be.revertedWith("Ownable: caller is not the owner");
  });
}

/*
  Those tests are not possible with 10,000 buddies.
  The gas limit and the timeout limit should be increased.
  They were executed out locally by modifying the contract.
  You can also execute them by reducing the constants BUDDIES_SUPPLY and RESERVED_BUDDIES

  We are using :
  BUDDIES_SUPPLY = 10
  RESERVED_BUDDIES = 2
*/
async function impossiblesTests() {
  it("Mint 9 buddies with correct value but reach the maximum buddies supply", async function () {
    await expect(buddies.connect(addr1).mintBuddies(9, {
      value: ethers.utils.parseEther("0.45"),
    })).to.be.revertedWith("There is not enough Buddies to mint");
  });

  it("Mint 3 reserved buddies but reach the maximum reserved buddies supply", async function () {
    await expect(buddies.connect(owner).mintReservedBuddies(3))
    .to.be.revertedWith("There is not enough Buddies to mint");
  });

  it("Gift 9 buddies but reach the maximum buddies supply", async function () {
    await expect(buddies.connect(owner).giftBuddies(9, addr1.address))
    .to.be.revertedWith("There is not enough Buddies to gift");
  });
}

module.exports = {
  mintBuddies_tests,
  giftBuddies_tests,
  mintReservedBuddies_tests
}