import { createRealmContext } from "@realm/react";
import { UserProfile } from "./UserProfile";

export const NotesChatRealmContext = createRealmContext({
   schema: [UserProfile],
});

