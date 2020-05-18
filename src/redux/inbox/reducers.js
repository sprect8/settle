import  types from "./actionTypes";

const initialState = {
    inboxItemsLoaded: false,
    inboxItemsLoading: false,
    inboxItems: false    
};

const reducer =  (state=initialState, action) => {
    console.log("Inbox Reducer", state, action);
    state.error = null;
    switch (action.type) {
        case types.GET_INBOX_ITEMS:
            return {...state, inboxItemsLoaded: false, inboxItemsLoading: true };
        case types.INBOX_ITEMS_LOADED:
            return {...state, inboxItemsLoaded: true, inboxItemsLoading: false, inboxItems: action.payload };
    }
};

export {reducer, initialState};