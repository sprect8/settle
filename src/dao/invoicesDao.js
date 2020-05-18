import { invoices, accountBalances, purchaseOrders, contracts } from "./fakeLayer";
import moment from 'moment';
import { RFPsObj, contractAt, asyncForEach, settleAt, UserObj, currencyPricing } from "./sharedEth";
const getActiveInvoices = () => {
    // delivered - invoiced - paid

    // const data = [{
    //     sno: '99215',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "delivered",
    //     date: "2020-May-22",
    //     pricing: "900000",
    //     lastModified: "2 days ago",
    // },
    // {
    //     sno: '99213',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "delivered",
    //     date: "2020-May-22",
    //     pricing: "1100000",
    //     lastModified: "2 days ago",
    // },
    // {
    //     sno: '992445',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "invoiced",
    //     date: "2020-May-22",
    //     pricing: "1200000",
    //     lastModified: "2 days ago",
    // },
    // {
    //     sno: '99345',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "invoiced",
    //     date: "2020-May-22",
    //     pricing: "1200000",
    //     lastModified: "2 days ago",
    // },
    // {
    //     sno: '99225',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "paid",
    //     date: "2020-May-22",
    //     pricing: "1500000",
    //     lastModified: "2 days ago",
    // }];

    // return data;
    return invoices;
};

const getMyInvoices = async (address) => {
    // const invoice = {
    //     invoiceId: invoices.length + 1,
    //     poId: purchaseOrder.poId,
    //     contractId: purchaseOrder.contractId,
    //     contract: purchaseOrder.contract,
    //     orderDetails: purchaseOrder.orderDetails,
    //     status: "invoiced",
    //     totalOwed: "",
    //     totalPaid: 0,
    //     dueDate: new Date(),
    //     date: new Date(),
    //     lastModified: "2 days ago",
    // };

    // const invoice = {
    //     invoiceId: invoices.length + 1,
    //     poId: purchaseOrder.poId,
    //     contractId: purchaseOrder.contractId,
    //     contract: purchaseOrder.contract,
    //     orderDetails: purchaseOrder.orderDetails,
    //     status: "invoiced",
    //     totalOwed: "",
    //     totalPaid: 0,
    //     dueDate: new Date(), // evaluate the due date for this invoice based on the contract logic
    //     date: new Date(),
    //     lastModified: new Date(),
    // };

    // {
    //     sno: '99225',
    //     contract: "0x2093849ABCS234039abcdeeff",
    //     volume: 70,
    //     supplier: 'Rio-Tinto',
    //     product: "Iron Ore Shipment",
    //     status: "paid",
    //     date: "2020-May-22",
    //     pricing: "1500000",
    //     lastModified: "2 days ago",
    // }];
    // console.log(invoices);
    // return invoices
    //     .filter(e => e.buyerAddress === address || e.sellerAddress === address)
    //     .map(e => {
    //         return {
    //             key: e.invoiceId,
    //             invoiceId: e.invoiceId,
    //             contractId: e.contractId,
    //             poId: e.poId,
    //             seller: e.seller,
    //             product: e.product,
    //             totalOwed: e.totalOwed,
    //             totalPaid: e.totalPaid,
    //             status: e.status,
    //             dueDate: e.dueDate,
    //             issueDate: e.issueDate,
    //             orderDetails: e.orderDetails,
    //             lastModified: e.lastModified,
    //             volume: e.volume,
    //             discount: e.discount,
    //             terms: e.terms,
    //             paymentType: e.paymentType,
    //         };
    //     });

    const contracts = await RFPsObj.getContracts();
    const invoices = [];
    await asyncForEach(contracts, async contract => {
        let contractObj = contractAt(contract);
        let pos = await contractObj.getMyPurchaseOrders();
        await asyncForEach(pos, async po => {
            invoices.push(await getInvoiceById(po, contract));
        });
    });

    return invoices;

};

