import Realm from 'realm';
export class UserProfile extends Realm.Object {
    static schema = {
        name: 'UserProfile',
        properties: {
            _id: 'string',
            name: 'string',
            email: 'string',
            pic: 'string',
            phone: 'string',
            token: 'string'
        },
        primaryKey: '_id',
    };
}