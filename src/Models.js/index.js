import { createRealmContext } from "@realm/react";
import { UserProfile } from "./UserProfile";
import { ChatsModel, MessageModel, Page, UserModel } from "./ChatsModel";

export const NotesChatRealmContext = {
   schema: [UserProfile, ChatsModel, UserModel, MessageModel,Page],
};

