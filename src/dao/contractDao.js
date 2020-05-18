import { contracts } from "./fakeLayer";
import moment from "moment";
import { RFPsObj, asyncForEach, contractAt } from "./sharedEth";
const getActiveContracts = async () => {
    // const data = [
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         status: "issued", // buyer has sent to seller terms for their review (pending signature from Rio Tinto)
    //         contract: "0x02341534534",
    //         date: "2020-May-22",
    //         supplier: "Rio-Tinto",
    //         tiers: [
    //             { volume: "base", price: "1", currency: "USD", unit: 'ppu' },
    //             { volume: ">100", price: "0.95", currency: "USD" },
    //             { volume: ">200", price: "0.9", currency: "USD" },
    //             { volume: ">300", price: "0.8", currency: "USD" },
    //         ],
    //         activeTier: { volume: "base", price: "1", currency: "USD", unit: 'ppu' },
    //         purchased: 0,
    //         posActive: 0,
    //         lastModified: "2 days ago",
    //     },
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         status: "active", // active contract with volume discounts valid
    //         contract: "0x023415345343333bbbfb",
    //         supplier: "BHP",
    //         tiers: [
    //             { volume: "base", price: "1.1", currency: "USD", unit: 'ppu' },
    //             { volume: ">100", price: "0.95", currency: "USD" }
    //         ],
    //         activeTier: { volume: ">100", price: "0.95", currency: "USD" },
    //         purchased: 120,
    //         posActive: 3,
    //         date: "2020-May-22",
    //         lastModified: "2 days ago",
    //     },
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         status: "in-use", // in-use, but no new POs can be issued
    //         contract: "0x023415345343333bebbb",
    //         supplier: "BHP",
    //         tiers: [
    //             { volume: "base", price: "1.1", currency: "USD", unit: 'ppu' },
    //             { volume: ">100", price: "0.95", currency: "USD" }
    //         ],
    //         activeTier: { volume: ">100", price: "0.95", currency: "USD" },
    //         purchased: 20,
    //         posActive: 3,
    //         date: "2020-May-22",
    //         lastModified: "2 days ago",
    //     },
    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         status: "inactive", // inactive either by buyer or seller
    //         contract: "0x023415345343333bbbdb",
    //         supplier: "BHP",
    //         tiers: [
    //             { volume: "base", price: "1.1", currency: "USD", unit: 'ppu' },
    //             { volume: ">100", price: "0.95", currency: "USD" }
    //         ],
    //         activeTier: { volume: ">100", price: "0.95", currency: "USD" },
    //         purchased: 1200,
    //         posActive: 20,
    //         date: "2020-May-22",
    //         lastModified: "2 days ago",
    //     },

    //     {
    //         product: "Iron Ore Shipment",
    //         description: "Iron Ore - 200 tonnes",
    //         status: "expired", // contract validity date has elapsed
    //         contract: "0x023415345343333bbbcb",
    //         supplier: "BHP",
    //         tiers: [
    //             { volume: "base", price: "1.1", currency: "USD", unit: 'ppu' },
    //             { volume: ">100", price: "0.95", currency: "USD" }
    //         ],
    //         activeTier: { volume: ">100", price: "0.95", currency: "USD" },
    //         purchased: 120,
    //         posActive: 3,
    //         date: "2020-May-22",
    //         lastModified: "2 days ago",
    //     },
    // ];
    const contractIds = await RFPsObj.getContracts(); // address of all contracts 
    const contracts = [];
    await asyncForEach(contractIds, async contract=>{
        const c = await getContractById(contract);
        if (Object.keys(c).length === 0) return;
        contracts.push(c);
    });
    return contracts;
};

const getMyContracts = async (address) => {
    //return contracts.filter(e=>e.buyerAddress === address || e.sellerAddress === address);
    return await getActiveContracts();
};

const getMyUseableContracts = async (address) => {
    //return contracts.filter(e=>e.buyerAddress === address);
    return (await getActiveContracts()).filter(e=>e.buyerAddress === address);
};

const getContractById = async (contractId) => {

    const contractObj = await contractAt(contractId); //RFPsObj.getRFP(id);
    const result = await contractObj.getContract();

    console.log(result, contractId);

    // https://ipfs.infura.io/ipfs/QmSRF3opLggS3oNwt8KX4GCKaxaYWuV7or4ZHM831xrRpp
    if (!result.docAddress.startsWith("Q")) {
        return {};
    }

    let res = await fetch("https://ipfs.infura.io/ipfs/" + result.docAddress);
    res = await res.json();
    if (res.date)
        res.date = moment(new Date(res.date));
    if (res.validity)
        res.validity = moment(new Date(res.validity));

    res.contractId = contractId;

    return res;
};

export {
    getContractById,
    getMyContracts,
    getActiveContracts,
    getMyUseableContracts
};