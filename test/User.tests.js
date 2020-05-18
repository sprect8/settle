const Users = artifacts.require("Users");

contract("Users", accounts => {
    it("User should not exist", async () => {
        const instance = await Users.deployed();
        const result = await instance.userExists.call({ from: accounts[0] });
        assert.isFalse(result.exists);
    });

    it("User registered should exist", async () => {
        const instance = await Users.deployed();
        const result = await instance.userExists.call({ from: accounts[0] });
        assert.isFalse(result.exists);
        await instance.register("Bob", 1, { from: accounts[0] });
        assert.isTrue((await instance.userExists.call({from:accounts[0]})).exists);
    });

    it("Users balance should exist", async () => {
        const instance = await Users.deployed();
        //await instance.register("Bob", 1, { from: accounts[0] });
        const result = await instance.getMyBalance.call({ from: accounts[0] });
        assert.equal(result[0].toNumber(), 10*100 * 100*100, "Failed to get balance");
        
    });
});