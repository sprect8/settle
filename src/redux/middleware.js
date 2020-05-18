import types from './actionTypes';
import { checkRegistered, registerUser, getCryptoBalance, getAddress } from '../dao/ethDao';

export const applyMiddleware = dispatch => async action => {
  console.log("Middleware", action);
  switch (action.type) {
    case types.USER_REGISTERED_CHECKING:
      // dispatch({ type: types.USER_REGISTERED_CHECKING });
      return checkRegistered(e => {
        dispatch({ type: types.USER_REGISTERED, payload: e });
      });

    case types.REGISTER_USER:
      return registerUser(action.data.name, action.data.role, e => { dispatch({ type: types.USER_REGISTERED, payload: e }); });

    case types.GET_BALANCE:
      dispatch({ type: types.GET_BALANCE });

      const result = await getCryptoBalance(await getAddress());

      dispatch({ type: types.BALANCE_RETRIEVED, payload: result });

      break;

    default: dispatch(action);
  }
};