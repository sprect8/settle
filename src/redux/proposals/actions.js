import types from './actionTypes';

export const useActions = (state, dispatch) => ({
    getActiveProposals: data => dispatch ({type:types.GET_ACTIVE_PROPOSALS, data:data}),
    getProposalDetails: data => dispatch ({type:types.GET_PROPOSAL_DETAILS, data:data}),
    getRFPById: data => dispatch ({type:types.GET_RFP_DETAILS, data:data})
});