import types from './actionTypes';
import { getActiveRFPs, createRFP, updateRFP, getMyRFPs, createProposal, updateProposal, createContract } from '../../dao/ethDao';



export const applyMiddleware = dispatch => async action => {
  console.log("RFPs Middleware", action);
  let results;
  switch (action.type) {
    case types.GET_ACTIVE_RFPS:
      dispatch({ type: types.GET_ACTIVE_RFPS });

      results = await getActiveRFPs();
      return dispatch({ type: types.ACTIVE_RFPS_LOADED, payload: results });


    case types.GET_RFP_DETAILS:
      results = await getActiveRFPs();
      return dispatch({ type: types.RFP_LOADED, payload: results });


    case types.CREATE_RFP:
      dispatch({ type: types.CREATE_RFP });

      results = await createRFP(action.data);
      return dispatch({ type: types.RFP_CREATED, payload: results });

    case types.UPDATE_RFP:
      results = await updateRFP(action.data);
      return dispatch({ type: types.RFP_UPDATED, payload: results });

    case types.GET_MY_RFPS:
      results = await getMyRFPs(action.data);
      return dispatch({ type: types.MY_RFPS_LOADED, payload: results });

    case types.CREATE_PROPOSAL:
      dispatch({ type: types.CREATE_PROPOSAL });

      //const results = await 
      results = await createProposal(action.data.rfp, action.data.proposal);
      return dispatch({ type: types.PROPOSAL_CREATED, payload: results });

    case types.UPDATE_PROPOSAL:
      dispatch({ type: types.UPDATE_PROPOSAL });

      results = await updateProposal(action.data);
      return dispatch({ type: types.PROPOSAL_UPDATED, payload: results });

    case types.CREATE_CONTRACT:
      dispatch({ type: types.CREATE_CONTRACT });

      let res = await createContract(action.data);
      return dispatch({ type: types.CONTRACT_CREATED, payload: res });

    default: dispatch(action);
  }
};
