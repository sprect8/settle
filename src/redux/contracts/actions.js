import types from './actionTypes';

export const useActions = (state, dispatch) => ({
    getActiveContracts: data => dispatch ({type:types.GET_ACTIVE_CONTRACTS, data:data}),
    getContractDetails: data => dispatch ({type:types.GET_CONTRACT_DETAILS, data:data}),
});