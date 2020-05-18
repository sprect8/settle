import { purchaseOrders, invoices } from './fakeLayer';
import moment from "moment";

import { getActiveContracts } from './contractDao';
import { RFPsObj, asyncForEach, contractAt } from './sharedEth';
import { createIPFS } from './ipfsDao';
const getActivePOs = async () => {
    // sent - accepted - in progress - ready - in transit - delivered - invoiced - paid
    // const data = [{

    //     sno: '99215',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "sent",
    //     date: "2020-May-22",
    //     lastModified: "2 days ago",
    // },
    // {
    //     sno: '99213',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "ready",
    //     date: "2020-May-22",
    //     lastModified: "2 days ago",
    // },
    // {
    //     sno: '992445',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "in-transit",
    //     date: "2020-May-22",
    //     lastModified: "2 days ago",
    // },
    // {
    //     sno: '99345',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "delivered",
    //     date: "2020-May-22",
    //     lastModified: "2 days ago",
    // },
    // {
    //     sno: '99225',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "in-progress",
    //     date: "2020-May-22",
    //     lastModified: "2 days ago",
    // }];
    // get all contracts, get all po from contracts
    const contracts = await RFPsObj.getContracts();
    const purchaseOrders = [];
    await asyncForEach(contracts, async contract => {
        let contractObj = contractAt(contract);
        let pos = await contractObj.getMyPurchaseOrders();
        await asyncForEach(pos, async po => {
            purchaseOrders.push(await getPOById(po, contract));
        });
    });

    return purchaseOrders;
};

const getMyPOs = async (address) => {
    //return purchaseOrders.filter(e=>e.contract.buyerAddress === address || e.contract.sellerAddress === address);
    return await getActivePOs();
};

const createPO = async (contract, purchaseOrder) => {
    purchaseOrder.contractId = contract.contractId;
    purchaseOrder.contract = contract;
    purchaseOrder.poId = purchaseOrders.length + 1;

    //purchaseOrders.push(purchaseOrder);

    console.log(purchaseOrder);

    const ipfs = await createIPFS(purchaseOrder);
    const contractObj = contractAt(contract.contractId);


    const tx = await contractObj.issuePurchaseOrder(purchaseOrder.deliveryDate.unix(), +purchaseOrder.orderDetails[0].total, ipfs);
    await tx.wait();

    return purchaseOrder;
};

const PO_STEPS = ['draft', 'review', 'terms', 'delivery', 'received', 'invoicing', 'payment-pending'];

const updatePO = async (purchaseOrder) => {

    const currIndex = PO_STEPS.indexOf(purchaseOrder.status.toLowerCase()) - 1;
    const contractObj = contractAt(purchaseOrder.contractId);

    const ipfs = await createIPFS(purchaseOrder);
    let tx = 0;
    switch(currIndex) {
        case 1:
            let total = 0;
            if (purchaseOrder.orderDetails.length > 1) {
                total = purchaseOrder.orderDetails.reduce((acc, obj) => acc + (+obj.price), 0);
            }
            tx = await contractObj.reviewPurchaseOrder(+purchaseOrder.poId, total, ipfs);
            await tx.wait();
            break;
        case 2:
            tx = await contractObj.acceptPOTerms(purchaseOrder.poId, ipfs);
            await tx.wait();
            break;
        case 3:
            tx = await contractObj.indicateDelivered(purchaseOrder.poId, ipfs);
            await tx.wait();
            break;
        case 4:
            tx = await contractObj.ackDelivered(purchaseOrder.poId, ipfs);
            await tx.wait();
            break;
    }
        
    return purchaseOrder;
};

const getPOById = async (poId, contractId) => {
    console.log(">> Purchase Order", poId, contractId);

    const contractObj = contractAt(contractId);

    const result = await contractObj.getPurchaseOrder(poId);
    if (!result.docAddress.startsWith("Q")) {
        return {};
    }
    console.log(result);

    let res = await fetch("https://ipfs.infura.io/ipfs/" + result.docAddress);
    res = await res.json();
    console.log(res, result.docAddress);
    res.date = moment(new Date(res.date));
    res.validity = moment(new Date(res.validity));
    res.deliveryDate = moment(new Date(res.deliveryDate));
    res.poId = poId;
    res.contractId = contractId;
    console.log(res);

    if (result.status == 6) {
        res.status = "payment-pending";
    }
    if (result.status == 7) {
        res.status = "paid";
    }

    return res;
};

const estimatePricing = async (contractId, volume) => {
    const results = (await getActiveContracts()).filter(e => contractId === e.contractId);
    if (!results || results.length === 0) {
        return 'N/A';
    }

    // figure out how much already purchased and paid for
    // figure out the tier we are using
    const contract = results[0];
    const baseTier = contract.tiers.filter(x => x.volume === 'base');
    if (!baseTier || baseTier.length === 0) {
        return 'N/A';
    }

    return +baseTier[0].price * +volume;
};

const createInvoiceFromPurchaseOrder = async (purchaseOrder) => {

    // const invoice = {
    //     invoiceId: invoices.length + 1,
    //     poId: purchaseOrder.poId,
    //     contractId: purchaseOrder.contractId,
    //     buyer: purchaseOrder.contract.buyer,
    //     buyerAddress: purchaseOrder.contract.buyerAddress,
    //     seller: purchaseOrder.contract.seller,
    //     sellerAddress: purchaseOrder.contract.sellerAddress,
    //     product: purchaseOrder.contract.product,
    //     orderDetails: purchaseOrder.orderDetails,
    //     discount: purchaseOrder.contract.discount,
    //     terms: purchaseOrder.contract.terms,
    //     paymentType: purchaseOrder.contract.paymentType,
    //     status: "created", //created, payment-pending, paid, overdue, paid-overdue
    //     totalOwed: purchaseOrder.orderDetails.reduce((acc, curr) => { return acc + (+curr.price); }, 0),
    //     totalPaid: 0,
    //     volume: purchaseOrder.orderDetails[0].total,
    //     dueDate: moment(new Date()).add(+(purchaseOrder.contract.terms.replace("net", "")), "days"), // evaluate the due date for this invoice based on the contract logic
    //     issueDate: moment(),
    //     lastModified: moment(),
    // };
    // purchaseOrder.invoiceId = invoice.invoiceId;
    // await updatePO(purchaseOrder);

    // invoices.push(invoice);
    // return invoice;

    const contractObj = contractAt(purchaseOrder.contractId);
    const tx = await contractObj.issueInvoice(purchaseOrder.poId);
    await tx.wait();

    // get invoice
    let invoice = await contractObj.getInvoice(purchaseOrder.poId);
    invoice = Object.assign(purchaseOrder, invoice);
    invoice.status = "payment-pending";
    return invoice;
};

export {
    getActivePOs,
    createPO,
    updatePO,
    getPOById,
    getMyPOs,
    estimatePricing,
    createInvoiceFromPurchaseOrder
};