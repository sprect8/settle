import { ethers } from 'ethers';
import * as UserABI from '../abi/Users';
import * as ContractABI from '../abi/Contract';
import * as RFPsABI from '../abi/RFPs';
import * as SettleABI from '../abi/Settle';

import config from "../config/config";

let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
let signer = provider.getSigner();

console.log(config.addresses.user);
let UserObj = new ethers.Contract(config.addresses.user, UserABI.default, provider).connect(signer);
let RFPsObj = new ethers.Contract(config.addresses.rfp, RFPsABI.default, provider).connect(signer);

const cachedContractAt = {}

const contractAt = (address) => {
    if (!cachedContractAt[address]) {
        cachedContractAt[address] = new ethers.Contract(address, ContractABI.default, provider).connect(signer);
    }
    return cachedContractAt[address];
};

const settleAt = (address) => {
    return new ethers.Contract(address, SettleABI.default, provider).connect(signer);
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};
const currencyPricing = { "BTC": 9346.74, "BAND": 1.05, "ETH": 199.98 };

export {
    UserObj,
    RFPsObj,
    contractAt,
    settleAt,
    asyncForEach,
    currencyPricing
}