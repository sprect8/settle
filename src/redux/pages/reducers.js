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
        case types.GET_ACTIVE_RFPs:
            return { ...state, rfpsLoaded: false, rfpsLoading: true };
        case types.ACTIVE_RFPS_LOADED:
            return { ...state, rfpsLoaded: true, rfpsLoading: false, loadedRFPs: action.payload };
        case types.GET_RFP_DETAILS:
            return { ...state, loadSelected: false, loadingSelected: true };
        case types.RFP_LOADED:
            return { ...state, loadSelected: true, loadingSelected: false, loadedSelected: action.payload };
    }
};

export { reducer, initialState };