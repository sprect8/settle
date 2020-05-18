import types from './actionTypes';
import { getActiveRFPs } from '../../dao/ethDao';

export const applyMiddleware = dispatch => async action => {
  console.log("Inbox Middleware", action);
  switch (action.type) {
    case types.GET_ACTIVE_RFPs:
      setTimeout(async e => {
        const results = await getActiveRFPs();
        return dispatch({ type: types.ACTIVE_RFPS_LOADED, payload: results });
      }, 2000);
      break;
    case types.GET_RFP_DETAILS:
      setTimeout(async e => {
        const results = await getActiveRFPs();
        return dispatch({ type: types.RFP_LOADED, payload: results });
      }, 2000);
      break;
    default: dispatch(action);
  }
};