import types from './actionTypes';
import { getActivePOs, createInvoiceFromPurchaseOrder, estimatePricing, createPO, updatePO, getMyPOs, getAddress, getPOById } from '../../dao/ethDao';

export const applyMiddleware = dispatch => async action => {
  console.log("Inbox Middleware", action);
  switch (action.type) {
    case types.GET_ACTIVE_POs:
      setTimeout(async e => {
        const address = await getAddress();
        const results = await getMyPOs(address);
        return dispatch({ type: types.ACTIVE_POS_LOADED, payload: results });
      }, 2000);
      break;
    case types.GET_PO_DETAILS:
      dispatch({ type: types.GET_PO_DETAILS });
      const results = await getPOById(action.data.poId, action.data.contractId);
      return dispatch({ type: types.PO_LOADED, payload: results });
      
    case types.ESTIMATE_PRICING:
      dispatch({ type: types.ESTIMATE_PRICING });
      setTimeout(async e => {
        const results = await estimatePricing(action.data.contractId, action.data.volume);
        return dispatch({ type: types.ESTIMATE_PRICING_CALCULATED, payload: results });
      }, 2000);
      break;

    case types.CREATE_PO:
      dispatch({ type: types.CREATE_PO });
      setTimeout(async e => {
        const results = await createPO(action.data.contractId, action.data.purchaseOrder);
        return dispatch({ type: types.PO_CREATED, payload: results });
      }, 2000);
      break;


    case types.UPDATE_PO:
      dispatch({ type: types.UPDATE_PO });
      setTimeout(async e => {
        const results = await updatePO(action.data);
        return dispatch({ type: types.PO_UPDATED, payload: results });
      }, 2000);
      break;

    case types.CREATE_INVOICE:
      dispatch({ type: types.CREATE_INVOICE });
      setTimeout(async e => {
        const results = await createInvoiceFromPurchaseOrder(action.data);
        return dispatch({ type: types.INVOICE_CREATED, payload: results });
      }, 2000);
      break;
    default: dispatch(action);
  }
};