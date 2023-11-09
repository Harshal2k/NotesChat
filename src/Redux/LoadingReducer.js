import { SET_LOADING, UNSET_LOADING } from "./constants";
let defaultValue = { show: false, text1: '', text2: '', gif: '' };

export const LoadingReducer = (state = defaultValue, action) => {
    switch (action.type) {
        case SET_LOADING:
            return { ...state, ...action.data, show: true };
        case UNSET_LOADING:
            return { ...state, show: false };
        default:
            return state;
    }
}