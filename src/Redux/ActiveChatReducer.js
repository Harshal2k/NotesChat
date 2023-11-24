import { SET_ACTIVE_CHAT } from "./constants"

let defaultState = {
    chatId: '',
    userId: '',
    name: '',
    email: '',
    pic: '',
    picname: '',
    picPath: '',
}

export const ActiveChatReducer = (state = defaultState, action) => {
    switch (action.type) {
        case SET_ACTIVE_CHAT:
            return action.data||defaultState;
        default:
            return state;
    }
}   