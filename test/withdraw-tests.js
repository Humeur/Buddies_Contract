const { expect } = require("chai");
const { providers } = require("ethers");
const { ethers } = require("hardhat");

/*
  Testing the deployment of the contract
*/
async function withdraw_tests() {
  it("Withdraw from owner with ether on the contract", async function () {
    let ownerBalance = await owner.getBalance();

    //minting a buddy to credit .05ETH to the contract
    await buddies.connect(addr1).mintBuddies(10, {
      value: ethers.utils.parseEther("0.5"),
    });

    await buddies.connect(owner).withdraw();

    await expect(await owner.getBalance()).to.above(ownerBalance);
  });

  it("Withdraw not from owner with ether on the contract", async function () {
    let ownerBalance = await owner.getBalance();

    //minting a buddy to credit .05ETH to the contract
    await buddies.connect(addr1).mintBuddies(10, {
      value: ethers.utils.parseEther("0.5"),
    });

    await expect(buddies.connect(addr1).withdraw()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Withdraw from owner without ether on the contract", async function () {
    await expect(buddies.connect(owner).withdraw()).to.be.revertedWith(
      "No ether left to withdraw"
    )
  });
}

module.exports = withdraw_tests;