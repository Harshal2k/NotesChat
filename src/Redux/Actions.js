import { HIDE_ERROR, SET_LOADING, SET_USER_DETAILS, SHOW_ERROR, UNSET_LOADING } from "./constants";
import { dispatch } from "./store";

export function set_user_details(user) {
    return {
        type: SET_USER_DETAILS,
        data: user
    }
}

export function showLoader() {
    return dispatch({ type: SET_LOADING })
}

export function hideLoader() {
    return dispatch({ type: UNSET_LOADING })
}

export function showError(errorTxt) {
    return dispatch({ type: SHOW_ERROR, data: errorTxt })
}

export function hideError() {
    return dispatch({ type: HIDE_ERROR })
}