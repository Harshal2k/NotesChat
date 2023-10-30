import { SET_USER_DETAILS } from "./constants";
let defaultValue = {
    id: '',
    name: '',
    email: '',
    pic: '',
    phone: ''
};

export const UserDetailsReducer = (state = defaultValue, action) => {
    switch (action.type) {
        case SET_USER_DETAILS:
            return {
                ...state,
                ...action.data,
            };
        default:
            return state;
    }
}