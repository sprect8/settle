import { proposals } from "./fakeLayer";
import moment from 'moment';
import {
    UserObj,
    RFPsObj,
    contractAt,
    settleAt,
    asyncForEach
} from './sharedEth';

import { createIPFS } from "./ipfsDao";

const getActiveProposals = async (address) => {
    // const data = [
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         status: "review", // buyer has sent to seller terms for their review
    //         rfp: "0x02341534534",
    //         date: "2020-May-22",
    //         bidder: "Rio-Tinto",
    //         tiers: [
    //             {volume:"base", price: "1", currency: "USD", unit: 'ppu'},
    //             {volume:">100", price: "0.95", currency: "USD"},
    //             {volume:">200", price: "0.9", currency: "USD"},
    //             {volume:">300", price: "0.8", currency: "USD"},
    //         ],
    //         lastModified: "2 days ago",
    //     },
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         status: "draft", // seller submitted a proposal
    //         rfp: "0x02341534534",
    //         bidder: "BHP",
    //         tiers: [
    //             {volume:"base", price: "1.1", currency: "USD", unit: 'ppu'},
    //             {volume:">100", price: "0.95", currency: "USD"}                
    //         ],
    //         date: "2020-May-22",
    //         lastModified: "2 days ago",
    //     },
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         status: "declined", // seller declined to participate
    //         bidder: "Bob-co",
    //         rfp: "0x02341534534",
    //         date: "2020-May-22",
    //         lastModified: "2 days ago",
    //     },
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         rfp: "0xaa02341534534",
    //         status: "negotiation", // entered negotiation phase (payment terms)
    //         bidder: "Rio-Tinto",
    //         date: "2020-May-22",
    //         tiers: [
    //             {volume:"base", price: "1", currency: "USD", unit: 'ppu'},
    //             {volume:">100", price: "0.95", currency: "USD"},
    //             {volume:">200", price: "0.9", currency: "USD"},
    //             {volume:">300", price: "0.8", currency: "USD"},
    //         ],
    //         lastModified: "2 days ago",
    //     },
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         rfp: "0xaa02341534534",
    //         status: "closed", // rejected by buyer
    //         bidder: "Bob-co",
    //         date: "2020-May-22",
    //         tiers: [
    //             {volume:"base", price: "1.1", currency: "USD", unit: 'ppu'},
    //             {volume:">100", price: "0.95", currency: "USD"},
    //         ],
    //         lastModified: "2 days ago",
    //     },
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         rfp: "0xaa02341534534",
    //         status: "closed", // rejected by buyer
    //         bidder: "BHP",
    //         date: "2020-May-22",
    //         tiers: [
    //             {volume:"base", price: "1", currency: "USD", unit: 'ppu'},
    //             {volume:">300", price: "0.9", currency: "USD"},
    //         ],
    //         lastModified: "2 days ago",
    //     },
    // ];
    // return data;
    //console.log(proposals);
    //return proposals.filter(e=>e.buyerAddress === address || e.sellerAddress === address);

    console.log("Getting proposals ... ")

    const results = await RFPsObj.getMyProposals();
    let myProposals = [];
    await asyncForEach(results, async (rfp) => {
        const res = await getProposalById(rfp.toNumber());
        if (Object.keys(res).length == 0) return;
        res.proposalId = rfp.toNumber();
        myProposals.push(res);
    });
    return myProposals;
};

const createProposal = async (rfp, proposal) => {
    // proposal.rfpId = rfp.rfpId;
    // proposal.proposalId = proposals.length+1;
    // proposals.push(proposal);

    // return proposal;

    const ipfs = await createIPFS(proposal);
    const tx = await RFPsObj.createProposal(rfp.rfpId, ipfs);
    const result = await tx.wait();
    const proposalId = result.events[0].args.id.toNumber();
    // update tiers
    proposal.proposalId = proposalId;
    // await RFPsObj.updateTiers(proposalId, 
    //     proposal.tiers.map(e=> e.volume === "base" ? 0 : +e.volume),
    //     proposal.tiers.map(e=> +e.price)
    //     );

    // await RFPsObj.updateDiscount(proposalId, +proposal.discount.substring(1, 2), +proposal.discount[0]);
    // // update discounts

    return proposal;
};

const updateProposal = async (proposal) => {
    // const result = proposals.filter(e=>proposal.proposalId === e.proposalId);
    // if (!result || result.length === 0) {
    //     return;
    // }
    // Object.assign(result[0], proposal);
    // return proposal;

    if (proposal.status == "signature" || proposal.status == "award") {
        if (proposal.buyerSigned || proposal.sellerSigned) {
            const ipfs = await createIPFS(proposal);
            const tx = await RFPsObj.signProposal(proposal.proposalId, ipfs);
            await tx.wait();
        }
        else {
            // signing! means our client just accepted so lets accept online as well
            const ipfs = await createIPFS(proposal);
            const tx = await RFPsObj.buyerApprove(proposal.proposalId, ipfs);
            await tx.wait();
        }
    }

    return proposal;
};

const getProposalById = async (id) => {
    // const result = proposals.filter(e=>id === e.proposalId);
    // if (!result || result.length === 0) {
    //     return {};
    // }

    // return result[0];
    console.log(">> Proposal", id);
    const result = await RFPsObj.getProposal(id);
    if (!result.docAddress.startsWith("Q")) {
        return {};
    }

    let res = await fetch("https://ipfs.infura.io/ipfs/" + result.docAddress);
    res = await res.json();
    res.date = moment(new Date(res.date));
    res.validity = moment(new Date(res.validity));
    res.proposalId = id;
    
    return res;
};

export {
    getActiveProposals,
    createProposal,
    updateProposal,
    getProposalById
};