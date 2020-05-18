import types from './actionTypes';
import { getActiveProposals, getRFPById, getProposalById, estimatePricing } from '../../dao/ethDao';

export const applyMiddleware = dispatch => async action => {
  console.log("Inbox Middleware", action);
  let results;
  switch (action.type) {
    case types.GET_ACTIVE_PROPOSALS:

      results = await getActiveProposals(action.data);
      return dispatch({ type: types.ACTIVE_PROPOSALS_LOADED, payload: results });

    case types.GET_PROPOSAL_DETAILS:
      dispatch({ type: types.GET_PROPOSAL_DETAILS });

      results = await getProposalById(action.data);
      return dispatch({ type: types.PROPOSAL_LOADED, payload: results });


    case types.GET_RFP_DETAILS:
      dispatch({ type: types.GET_RFP_DETAILS });

      results = await getRFPById(action.data);
      console.log("loaded", results);
      return dispatch({ type: types.RFP_LOADED, payload: results });

    case types.ESTIMATE_PRICING:
      dispatch({ type: types.ESTIMATE_PRICING });
      results = await estimatePricing(+action.data.contractId, action.data.volume);
      return dispatch({ type: types.ESTIMATE_PRICING_CALCULATED, payload: results });

    default: dispatch(action);
  }
};