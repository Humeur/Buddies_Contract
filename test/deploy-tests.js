const { expect } = require("chai");

/*
  Testing the deployment of the contract
*/
async function deployment_tests() {
  it("Should set the right owner", async function () {
    await expect(await buddies.owner()).to.equal(owner.address);
  });
}

module.exports = deployment_tests;