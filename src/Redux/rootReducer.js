import { combineReducers } from "@reduxjs/toolkit";
import { UserDetailsReducer } from "./UserDetailsReducer";
import { LoadingReducer } from "./LoadingReducer";
import { ErrorReducer } from "./ErrorReducer";


export default combineReducers({
    userDetails: UserDetailsReducer,
    loading: LoadingReducer,
    errorDialog: ErrorReducer
})