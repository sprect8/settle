import types from "./actionTypes";

const initialState = {
    validating: false,
    validated: false,
    registered: false,
    context: [],
    owners: {},
};

const reducer = (state = initialState, action) => {
    console.log("Reducer", state, action);
    state.error = null;
    switch (action.type) {
        case types.USER_REGISTERED_CHECKING:
            return { ...state, validating: true, validated: false };
        case types.USER_REGISTERED:
            return {
                ...state, validating: false,
                companyName: action.payload.name,
                companyRole: action.payload.role,
                registered: action.payload.registered,
                address: action.payload.address,
                balance: action.payload.balance,
                validated: true
            };
        case types.GET_BALANCE:
            return { ...state, balanceRetrieved: false, balanceRetrieving: true, balanceLoaded: null };
        case types.BALANCE_RETRIEVED:
            return { ...state, balanceRetrieved: true, balanceRetrieving: false, balanceLoaded: action.payload };
    }
};

export { reducer, initialState };