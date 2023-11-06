import Realm from 'realm';

export class ChatsModel extends Realm.Object {
    static schema = {
        name: 'ChatsModel',
        properties: {
            chatId: 'string',
            isGroupChat: 'bool',
            groupName: 'string?',
            chatUser: 'User?',
            groupAdmin: 'User?',
            usersList: 'User[]',
            createdAt: 'string',
            latestMessage: 'Message?', // '?' to indicate that it's an optional property
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
            subject: 'string?',
            pages: 'Page[]',
            content: 'string?',
            chat: 'string?',
            createdat: 'string?',
            updatedat: 'string?',
            __v: 'int?',
        },
        primaryKey: '_id',
    };
}

export class Page extends Realm.Object {
    static schema = {
        name: 'Page',
        properties: {
            pic: 'string?',
            picPath: 'string?',
            picName: 'string?'
        },
        primaryKey: 'pic'
    }
}
