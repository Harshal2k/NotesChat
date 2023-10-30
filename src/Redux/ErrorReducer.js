import { HIDE_ERROR, SHOW_ERROR } from "./constants";

let defaultvalue = {
    show: true,
    error: 'Somethin went wrong!'
}

export const ErrorReducer = (state = defaultvalue, action) => {
    switch (action.type) {
        case SHOW_ERROR:
            return {
                show: true,
                error: action.data || 'Somethin went wrong!'
            }
        case HIDE_ERROR:
            return {
                show: false,
                error: 'Somethin went wrong!'
            }
        default:
            return state;
    }
}