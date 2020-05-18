import types from "./actionTypes";

const initialState = {
    proposalsLoaded: false,
    proposalsLoading: false,
    loadedProposals: false,

    loadSelected: false,
    loadingSelected: false,
    loadedSelected: false,
};

const reducer = (state = initialState, action) => {
    console.log("Proposals Reducer", state, action);
    state.error = null;
    switch (action.type) {
        case types.GET_ACTIVE_PROPOSALS:
            return { ...state, proposalsLoaded: false, proposalsLoading: true };
        case types.ACTIVE_PROPOSALS_LOADED:
            return { ...state, proposalsLoaded: true, proposalsLoading: false, loadedProposals: action.payload };

        case types.GET_PROPOSAL_DETAILS:
            return { ...state, loadSelected: false, loadingSelected: true };
        case types.PROPOSAL_LOADED:
            return { ...state, loadSelected: true, loadingSelected: false, loadedSelected: action.payload };
            
        case types.GET_RFP_DETAILS:
            return { ...state, loadedRFPDetails: false, loadingRFPDetails: true};
        case types.RFP_LOADED:
            console.log(action.payload);
            return { ...state, loadedRFPDetails: true, loadingRFPDetails: false, rfpDetails: action.payload };

    }
};

export { reducer, initialState };