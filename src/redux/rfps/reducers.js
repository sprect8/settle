import types from "./actionTypes";

const initialState = {
    rfpsLoaded: false,
    rfpsLoading: false,
    loadedRFPs: false,

    loadSelected: false,
    loadingSelected: false,
    loadedSelected: false,
};

const reducer = (state = initialState, action) => {
    console.log("RFPs Reducer", state, action);
    state.error = null;
    switch (action.type) {
        case types.GET_ACTIVE_RFPS:
            return { ...state, rfpsLoaded: false, rfpsLoading: true };
        case types.ACTIVE_RFPS_LOADED:
            return { ...state, rfpsLoaded: true, rfpsLoading: false, loadedRFPs: action.payload };
        case types.GET_RFP_DETAILS:
            return { ...state, loadSelected: false, loadingSelected: true };
        case types.RFP_LOADED:
            return { ...state, loadSelected: true, loadingSelected: false, loadedSelected: action.payload };

        case types.CREATE_RFP:
            return { ...state, creatingRFP: true};
        case types.RFP_CREATED:
            return { ...state, creatingRFP: false, rfpObj: action.payload};
        
        case types.UPDATE_RFP:
            return { ...state, creatingRFP: true};
        case types.RFP_UPDATED:
            return { ...state, creatingRFP: false, rfpObj: action.payload};

        case types.GET_MY_RFPS:
            return {...state, rfpsLoaded: false, rfpsLoading: true}

        case types.MY_RFPS_LOADED:
            return { ...state, rfpsLoaded: true, rfpsLoading: false, loadedRFPs: action.payload};

        case types.CREATE_PROPOSAL:
            return {...state, creatingRFP: true};
        case types.PROPOSAL_CREATED:
            return {...state, creatingRFP: false, rfpObj: action.payload};
        
        case types.UPDATE_PROPOSAL:
            return {...state, creatingRFP: true};
        case types.PROPOSAL_UPDATED:
            return {...state, creatingRFP: false, rfpObj: action.payload};

        case types.CREATE_CONTRACT:
            return {...state, creatingRFP: true, creatingContract: true, contractCreated: false};
        case types.CONTRACT_CREATED:
            return {...state, creatingRFP: false, creatingContract: false, contractCreated: true, rfpObj: action.payload};

        
    }
};

export { reducer, initialState };



