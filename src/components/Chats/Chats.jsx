import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, TextInput, View } from "react-native";
import Chat from "./Chat";
import colors from "../../styles/Colours";
import { Button, Icon } from "react-native-paper";
import { useQuery, useRealm } from "@realm/react";
import { ChatsModel, UserModel } from "../../Models.js/ChatsModel";
import { Api1 } from "../../API";
import useDebounce from "../../Hooks/useDebounce";
const RNFS = require('react-native-fs');
const profileDir = `file://${RNFS.ExternalDirectoryPath}/Profiles`

const Chats = () => {
    const realm = useRealm();
    const chats = useQuery(ChatsModel);
    const users = useQuery(UserModel);
    const [search, setSearch] = useState('');
    const [allChats, setAllChats] = useState([]);

    const debouncedSearch = useDebounce(search, 400);

    useEffect(() => {
        if (!search) {
            setAllChats(chats);
        } else {
            let tempChats = chats?.filter(chat => {
                if (chat?.usersList[0]?.name?.toLowerCase()?.includes(debouncedSearch?.toLowerCase())) {
                    return true;
                }
                return false;
            });
            setAllChats(tempChats);
        }
    }, [chats, debouncedSearch])


    const storeChats = async (chats) => {
        await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Profiles`);
        chats?.map(async (chat) => {
            let usersCopy = JSON.parse(JSON.stringify(chat?.users));
            usersCopy = await Promise.all(usersCopy?.map(async (data) => {
                let fileExists = await RNFS.exists(`${profileDir}/${data?.picName}`);
                if (fileExists) {
                    return {
                        ...data,
                        picPath: `${profileDir}/${data?.picName}`
                    };
                }
                let filePath = ''
                await RNFS.downloadFile({
                    fromUrl: data?.pic,
                    toFile: `${profileDir}/${data?.picName}`
                }).promise.then((res) => {
                    filePath = `${profileDir}/${data?.picName}`
                }).catch((error) => { })
                console.log({ filePath });
                return {
                    ...data,
                    picPath: filePath
                }
            }));
            realm.write(async () => {
                realm.create('ChatsModel',
                    {
                        chatId: chat?._id,
                        isGroupChat: chat?.isGroupChat,
                        usersList: usersCopy || [],
                        createdAt: chat?.createdAt,
                        latestMessage: chat?.latestMessage,
                    }
                    , true)
            })

        })
    }

    useEffect(() => {
        Api1.get('/api/chat/allChats')
            .then(({ data }) => { storeChats(data.chats) })
            .catch((error) => { console.log({ error }) })
    }, [])

    const DATA = [
        {
            id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
            title: 'First Item',
        },
        {
            id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
            title: 'Second Item',
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d72',
            title: 'Third Item',
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d73',
            title: 'Fourth Item',
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d74',
            title: 'Fifth Item',
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d75',
            title: 'Sixth Item',
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d76',
            title: 'Seventh Item',
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d77',
            title: 'Eight Item',
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d78',
            title: 'Nineth Item',
        },
        {
            id: '58694a0f-3da1-471f-bd96-145571e29d79',
            title: 'Tenth Item',
        },

    ];

    /**
     *  NOTE single quotes string in realm will give you value not defined error so use double quotes
     */

    const createChat = () => {
        realm.write(() => {
            realm.create('ChatsModel',
                {
                    chatId: '652a4f6cb126e76c59615b63',
                    isGroupChat: false,
                    usersList: [
                        {
                            _id: '6529a3cf382c5eb4cf590602',
                            name: 'Harshal Gosawi',
                            email: 'harshalgosawi@gmail.com',
                            pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
                            createdat: "2023-10-13T20:08:47.491Z",
                            updatedat: "2023-10-13T20:08:47.491Z",
                            picname: "anonymous-avatar-icon-25.jpg",
                            __v: 0
                        }
                    ],
                    createdAt: '2023-10-14T08:21:00.925Z',
                    latestMessage: {
                        _id: '652bbaa7220e3ba57468cb53',
                        sender: {
                            _id: '6529a3cf382c5eb4cf590602',
                            name: 'Harshal Gosawi',
                            email: 'harshalgosawi@gmail.com',
                            pic: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
                        },
                        content: 'Hello Harshal',
                        chat: '652a4f6cb126e76c59615b63',
                        createdat: '2023-10-15T10:10:47.007Z',
                        updatedAt: '2023-10-15T10:10:47.007Z',
                        __v: 0
                    }
                });
        })
    }

    const hSearch = (text) => {
        setSearch(text);
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#121b22' }}>
            <View style={styles.searchContainer}>
                <TextInput style={styles.textInput} value={search} onChangeText={hSearch} placeholder="Search" placeholderTextColor={colors.white} />
                <Icon source={"magnify"} size={20} color="white" />
            </View>
            <FlatList
                data={allChats}
                renderItem={({ item }) => <Chat chatData={item} />}
                keyExtractor={item => item?.id}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        backgroundColor: '#25343f',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        borderRadius: 12,
        marginVertical: 10,
        paddingRight: 10
    },
    textInput: {
        paddingVertical: 8,
        color: colors.white,
        paddingHorizontal: 17,
        flex: 1
    }
});

export default Chats;