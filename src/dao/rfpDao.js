// proposal and contract differ by signature and contract state (draft-review-negotiation vs issued/active/inactive/expired)
import { rfps as activeRFPs, proposals, contracts } from './fakeLayer';
import {
    UserObj,
    RFPsObj,
    contractAt,
    settleAt,
    asyncForEach
} from './sharedEth';

import moment from 'moment';

import IPFSNode, { createIPFS } from "./ipfsDao";
//     {
//         product: "Iron Ore Shipment",
//         description: "Iron Ore - 200 tonnes",
//         status: "issued",
//         date: "2020-May-22",
//         lastModified: "2 days ago",
//     },
//     {
//         product: "Iron Ore Shipment",
//         description: "Iron Ore - 200 tonnes",
//         status: "issued",
//         date: "2020-May-22",
//         lastModified: "2 days ago",
//     },
//     {
//         product: "Iron Ore Shipment",
//         description: "Iron Ore - 200 tonnes",
//         status: "review",
//         bidders: ["Bob-co", "Rio-Tinto", "BHP"],
//         date: "2020-May-22",
//         lastModified: "2 days ago",
//     },
//     {
//         product: "Iron Ore Shipment",
//         description: "Iron Ore - 200 tonnes",
//         status: "negotiation",
//         bidders: ["Bob-co", "Rio-Tinto", "BHP"],
//         date: "2020-May-22",
//         lastModified: "2 days ago",
//     },
//     {
//         product: "Iron Ore Shipment",
//         description: "Iron Ore - 200 tonnes",
//         status: "signing",
//         bidders: ["Rio-Tinto"],
//         date: "2020-May-22",
//         lastModified: "2 days ago",
//     },
//     {
//         product: "Iron Ore Shipment",
//         description: "Iron Ore - 200 tonnes",
//         status: "awarded",
//         bidders: ["Rio-Tinto"],
//         date: "2020-May-22",
//         lastModified: "2 days ago",
//     },
//     {
//         product: "Iron Ore Shipment",
//         description: "Iron Ore - 200 tonnes",
//         status: "awarded",
//         bidders: ["BHP"],
//         date: "2020-May-22",
//         lastModified: "2 days ago",
//     },
// ];

const getMyRFPs = async (address) => {
    const results = await RFPsObj.getMyRFPs();
    let myRFPs = [];
    await asyncForEach(results, async (rfp) => {
        // const result = await RFPsObj.getRFP(rfp.toNumber());
        // // https://ipfs.infura.io/ipfs/QmSRF3opLggS3oNwt8KX4GCKaxaYWuV7or4ZHM831xrRpp
        // if (!result.docAddress.startsWith("Q")) {
        //     return;
        // }

        // let res = await fetch("https://ipfs.infura.io/ipfs/" + result.docAddress);
        // res = await res.json();
        // res.date = moment(new Date(res.date));
        // res.validity = moment(new Date(res.validity));
        // res.rfpId = rfp.toNumber();

        const res = await getRFPById(rfp.toNumber());
        if (Object.keys(res).length == 0) return;
        myRFPs.push(res);
    });

    // const rfps = activeRFPs.filter(e => address === e.buyerAddress);
    // rfps.forEach(e => {
    //     console.log(e, proposals);
    //     e.bidders = proposals.filter(p => p.rfpId === e.rfpId).map(e => e.seller);
    // });
    return myRFPs;
};

const updateRFP = async (rfp) => {
    // const result = activeRFPs.filter(e => rfp.contractId === e.contractId);
    // if (!result || result.length === 0) {
    //     return;
    // }
    // Object.assign(result[0], rfp);

    // note: updateRFP is broken - its not being used

    return rfp;
};

