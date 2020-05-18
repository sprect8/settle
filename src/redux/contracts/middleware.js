import types from './actionTypes';
import { getActiveContracts, getMyContracts, getAddress, getContractById } from '../../dao/ethDao';

export const applyMiddleware = dispatch => async action => {
  console.log("contract Middleware", action);
  switch (action.type) {
    case types.GET_ACTIVE_CONTRACTS:
      setTimeout(async e => {
        const address = await getAddress();
        const results = await getMyContracts(address);
        return dispatch({ type: types.ACTIVE_CONTRACTS_LOADED, payload: results });
      }, 2000);
      break;
    case types.GET_CONTRACT_DETAILS:
      dispatch ({type: types.GET_CONTRACT_DETAILS});
      setTimeout(async e => {
        const results = await getContractById(action.data);
        return dispatch({ type: types.CONTRACT_LOADED, payload: results });
      }, 2000);
      break;
    default: dispatch(action);
  }
};