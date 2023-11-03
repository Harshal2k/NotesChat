import Realm from 'realm';

export class ChatsModel extends Realm.Object {
    static schema = {
        name: 'ChatsModel',
        properties: {
            chatId: 'string',
            isGroupChat: 'bool',
            usersList: 'User[]', // Specify the type of objects in the list (User objects in this case)
            createdAt: 'string',
            latestMessage: 'Message?', // Use '?' to indicate that it's an optional property
        },
        primaryKey: 'chatId',
    };
}

export class UserModel extends Realm.Object {
    static schema = {
        name: 'User',
        properties: {
            _id: 'string?',
            name: 'string?',
            email: 'string?',
            pic: 'string?',
            createdat: 'string?',
            updatedat: 'string?',
            picname: 'string?',
            picPath: 'string?',
            __v: 'int?',
        },
        primaryKey: '_id',
    };
}

export class MessageModel extends Realm.Object {
    static schema = {
        name: 'Message',
        properties: {
            _id: 'string?',
            sender: 'User?', // Define sender as a User object
            content: 'string?',
            chat: 'string?',
            createdat: 'string?',
            updatedat: 'string?',
            __v: 'int?',
        },
        primaryKey: '_id',
    };
}
