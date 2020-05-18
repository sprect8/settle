import types from './actionTypes';
import { getActiveInvoices, getMyInvoices, getInvoiceById, getAddress, getCryptoBalance, payInvoice } from '../../dao/ethDao';

export const applyMiddleware = dispatch => async action => {
  console.log("Inbox Middleware", action);
  switch (action.type) {
    case types.GET_ACTIVE_INVOICES:
      setTimeout(async e => {
        const address = await getAddress();
        const results = await getMyInvoices(address);
        return dispatch({ type: types.ACTIVE_INVOICES_LOADED, payload: results });
      }, 2000);
      break;
    case types.GET_INVOICE_DETAILS:
      dispatch({ type: types.GET_INVOICE_DETAILS });
      setTimeout(async e => {
        const results = await getInvoiceById(action.data.invoiceId, action.data.contractId);
        return dispatch({ type: types.INVOICE_LOADED, payload: results });
      }, 2000);
      break;
    case types.GET_BALANCE:
      dispatch({ type: types.GET_BALANCE });
      const result = await getCryptoBalance(await getAddress());

      dispatch({ type: types.BALANCE_RETRIEVED, payload: result });
      break;
    case types.PAY_INVOICE:
      dispatch({ type: types.PAY_INVOICE });
      setTimeout(async e=> {
        const result = await payInvoice(action.data.contractId, action.data.invoiceId, action.data.payment);

        dispatch( {type:types.INVOICE_PAID, payload: result});
      }, 2000);
    default: dispatch(action);
  }
};