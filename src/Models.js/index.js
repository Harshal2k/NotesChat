import { createRealmContext } from "@realm/react";
import { UserProfile } from "./UserProfile";
import { ChatsModel, MessageModel, UserModel } from "./ChatsModel";

export const NotesChatRealmContext = {
   schema: [UserProfile, ChatsModel, UserModel, MessageModel],
};

