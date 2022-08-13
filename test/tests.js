const { expect } = require("chai");
const { providers } = require("ethers");
const { ethers } = require("hardhat");

const deployment_tests = require("./deploy-tests");
const withdraw_tests = require("./withdraw-tests");
const listBuddy_tests = require("./list-tests.js");
const unlistBuddy_tests = require("./unlist-tests.js");
const buyBuddy_tests = require("./buy-tests.js");
const {
  mintBuddies_tests,
  giftBuddies_tests,
  mintReservedBuddies_tests
} = require("./mint-tests");

describe("Buddies Contract Test", function () {
  beforeEach(async function () {
    Buddies = await ethers.getContractFactory("Buddies");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    buddies = await Buddies.deploy();
    await buddies.deployed();

    buddies.connect(owner).flipSaleState();
    buddies.connect(owner).flipMarketplaceState();
  });

  describe("Deployment tests", deployment_tests);
  describe("withdraw function tests", withdraw_tests);
  describe("Marketplace functions tests", () => {
    describe("listBuddy function tests", listBuddy_tests);
    describe("unlistBuddy function tests", unlistBuddy_tests);
    describe("buyBuddy function tests", buyBuddy_tests);
  });
  describe("Mint functions tests", () => {
    describe("mintBuddies function tests", mintBuddies_tests);
    describe("giftBuddies function tests", giftBuddies_tests);
    describe("mintReservedBuddies function tests", mintReservedBuddies_tests);
  });
});
