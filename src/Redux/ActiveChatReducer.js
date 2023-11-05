import { SET_ACTIVE_CHAT } from "./constants"

let defaultState = {
    _id: '',
    name: '',
    email: '',
    pic: '',
    createdat: '',
    updatedat: '',
    picname: '',
    picPath: '',
    __v: '',
}

export const ActiveChatReducer = (state = defaultState, action) => {
    switch (action.type) {
        case SET_ACTIVE_CHAT:
            return action.data;
        default:
            return state;
    }
}   