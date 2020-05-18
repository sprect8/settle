const RFPs = artifacts.require("RFPs");

contract("RFPs", accounts => {
    it("Progressing RFPs", async () => {
        const instance = await RFPs.deployed();
        const result = await instance.createRFP("12345", { from: accounts[0] });
        
        try {
            await instance.createProposal(1, "12345", { from: accounts[0]});
            assert.fail("Should fail because you cannot create a proposal from your own RFP");
        }
        catch (e) {
            // success
            console.log(e);
        }

        // try to bid and confirm bid successful
        let results = await instance.createProposal(1, "12345", { from: accounts[1]});

        console.log(await instance.getMyProposals.call({from: accounts[1]}));
        console.log(await instance.getMyProposals.call({from: accounts[0]}));
        console.log(await instance.getMyProposals.call({from: accounts[2]}));

        // try to update discount and update the terms
        await instance.updateTiers(2, [0, 100, 200], [100, 98, 95], { from: accounts[1]});
        try {
            await instance.updateDiscount(2, 3, 15, { from: accounts[0]});
            assert.fail("Should fail because user doesn't own it");
        }
        catch (e) {
            
        }
        await instance.updateDiscount(2, 3, 15, { from: accounts[1]});
        console.log(await instance.getProposal(2, {from: accounts[1]}));

        // const rfp = await instance.getRFP.call(1, {from:accounts[0]});
        // console.log(rfp, accounts[0]);
        //console.log(proposal);

        // proposal steps are: buyer approve, seller and buyer sign, buyer create contract

        // update the proposal
        try {
            results = await instance.buyerApprove(2, "Bob", {from: accounts[1]});
            assert.fail("Should fail because account 1 is not the buyer for this account");
        }
        catch (e) {
            // success
        }
        results = await instance.buyerApprove(2, "Bob", {from: accounts[0]}); // approved!
        try {
            results = await instance.buyerApprove(2, "Bob", {from: accounts[0]}); // approved!
            assert.fail("Should not be able to approve again after first approval transition state");
        } 
        catch (e) {
            // success
        }
        try {
            await instance.updateDiscount(2, 3, 15, { from: accounts[1]});
            assert.fail("Should fail proposal progressed beyond nego stage");
        }
        catch (e) {
            
        }
        results = await instance.signProposal(2, "Bob", {from: accounts[0]}); // sign it
        try {
            results = await instance.signProposal(2, {from: accounts[2]}); //should not be able to sign            
            assert.fail("Failed - a user not part of the proposal should not be able to sign this");
        }
        catch (e) {

        }

        // seller sign, and then confirm state is now 4
        results = await instance.signProposal(2, "BOB", {from: accounts[1]}); // sign it
        results = await instance.getProposal(2, {from:accounts[1]});
        assert.equal(results.currState, 4, "Invalid, the current state should proceed after both signatures");

        await instance.createProposal(1, "111", { from: accounts[2]});
        await instance.createProposal(1, "222", { from: accounts[3]});
        await instance.createProposal(1, "333", { from: accounts[4]});

        await instance.createRFP("222", { from: accounts[0]});
        await instance.createRFP("333", { from: accounts[0]});
        await instance.createRFP("444", { from: accounts[0]});

        console.log(await instance.getMyRFPs.call({from:accounts[0]}));
    });
});