const createRFP = async (rfp) => {
    // create RFP entry to blockchain (including address)    
    // 
    rfp.rfpId = activeRFPs.length + 1;
    activeRFPs.push(rfp);

    const result = await IPFSNode.add(JSON.stringify(rfp));//uffer.from(JSON.stringify(rfp)));

    // .then(res => {
    //     const hash = res[0].hash
    //     console.log('added data hash:', hash)
    //     return ipfs.files.cat(hash)
    // })
    // .then(output => {
    //     console.log('retrieved data:', JSON.parse(output))
    // })
    for await (const file of result) {
        console.log("TCL: App -> forawait -> file", file);
        const filePath = file.path;
        const tx = await RFPsObj.createRFP(filePath);
        await tx.wait();
        console.log("Done!");
    }

    return rfp;
};

const getRFPById = async (id) => {
    // const result = activeRFPs.filter(e => id === e.rfpId);
    // if (!result || result.length === 0) {
    //     return {};
    // }
    // return result[0];
    const result = await RFPsObj.getRFP(id);
    // https://ipfs.infura.io/ipfs/QmSRF3opLggS3oNwt8KX4GCKaxaYWuV7or4ZHM831xrRpp
    if (!result.docAddress.startsWith("Q")) {
        return {};
    }

    let res = await fetch("https://ipfs.infura.io/ipfs/" + result.docAddress);
    res = await res.json();
    res.date = moment(new Date(res.date));
    res.validity = moment(new Date(res.validity));
    res.rfpId = id;

    return res;
};

const getActiveRFPs = async () => {
    // return activeRFPs.filter(e => e.status !== "awarded");
    const results = await RFPsObj.getAllRFPs();
    const activeRFPs = [];
    await asyncForEach(results, async e=>{
        const res = await getRFPById(e.toNumber());
        console.log(res);
        if (Object.keys(res).length == 0) return;
        if (res.status === "awarded") return;
        activeRFPs.push(res);
    });
    return activeRFPs;
};

const supportedCurrency = [
    "btc", "band", "eth"
];
const createContract = async (proposal) => {
    // decline all active proposals
    //const activeProposals = proposals.filter(x => x.rfpId === proposal.rfpId && x.proposalId !== proposal.proposalId);
    //activeProposals.forEach(e => e.status = "declined");
    // TODO: find active proposals against this rfp and decline them!


    // TODO: remove rfp from list of active rfps on the market place
    //const results = activeRFPs.filter(e => e.rfpId === proposal.rfpId).map(x => x.status = "awarded");
    //proposals.filter(e => e.proposalId === proposal.proposalId).map(x => x.status = "awarded");

    // create contract
    // const contract = Object.assign({ contractId: contracts.length + 1, contractStatus: "active", activeTier: 0, purchased: 0, posActive: 0 }, proposal, results[0]);
    // contracts.push(contract);

    // uint256 proposalId,
    //     string memory docAddress,
    //     uint16[] memory volumes,
    //     uint16[] memory ppi,
    //     uint256[2] memory paymentTerms,
    //     uint256 dayTerms,
    //     uint256 currency

    proposal.status = "awarded";

    let discountTerms = 0;
    let discountPercent = 0;
    if (proposal.discount && proposal.discount.length > 2) {
        discountTerms = +proposal.discount.substring(1,3);
        discountPercent = +proposal.discount[0];
    }
    let currency = supportedCurrency.indexOf(proposal.paymentType.toLowerCase());
    if (currency < 0) currency = 2;
    const contract = Object.assign({ contractId: contracts.length + 1, contractStatus: "active", activeTier: 0, purchased: 0, posActive: 0 }, proposal);
    const ipfs = await createIPFS(contract);
    const ipfsProposal = await createIPFS(proposal);
    
    let tx = await RFPsObj.createContractFromProposal(proposal.proposalId, ipfs, ipfsProposal,
        proposal.tiers.map(e=> e.volume === "base" ? 0 : +e.volume), // volumes
        proposal.tiers.map(e=> +e.price), // price
        [discountTerms, discountPercent],
        +proposal.terms.replace("net", ""),
        currency
    );
    let result = await tx.wait();
    console.log(result);
    
    return contract;
};

export {
    getActiveRFPs,
    getMyRFPs,
    createRFP,
    updateRFP,
    getRFPById,
    createContract
};