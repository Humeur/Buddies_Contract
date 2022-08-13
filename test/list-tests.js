const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

/*
  Testing the listBuddy function
*/
async function listBuddy_tests() {
  it("List Buddy owned", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    const listing = await buddies.buddiesListings(ownerBuddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("3"));
  });

  it("List Buddy not owned", async function () {
    await buddies.connect(addr2).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr2.address);

    await expect(buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    )).to.be.revertedWith("You must own a buddy to list it");
  });

  it("List Buddy not minted", async function () {
    await expect(buddies.connect(addr1).listBuddy(
      0,
      ethers.utils.parseEther("3")
    )).to.be.revertedWith("ERC721: owner query for nonexistent token");
  });

  it("List Buddy at price 0", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await expect(buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("0")
    )).to.be.revertedWith("Price must be greater than 0 ETH");
  });

  it("List Buddy already listed", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    await buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("6")
    )

    const listing = await buddies.buddiesListings(ownerBuddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("6"));
  });

  it("List Buddy from contract owner address", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await expect(buddies.connect(owner).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    )).to.be.revertedWith("You must own a buddy to list it");
  });

  it("List 2 Buddies owned", async function () {
    await buddies.connect(addr1).mintBuddies(2, {
        value: ethers.utils.parseEther("0.1"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    await buddies.connect(addr1).listBuddy(
      ownerBuddies[1].toNumber(),
      ethers.utils.parseEther("5")
    );

    const listing0 = await buddies.buddiesListings(ownerBuddies[0]);
    const listing1 = await buddies.buddiesListings(ownerBuddies[1]);

    expect(listing0.price).to.equal(ethers.utils.parseEther("3"));
    expect(listing1.price).to.equal(ethers.utils.parseEther("5"));
  });

  it("List Buddy owned but marketplace is not active", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(owner).flipMarketplaceState();

    await expect(buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    )).to.be.revertedWith("Marketplace is not active, you can't list right now");
  });

  it("List Buddy transfered but previously owned", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    var ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    buddies.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, addr2.address, ownerBuddies[0]);

    await expect((buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    ))).to.be.revertedWith("You must own a buddy to list it");
  });
}

module.exports = listBuddy_tests;