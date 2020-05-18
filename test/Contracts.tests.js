const Users = artifacts.require("Users");
const ContractFactory = artifacts.require("ContractFactory");
const RFPs = artifacts.require("RFPs");
const Contract = artifacts.require("Contract");
const Settle = artifacts.require("Settle");
contract("ContractFactory", accounts => {
    it("Create contract from RFP", async () => {
        const users = await Users.deployed();
        const instance = await ContractFactory.deployed();
        const rfps = await RFPs.deployed();


        await users.register("Bob", 1, { from: accounts[0] });

        let results = await rfps.createRFP("12345", { from: accounts[0] });
        await rfps.createProposal(1, "111", { from: accounts[1] });
        // uint256 proposalId,
        // string memory docAddress,
        // uint16[] memory volumes,
        // uint16[] memory ppi,
        // uint256[2] memory paymentTerms,
        // uint256 dayTerms,
        // uint256 currency

        // create a contract
        await rfps.updateDiscount(2, 3, 15, { from: accounts[1] });
        results = await rfps.buyerApprove(2, "Bob", { from: accounts[0] }); // approved!
        results = await rfps.signProposal(2, "bob", { from: accounts[0] }); // sign it
        results = await rfps.signProposal(2, "bob",  { from: accounts[1] }); // sign it

        await rfps.createContractFromProposal(2, "bob", "Bob", [0, 100, 200], [100, 98, 95], [30, 5], 30, 0, { from: accounts[0] });
        results = await rfps.getProposal(2, { from: accounts[0] });
        console.log(results);

        let contract = await Contract.at(results.contractId);

        console.log(await contract.getContract.call({ from: accounts[0] }));
    });

    it("Create Purchase Order", async () => {
        const rfps = await RFPs.deployed();

        let results = await rfps.getProposal(2, { from: accounts[0] });
        let contract = await Contract.at(results.contractId);
        // lets create a purchase order!
        await contract.issuePurchaseOrder(new Date().getTime(), 10, "BOB");

        // 2001

    });


    it("Seller Reviews Purchase Order", async () => {
        const rfps = await RFPs.deployed();

        let results = await rfps.getProposal(2, { from: accounts[0] });
        let contract = await Contract.at(results.contractId);

        results = await contract.getPurchaseOrder(2001, { from: accounts[0] });
        console.log(results);

        
        // lets create a purchase order!
        await contract.reviewPurchaseOrder(2001, 325, "Bob", { from: accounts[1] });

        results = await contract.getPurchaseOrder(2001, { from: accounts[0] });

        console.log(results);
        assert.equal(results.total.toNumber(), 10, "total does not match after seller sets it");
        try {
            await contract.reviewPurchaseOrder(2001, 325, "Bob", { from: accounts[1] });
            assert.fail("Cannot change po terms after submitting for review");
        } catch (e) { }
        // 2001

    });

    it("Buyer accepts terms from seller", async () => {
        const rfps = await RFPs.deployed();

        let results = await rfps.getProposal(2, { from: accounts[0] });
        let contract = await Contract.at(results.contractId);
        // lets create a purchase order!
        try {
            await contract.acceptPOTerms(2001, "Bob", { from: accounts[1] });
            assert.fail("Must be the owner accepting the terms");
        }
        catch (e) { }
        await contract.acceptPOTerms(2001, "Bob", { from: accounts[0] });

        results = await contract.getPurchaseOrder(2001, { from: accounts[0] });

        console.log(results);
        assert.equal(results.total.toNumber(), 10, "total does not match after seller sets it");
        try {
            await contract.reviewPurchaseOrder(2001, 325, "Bob", { from: accounts[1] });
            assert.fail("Cannot change po terms after submitting for review");
        } catch (e) { }
        // 2001

    });

    it("Seller Delivers goods and Buyer acknowledges", async () => {
        const rfps = await RFPs.deployed();

        let results = await rfps.getProposal(2, { from: accounts[0] });
        let contract = await Contract.at(results.contractId);
        // lets create a purchase order!
        try {
            await contract.indicateDelivered(2001, "Bob:", { from: accounts[0] });
            assert.fail("Must be the seller indicating delivery");
        }
        catch (e) { }
        await contract.indicateDelivered(2001, "Bob:", { from: accounts[1] });

        try {
            await contract.ackDelivered(2001, "Bob:", { from: accounts[1] });
            assert.fail("buyer must ack delivery");
        } catch (e) { }
        // 2001
        await contract.ackDelivered(2001, "Bob:", { from: accounts[0] });

    });

    it("Manage Invoices", async () => {
        const rfps = await RFPs.deployed();

        let results = await rfps.getProposal(2, { from: accounts[0] });
        let contract = await Contract.at(results.contractId);
        // lets create a purchase order!
        try {
            await contract.issueInvoice(2001, { from: accounts[0] });
            assert.fail("Must be the seller indicating delivery");
        }
        catch (e) { }
        await contract.issueInvoice(2001, { from: accounts[1] });

        results = await contract.getInvoice.call(2001, { from: accounts[0] });

        const settle = await Settle.at(results.settleAddress);
        console.log(await settle.getSettleDetails.call({ from: accounts[1] }));
    });

    it("Settle Invoices", async () => {
        const rfps = await RFPs.deployed();
        const users = await Users.deployed();


        let results = await rfps.getProposal(2, { from: accounts[0] });
        let contract = await Contract.at(results.contractId);
        // lets create a purchase order!

        results = await contract.getInvoice.call(2001, { from: accounts[0] });

        results = await users.getBalance.call(accounts[0]);

        const currencyToUse = 2;
        console.log("Balance is", results.map(e => e.toNumber()));
        let prev = results[currencyToUse];
        results = await contract.getInvoice.call(2001, { from: accounts[0] });

        let settle = await Settle.at(results.settleAddress);
        results = await settle.getSettleDetails.call({ from: accounts[1] });
        console.log(results.totalOwed.toNumber());
        await contract.settle(2001, '0x0', '0x0', currencyToUse, 500, { from: accounts[0] }); // before settle
        results = await users.getBalance.call(accounts[0]);


        console.log(results[currencyToUse].toNumber(), prev.toNumber());
        assert.isBelow(results[currencyToUse].toNumber(), prev.toNumber(), "Should deduct 500 USD from amount of bitcoin");

        results = await contract.getInvoice.call(2001, { from: accounts[0] });

        settle = await Settle.at(results.settleAddress);
        results = await settle.getSettleDetails.call({ from: accounts[1] });

        assert.equal(results.totalPaid.toNumber(), 500, "Paid 500 USD should reflect");

        try {
            await settle.withdraw({ from: accounts[1] });
            assert.fail("Should fail because the amount not fully paid yet");
        }
        catch (e) {

        }

        // pay the remainder (taking into consideration the discounts)
        let totalOwed = results.totalOwed.toNumber() - results.eligibleDiscount.toNumber() - results.totalPaid.toNumber();
        console.log("Total Owed should be", totalOwed, results.totalPaid.toNumber(), results.eligibleDiscount.toNumber());

        console.log(await contract.getPurchaseOrder.call(2001, {from:accounts[0]}));

        // pay using bitcoin
        await contract.settle(2001, '0x0', '0x0', 0, 759, { from: accounts[0] }); // before settle
        assert.isOk(await settle.isSettled.call({ from: accounts[0] }), "Should be settled now!");

        // try to withdraw
        await settle.withdraw({ from: accounts[1] });

        // verify the balance for each user.
        console.log((await users.getBalance.call(accounts[0], {from: accounts[0]})).map(e=>e.toNumber()));
        console.log((await users.getBalance.call(accounts[1], {from: accounts[1]})).map(e=>e.toNumber()));

        console.log(await contract.getPurchaseOrder.call(2001, {from:accounts[0]}));
    });
});