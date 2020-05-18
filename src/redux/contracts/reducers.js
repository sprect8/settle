import types from "./actionTypes";

const initialState = {
    contractsLoaded: false,
    contractsLoading: false,
    loadedContractContracts: false,

    loadSelected: false,
    loadingSelected: false,
    loadedSelected: false,
};

const reducer = (state = initialState, action) => {
    console.log("Contract Reducer", state, action);
    state.error = null;
    switch (action.type) {
        case types.GET_ACTIVE_CONTRACTS:
            return { ...state, contractsLoaded: false, contractsLoading: true };
        case types.ACTIVE_CONTRACTS_LOADED:
            return { ...state, contractsLoaded: true, contractsLoading: false, loadedContracts: action.payload };
        case types.GET_CONTRACT_DETAILS:
            return { ...state, loadSelected: false, loadingSelected: true };
        case types.CONTRACT_LOADED:
            return { ...state, loadSelected: true, loadingSelected: false, loadedSelected: action.payload };
    }
};

export { reducer, initialState };