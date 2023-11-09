import { HIDE_ERROR, SET_ACTIVE_CHAT, SET_ACTIVE_MESSAGE, SET_LOADING, SET_USER_DETAILS, SHOW_ERROR, UNSET_LOADING } from "./constants";
import { dispatch } from "./store";

export function set_user_details(user) {
    return {
        type: SET_USER_DETAILS,
        data: user
    }
}

export function showLoader(data) {
    return dispatch({ type: SET_LOADING, data: data })
}

export function hideLoader() {
    return dispatch({ type: UNSET_LOADING })
}

export function showError(errorTxt) {
    return { type: SHOW_ERROR, data: errorTxt };
}

export function hideError() {
    return { type: HIDE_ERROR, data: '' };
}

export function set_active_chat(chat) {
    return {
        type: SET_ACTIVE_CHAT,
        data: chat
    }
}

export function set_active_message(message) {
    return {
        type: SET_ACTIVE_MESSAGE,
        data: message
    }
}