import types from './actionTypes';

export const useActions = (state, dispatch) => ({
    getActivePOs: data => dispatch ({type:types.GET_ACTIVE_POs, data:data}),
    getPODetails: (poId, contractId) => dispatch ({type:types.GET_PO_DETAILS, data:{poId, contractId}}),
    estimatePricing: (contractId, volume) => dispatch ({type:types.ESTIMATE_PRICING, data:{contractId, volume}}),

    createInvoice: data => dispatch ({type:types.CREATE_INVOICE, data:data}),
    createPurchaseOrder: (contractId, purchaseOrder) => dispatch ({type:types.CREATE_PO, data:{contractId, purchaseOrder}}),
    updatePurchaseOrder: data => dispatch ({type:types.UPDATE_PO, data:data}),

});