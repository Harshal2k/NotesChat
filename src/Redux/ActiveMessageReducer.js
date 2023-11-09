import { SET_ACTIVE_MESSAGE } from "./constants"

let defaultState = {
    _id: '',
    sender: '',
    subject: '',
    pages: [],
    chat: '',
    createdat: '',
    updatedat: '',
}

export const ActiveMessageReducer = (state = defaultState, action) => {
    switch (action.type) {
        case SET_ACTIVE_MESSAGE:
            const newState = { ...state,...action.data };

            newState.pages = action.data.pages.map(page => ({ ...page }));

            return newState;
        default:
            return state;
    }
}   