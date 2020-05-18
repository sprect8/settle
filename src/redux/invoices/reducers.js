import types from "./actionTypes";

const initialState = {
    invoicesLoaded: false,
    invoicesLoading: false,
    loadedInvoices: false,

    loadSelected: false,
    loadingSelected: false,
    loadedSelected: false,
};

const reducer = (state = initialState, action) => {
    console.log("Invoice Reducer", state, action);
    state.error = null;
    switch (action.type) {
        case types.GET_ACTIVE_INVOICES:
            return { ...state, invoicesLoaded: false, invoicesLoading: true };
        case types.ACTIVE_INVOICES_LOADED:
            return { ...state, invoicesLoaded: true, posLoading: false, loadedInvoices: action.payload };
        case types.GET_INVOICE_DETAILS:
            return { ...state, loadSelected: false, loadingSelected: true };
        case types.INVOICE_LOADED:
            return { ...state, loadSelected: true, loadingSelected: false, loadedSelected: action.payload };

        case types.GET_BALANCE:
            return { ...state, balanceRetrieved: false, balanceRetrieving: true, balanceLoaded: null };
        case types.BALANCE_RETRIEVED:
            return { ...state, balanceRetrieved: true, balanceRetrieving: false, balanceLoaded: action.payload };

        case types.PAY_INVOICE:
            return { ...state, invoicePaid: false, invoicePaying: true };
        case types.INVOICE_PAID:
            return { ...state, invoicePaid: true, invoicePaying: false, invoice: action.payload };
    }
};

export { reducer, initialState };