import types from './actionTypes';

export const useActions = (state, dispatch) => ({
    getActiveRFPs: data => dispatch ({type:types.GET_ACTIVE_RFPS, data:data}),
    getRFPDetails: data => dispatch ({type:types.GET_RFP_DETAILS, data:data}),
    createRFP: data => dispatch({type:types.CREATE_RFP, data:data}),
    updateRFP: data => dispatch({type:types.UPDATE_RFP, data:data}),
    getMyRFPs: data => dispatch ({type:types.GET_MY_RFPS, data:data}),
    updateProposal: data => dispatch ({type:types.UPDATE_PROPOSAL, data:data}),
    createProposal: (rfp, proposal) => dispatch ({type:types.CREATE_PROPOSAL, data:{rfp, proposal}}),
    createContract: data => dispatch ({type:types.CREATE_CONTRACT, data:data})
});