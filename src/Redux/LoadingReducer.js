import { SET_LOADING, UNSET_LOADING } from "./constants";
let defaultValue = false;

export const LoadingReducer = (state = defaultValue, action) => {
    switch (action.type) {
        case SET_LOADING:
            return true;
        case UNSET_LOADING:
            return false;
        default:
            return state;
    }
}