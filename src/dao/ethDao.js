import { ethers } from 'ethers';
import { accountBalances } from './fakeLayer';
import * as UserABI from '../abi/Users';
import config from "../config/config";
import { currencyPricing } from './sharedEth';

export * from './inboxDao';
export * from './poDao';
export * from './rfpDao';
export * from './invoicesDao';
export * from './proposalsDao';
export * from './contractDao';

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

// connections and such
let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
let signer = provider.getSigner();
let registered = false;
const company = {};
console.log(config.addresses.user);
let UserObj = new ethers.Contract(config.addresses.user, UserABI.default, provider).connect(signer);

if (window.ethereum) {
    window.ethereum.enable().then(e => {
        // connections and such
        provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
        signer = provider.getSigner();
        registered = false;
        UserObj = new ethers.Contract(config.addresses.user, UserABI.default, provider).connect(signer);

    });
}
else {
    // connections and such
    provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    signer = provider.getSigner();
    registered = false;
    UserObj = new ethers.Contract(config.addresses.user, UserABI.default, provider).connect(signer);
}

const getAddress = async () => {
    let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    let signer = provider.getSigner();
    return await signer.getAddress();
};
const getBalance = async () => {
    return await provider.getBalance(await getAddress());
};
const checkRegistered = (cb) => {
    // setTimeout(async e => {
    //     company.address = await getAddress();
    //     cb({ registered: registered, address: company.address, name: company.name, role: company.role, balance: ethers.utils.formatEther(await getBalance()) });
    // }, 1000);
    UserObj.userExists().then(async e => {
        cb({ registered: e.exists, address: await getAddress(), name: e.name, role: e.role.toNumber(), balance: ethers.utils.formatEther(await getBalance()) });
    });
};

const registerUser = async (companyName, role, cb) => {
    company.name = companyName;
    company.role = role;
    registered = true;
    console.log(companyName, role);
    let overrides = {

        // The maximum units of gas for the transaction to use
        gasLimit: 150000,

        // The price (in wei) per unit of gas
        gasPrice: ethers.utils.parseUnits('9.0', 'gwei'),
    };
    const tx = await UserObj.register(companyName, 1, overrides);
    console.log(tx.hash);
    await tx.wait();
    checkRegistered(cb);
};

const getIndicators = async () => {
    return {
        inbox: 3,
        outbox: 0,
        RFPs: 0,
        contracts: 4,
        purchaseOrders: 2,
        invoices: 3
    };
};

// do target currency conversions
// use dai

const cachedResults = [];

const getCryptoBalance = async (address) => {
    let supportedCurrencies = accountBalances[address];
    if (!supportedCurrencies) {
        let results = await UserObj.getMyBalance();

        supportedCurrencies = [
            { "symbol": "BTC", "name": "Bitcoin", "hodling": 1, "price": 9346.73, payment: 0 },  // this
            { "symbol": "BAND", "name": "Band", "hodling": 1000, "price": 1.05, payment: 0 }, // this
            //{ "symbol": "BNB", "name": "Binance", "hodling": 10, "price": 16.20 },
            { "symbol": "ETH", "name": "Ethereum", "hodling": 20, "price": 199.98, payment: 0 }, // this
            //{ "symbol": "LTC", "name": "Litecoin", "hodling": 10, "price": 43.33}, // this
        ].map((e, i) => {
            const balance = results[i].toNumber() / 1000000;
            e.price = currencyPricing[e.symbol];
            e.balance = balance * e.price;
            e.hodling = balance;
            e.balance = Math.round(e.balance * 100) / 100;
            return e;
        });

        console.log(results);

        accountBalances[address] = supportedCurrencies;
    }

    console.log(supportedCurrencies);

    // if (cachedResults.length > 0) {
    //     // use cached
    //     supportedCurrencies.forEach(currency => {
    //         currency.usd = cachedResults.filter(e => currency.symbol === e.symbol)[0].usd;            
    //     });
    //     return supportedCurrencies;
    // }

    // map array to promises
    // const promises = supportedCurrencies.map(async (currency) => {
    //     const body = `{
    //         "codeHash": "6b7be61b150aec5eb853afb3b53e41438959554580d31259a1095e51645bcd28",
    //         "params": {
    //             "crypto_symbol": "${currency.symbol}"
    //         },
    //         "type": "SYNCHRONOUS"
    //     }`;
    //     const result = await fetch("http://rpc.alpha.bandchain.org/bandsv/request", { method: "POST", body: body });
    //     const jsonObj = await result.json();
    //     //const payload = await (await fetch(`http://rpc.alpha.bandchain.org/zoracle/request/${jsonObj.id}`)).json();
    //     //currency.usd = payload.result.result.crypto_price_in_usd/100;
    //     //cachedResults.push(currency);
    //     return [jsonObj, currency];
    // });

    // const responseIDs = await Promise.all(promises);
    // await asyncForEach(responseIDs, (async (resp) => {
    //     const jsonObj = resp[0];
    //     const currency = resp[1];
    //     let payload = await (await fetch(`http://rpc.alpha.bandchain.org/zoracle/request/${jsonObj.id}`)).json();
    //     while (!payload.result.result.crypto_price_in_usd) {
    //         await new Promise(r => setTimeout(r, 3000)); // their API doesn't return results immediately
    //         console.log("Failed");
    //         payload = await (await fetch(`http://rpc.alpha.bandchain.org/zoracle/request/${jsonObj.id}`)).json();
    //     }
    //     currency.usd = payload.result.result.crypto_price_in_usd / 100;
    //     cachedResults.push(currency);
    // }));
    console.log("Completed currency check", supportedCurrencies);
    return supportedCurrencies;
};

export {
    checkRegistered,
    registerUser,
    getAddress,
    getIndicators,
    getCryptoBalance
};