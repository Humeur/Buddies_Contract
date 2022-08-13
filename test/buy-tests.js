const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

/*
  Testing the buyBuddy function
*/
async function buyBuddy_tests() {
  it("Buy buddy listed and not owned at correct price", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    let addr1Buddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      addr1Buddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    let listing = await buddies.buddiesListings(addr1Buddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("3"));

    await buddies.connect(addr2).buyBuddy(addr1Buddies[0], {
      value: ethers.utils.parseEther("3"),
     });

    let addr2Buddies = await buddies.buddiesOfOwner(addr2.address);

    await expect(addr2Buddies[0]).to.equal(addr1Buddies[0]);

    addr1Buddies = await buddies.buddiesOfOwner(addr1.address);

    expect(addr1Buddies[0]).to.be.undefined;
  });

  it("Buy buddy not listed and not owned at correct price", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    const ownerBuddies = await buddies.buddiesOfOwner(addr1.address);

    await expect(buddies.connect(addr2).buyBuddy(ownerBuddies[0], {
      value: ethers.utils.parseEther("3"),
     })).to.be.revertedWith("This buddy is not for sale");
  });

  it("Buy buddy listed and owned at correct price", async function () {
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

    await expect (buddies.connect(addr1).buyBuddy(ownerBuddies[0], {
      value: ethers.utils.parseEther("3"),
     })).to.be.revertedWith("You cannot buy your own Buddy");
  });

  it("Buy buddy listed and not owned at insufficient price", async function () {
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

    await expect(buddies.connect(addr2).buyBuddy(ownerBuddies[0], {
      value: ethers.utils.parseEther("1"),
     })).to.be.revertedWith("You must provide a sufficient amount of ETH to buy this Buddy");
  });

  it("Buy buddy listed and not owned at correct price but marketplace is not active", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    let addr1Buddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      addr1Buddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    let listing = await buddies.buddiesListings(addr1Buddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("3"));

    await buddies.connect(owner).flipMarketplaceState();

    await expect(buddies.connect(addr2).buyBuddy(addr1Buddies[0], {
      value: ethers.utils.parseEther("3"),
     })).to.be.revertedWith("Marketplace is not active, you can't buy a buddy right now");
  });

  it("Buy buddy not owned and listed but transfered after at correct price", async function () {
    await buddies.connect(addr1).mintBuddies(1, {
        value: ethers.utils.parseEther("0.05"),
    });

    let addr1Buddies = await buddies.buddiesOfOwner(addr1.address);

    await buddies.connect(addr1).listBuddy(
      addr1Buddies[0].toNumber(),
      ethers.utils.parseEther("3")
    );

    let listing = await buddies.buddiesListings(addr1Buddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("3"));

    buddies.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr1.address, addr2.address, addr1Buddies[0]);

    await (buddies.connect(addr3).buyBuddy(addr1Buddies[0], {
      value: ethers.utils.parseEther("3"),
    }));

    let addr2Buddies = await buddies.buddiesOfOwner(addr2.address);

    await expect(addr2Buddies[0]).to.equal(addr1Buddies[0]);

    addr1Buddies = await buddies.buddiesOfOwner(addr1.address);

    expect(addr1Buddies[0]).to.be.undefined;

    listing = await buddies.buddiesListings(addr2Buddies[0]);

    expect(listing.price).to.equal(ethers.utils.parseEther("0"));

  });
}

module.exports = buyBuddy_tests;