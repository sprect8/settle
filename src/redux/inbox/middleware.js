import types from './actionTypes';
import { getInboxItems } from '../../dao/ethDao';

export const applyMiddleware = dispatch => async action => {
  console.log("Inbox Middleware", action);
  switch (action.type) {
    case types.GET_INBOX_ITEMS:
      setTimeout(async e => {
        const results = await getInboxItems(5);
        return dispatch({ type: types.INBOX_ITEMS_LOADED, payload: results });
      }, 2000);
    default: dispatch(action);
  }
};