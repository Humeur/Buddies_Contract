const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

/*
  Testing the unlistBuddy function
*/
async function unlistBuddy_tests() {
  it("Unlist Buddy owned and listed", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    let listing = await buddies.buddiesListings(ownerBuddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("3"));

    await buddies.connect(addr1).unlistBuddy(ownerBuddies[0].toNumber());

    listing = await buddies.buddiesListings(ownerBuddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("0"));
  });

  it("Unlist Buddy owned and not listed", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await expect(buddies.connect(addr1).unlistBuddy(ownerBuddies[0].toNumber()))
    .to.be.revertedWith("Buddy must be listed to be unlisted");
  });

  it("Unlist Buddy not owned and listed", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    let listing = await buddies.buddiesListings(ownerBuddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("3"));

    await expect(buddies.connect(addr2).unlistBuddy(ownerBuddies[0].toNumber()))
    .to.be.revertedWith("You must own a buddy to unlist it");
  });

  it("Unlist Buddy from contract owner address", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      ownerBuddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    let listing = await buddies.buddiesListings(ownerBuddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("3"));

    await expect(buddies.connect(owner).unlistBuddy(ownerBuddies[0].toNumber()))
    .to.be.revertedWith("You must own a buddy to unlist it");
  });

  it("Unlist Buddy not minted", async function () {
    await expect((buddies.connect(addr1).unlistBuddy(0)))
    .to.be.revertedWith("ERC721: owner query for nonexistent token");
  });

  it("Unlist Buddy transfered but previously owned", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    var ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    buddies.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, addr2.address, ownerBuddies[0]);

    await expect((buddies.connect(addr1).unlistBuddy(
      ownerBuddies[0].toNumber()
    ))).to.be.revertedWith("You must own a buddy to unlist it");
  });
}

module.exports = unlistBuddy_tests;