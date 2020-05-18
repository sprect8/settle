import types from './actionTypes';

export const useActions = (state, dispatch) => ({
    getActiveInvoices: data => dispatch ({type:types.GET_ACTIVE_INVOICES, data:data}),
    getInvoiceDetails: (invoiceId, contractId) => dispatch ({type:types.GET_INVOICE_DETAILS, data:{invoiceId, contractId}}),
    //getMyBalance: data => dispatch ({type:types.GET_BALANCE, data:data}),
    payInvoice: (contractId, invoiceId, payment) => dispatch ({type:types.PAY_INVOICE, data:{contractId, invoiceId, payment}})
});