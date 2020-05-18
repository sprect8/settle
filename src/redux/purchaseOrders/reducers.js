import types from "./actionTypes";

const initialState = {
    posLoaded: false,
    posLoading: false,
    loadedPOs: false,

    loadSelected: false,
    loadingSelected: false,
    loadedSelected: false,
};

const reducer = (state = initialState, action) => {
    console.log("PO Reducer", state, action);
    state.error = null;
    switch (action.type) {
        case types.GET_ACTIVE_POs:
            return { ...state, posLoaded: false, posLoading: true };
        case types.ACTIVE_POS_LOADED:
            return { ...state, posLoaded: true, posLoading: false, loadedPOs: action.payload };
        case types.GET_PO_DETAILS:
            return { ...state, loadSelected: false, loadingSelected: true };
        case types.PO_LOADED:
            return { ...state, loadSelected: true, loadingSelected: false, loadedSelected: action.payload };

        case types.ESTIMATE_PRICING:
            return { ...state, estimatingPrice: true, priceEstimated: false };
        case types.ESTIMATE_PRICING_CALCULATED:
            return { ...state, estimatingPrice: false, priceEstimated: true, estimate: action.payload };

        case types.CREATE_PO:
            return { ...state, creatingPO: true, poCreated: false };
        case types.PO_CREATED:
            return { ...state, creatingPO: false, poCreated: true, poObj: action.payload };

        case types.UPDATE_PO:
            return { ...state, creatingPO: true, poCreated: false };
        case types.PO_UPDATED:
            return { ...state, creatingPO: false, poCreated: true, poObj: action.payload };

        case types.CREATE_INVOICE:
            return { ...state, creatingPO: true, poCreated: false };

        case types.INVOICE_CREATED:
            return { ...state, creatingPO: false, poCreated: true, poObj: action.payload };
    }
};

export { reducer, initialState };