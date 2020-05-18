import types from './actionTypes';

export const useActions = (state, dispatch) => ({
    getActiveRFPs: data => dispatch ({type:types.GET_ACTIVE_RFPs, data:data}),
    getRFPDetails: data => dispatch ({type:types.GET_RFP_DETAILS, data:data}),
});