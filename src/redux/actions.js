import types from './actionTypes';

export const useActions = (state, dispatch) => ({
    checkRegistered: data => dispatch ({type:types.USER_REGISTERED_CHECKING, data:data}),
    register: data => dispatch ({type: types.REGISTER_USER, data:data}),
    getMyBalance: data => dispatch ({type:types.GET_BALANCE, data:data})
});