const getObject = (e) => {
    let res = {
        key: e.invoiceId.toNumber ? e.invoiceId.toNumber() : e.invoiceId,
        invoiceId: e.invoiceId.toNumber ? e.invoiceId.toNumber() : e.invoiceId,
        contractId: e.contractId,
        poId: e.poId.toNumber ? e.poId.toNumber() : e.poId,
        seller: e.contract.seller,
        sellerAddress: e.contract.sellerAddress,
        buyer: e.contract.buyer,
        buyerAddress: e.contract.buyerAddress,
        product: e.contract.product,
        totalOwed: e.totalOwed.toNumber ? e.totalOwed.toNumber() : e.totalOwed,
        totalPaid: e.totalPaid.toNumber ? e.totalPaid.toNumber() : e.totalPaid,
        status: e.status,
        dueDate: moment(e.invoiceDates[1].toNumber() * 1000),
        issueDate: moment(e.invoiceDates[0].toNumber() * 1000),
        orderDetails: e.orderDetails,
        lastModified: e.date,
        volume: e.orderDetails[0].total,
        discount: +e.contract.discount,
        terms: e.contract.terms,
        paymentType: e.contract.paymentType,
        settleCurrency: e.settleCurrency.toNumber ? e.settleCurrency.toNumber() : e.settleCurrency,
        paymentDate: moment()

    };

    if (e.settled) {
        res.status = "paid";
    }

    return res;
};

const getInvoiceById = async (invoiceId, contractId) => {
    // const results = invoices.filter(e => e.invoiceId === invoiceId);
    // if (!results || results.length === 0) {
    //     return {};
    // }
    // const invoice = results[0];

    // if (invoice.discount) {
    //     let discount = +invoice.totalOwed * +((invoice.discount + "").substring(0, 1)) / 100;
    //     let date = +((invoice.discount + "").substring(1, 3));
    //     let payDate = invoice.issueDate.add(date, "days");
    //     let eligibleDiscounts = discount;
    //     if (payDate < moment()) {
    //         eligibleDiscounts = 0;
    //     }
    //     invoice.eligibleDiscounts = eligibleDiscounts;
    // }

    // return results[0];
    console.log(">> ContractObj", invoiceId, contractId);

    const contractObj = contractAt(contractId);

    const result = await contractObj.getPurchaseOrder(invoiceId);
    if (!result.docAddress.startsWith("Q")) {
        return {};
    }

    let res = await fetch("https://ipfs.infura.io/ipfs/" + result.docAddress);
    res = await res.json();
    res.date = moment(new Date(res.date));
    res.validity = moment(new Date(res.validity));
    res.deliveryDate = moment(new Date(res.deliveryDate));
    res.poId = invoiceId;
    res.contractId = contractId;
    res.invoiceId = invoiceId;

    let invoice = await contractObj.getInvoice(invoiceId);
    const settle = settleAt(invoice.settleAddress);
    console.log(res);
    if (invoice.discount) {
        let discount = +invoice.totalOwed * +((invoice.discount + "").substring(0, 1)) / 100;
        let date = +((invoice.discount + "").substring(1, 3));
        let payDate = invoice.issueDate.add(date, "days");
        let eligibleDiscounts = discount;
        if (payDate < moment()) {
            eligibleDiscounts = 0;
        }
        invoice.eligibleDiscounts = eligibleDiscounts;
    }
    res = Object.assign(res, invoice, await settle.getSettleDetails());
    res = getObject(res);

    console.log(res);

    return res;
};

let cached = [];

const smartSettlement = async (settle) => {
    console.log(cached);
    if (cached.length > 0) return cached;

    const balances = UserObj.getMyBalance();
    const settlement = [];

    await asyncForEach(["btc", "band", "eth"], async (symbol) => {
        const body = `{
                "codeHash": "6b7be61b150aec5eb853afb3b53e41438959554580d31259a1095e51645bcd28",
                "params": {
                    "crypto_symbol": "${symbol.toUpperCase()}"
                },
                "type": "FULL"
            }`;
        const result = await fetch("http://rpc.alpha.bandchain.org/bandsv/request", { method: "POST", body: body });
        const jsonObj = await result.json();
        console.log(jsonObj);
        let price = await (await fetch(`http://rpc.alpha.bandchain.org/zoracle/request/${jsonObj.id}`)).json();
        console.log(price);

        if (price && price.result && price.result.result.crypto_price_in_usd) {
            currencyPricing[symbol.toUpperCase()] = price.result.result.crypto_price_in_usd / 100;
        }

        const results = {
            proof: jsonObj,
            price: price
        };
        settlement.push(results);
    });

    cached = settlement;

    return settlement;
};

