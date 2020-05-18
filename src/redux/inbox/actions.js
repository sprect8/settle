import types from './actionTypes';

export const useActions = (state, dispatch) => ({
    getInboxItems: data => dispatch ({type:types.GET_INBOX_ITEMS, data:data}),
    markAsRead: data => dispatch ({type: types.MARK_AS_READ, data:data}),
    markAllAsRead: data => dispatch ({type: types.MARK_ALL_AS_READ, data:data}),
});