const getBalance = async (address) => {
    let supportedCurrencies = accountBalances[address];
    if (!supportedCurrencies) {
        supportedCurrencies = [
            { "symbol": "BAND", "name": "Band", "hodling": 1000, "price": 1.05 }, // this
            //{ "symbol": "BNB", "name": "Binance", "hodling": 10, "price": 16.20 },
            { "symbol": "BTC", "name": "Bitcoin", "hodling": 1, "price": 9346.73 },  // this
            { "symbol": "ETH", "name": "Ethereum", "hodling": 20, "price": 199.98 }, // this
            //{ "symbol": "LTC", "name": "Litecoin", "hodling": 10, "price": 43.33}, // this
        ].map(e => {
            e.balance = e.hodling * e.price;
            e.balance = Math.round(e.balance * 100) / 100;
            return e;
        });
        accountBalances[address] = supportedCurrencies;
    }
    return supportedCurrencies;
};

const recalculate = async (balances) => {
    balances.map(e => {
        e.balance = e.hodling * e.price;
        e.balance = Math.round(e.balance * 100) / 100;
        return e;
    });
}

//created, payment-pending, paid, overdue, paid-overdue
const payInvoice = async (contractId, invoiceId, payment) => {
    const invoice = await getInvoiceById(invoiceId, contractId);

    // now I have the invoice information ... 
    // payment will have the breakdown by crypto!
    const total = payment.reduce((acc, e) => acc + (+e.payment), 0);
    let status = "paid";

    const repaid = invoice.totalPaid + total >= invoice.totalOwed - invoice.eligibleDiscounts;
    if (invoice.dueDate < moment() && !repaid) {
        status = "overdue";
    }
    if (!repaid) {
        if (status === "overdue")
            status = "payment-pending-overdue";
        else
            status = "payment-pending";
    }
    else {
        if (status === "overdue")
            status = "paid-overdue";
    }

    const contractObj = contractAt(contractId);

    const targetProof = payment[invoice.settleCurrency].proof;
    let index = 0;
    await asyncForEach(payment, async c => {
        if (c.payment <= 0) return;
        console.log(c);
        const tx = await contractObj.settle(invoiceId, "0x" + c.proof, "0x" + targetProof, index, Math.ceil(c.payment));
        await tx.wait();
    });

    return await getInvoiceById(invoiceId, contractId);

    // // assume balance is legitimate

    // // invoice.buyerAddress
    // // invoice.sellerAddress    
    // const buyerBalance = await getBalance(invoice.buyerAddress);
    // const sellerBalance = await getBalance(invoice.sellerAddress);

    // console.log(buyerBalance, sellerBalance, invoice, payment);

    // buyerBalance.forEach(e => {
    //     const pay = payment.filter(payment => e.symbol === payment.symbol)[0];
    //     // deduct total
    //     // 
    //     e.hodling = e.hodling - (+pay.payment / pay.price);

    // });
    // recalculate(buyerBalance);
    // invoice.totalPaid += total;
    // console.log(repaid, invoice);
    // if (repaid) {
    //     invoice.totalPaid = invoice.totalOwed - invoice.eligibleDiscounts; // payment done!
    //     // lets auto-disburse to seller
    //     const target = sellerBalance.filter(e => e.symbol === invoice.paymentType.toUpperCase())[0];
    //     target.hodling += invoice.totalOwed / target.price;
    //     recalculate(sellerBalance);
    //     invoice.paymentDate = moment(); // date of payment

    //     // update the state of the purchase order!!
    //     const purchaseOrder = purchaseOrders.filter(e => e.poId === invoice.poId)[0];
    //     purchaseOrder.status = "paid";
    //     purchaseOrder.totalPaid = invoice.totalPaid;
    //     purchaseOrder.paymentDate = invoice.paymentDate;
    //     // save

    //     const contract = contracts.filter(e => e.contractId === invoice.contractId)[0];
    //     contract.purchased += +invoice.volume;
    //     // save
    //     // evaluate the next tier of discounts applicable
    // }
    // invoice.status = status;

    return invoice;
};

export {
    getActiveInvoices,
    getInvoiceById,
    getMyInvoices,
    payInvoice,
    smartSettlement
};