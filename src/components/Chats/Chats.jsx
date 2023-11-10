import React, { useEffect, useState } from "react";
import { FlatList, Image, RefreshControl, StyleSheet, TextInput, TouchableHighlight, View } from "react-native";
import Chat from "./Chat";
import colors from "../../styles/Colours";
import { Button, Icon, IconButton } from "react-native-paper";
import { useQuery, useRealm } from "@realm/react";
import { ChatsModel, MessageModel, UserModel } from "../../Models.js/ChatsModel";
import { Api1 } from "../../API";
import useDebounce from "../../Hooks/useDebounce";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserProfile } from "../../Models.js/UserProfile";
const RNFS = require('react-native-fs');
const profileDir = `file://${RNFS.ExternalDirectoryPath}/Profiles`

const Chats = () => {
    const realm = useRealm();
    const chats = useQuery(ChatsModel);
    const users = useQuery(UserModel);
    const messages = useQuery(MessageModel);
    const userProfile = useQuery(UserProfile);
    const [search, setSearch] = useState('');
    const [allChats, setAllChats] = useState([]);
    const [refreshing, setRefreshing] = useState(false)
    const navigation = useNavigation();

    const debouncedSearch = useDebounce(search, 400);

    useEffect(() => {
        if (!search) {
            setAllChats(chats);
        } else {
            let tempChats = chats?.filter(chat => {
                if (chat?.isGroupChat && chat?.groupName?.toLowerCase()?.includes(debouncedSearch?.toLowerCase())) {
                    return true;
                } else if (!chat?.isGroupChat && chat?.chatUser?.name?.toLowerCase()?.includes(debouncedSearch?.toLowerCase())) {
                    return true
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
                return {
                    ...data,
                    picPath: filePath
                }
            }));
            let chatUser = usersCopy?.find(user => user?._id !== userProfile[0]?._id);
            realm.write(async () => {
                const msgData = realm
                    .objects('Message')
                    .filtered('_id = $0', chat?.latestMessage?._id);

                let newMsgData = {};
                if (msgData?.length == 0) {
                    let pages = chat?.latestMessage?.pages?.map(page => {

                        return {
                            picUrl: page,
                            picPath: '',
                            picName: page?.split("/")?.pop() || ''
                        }
                    })
                    newMsgData = {
                        _id: chat?.latestMessage?._id,
                        sender: chat?.latestMessage?.sender?._id || chat?.latestMessage?.sender,
                        subject: chat?.latestMessage?.subject,
                        pages: pages || [],
                        chat: chat?.latestMessage?._id,
                        updateMessage: !!chat?.latestMessage?.updateMessage,
                        updatedMsgId: chat?.latestMessage?.updatedMsgId,
                        updateMessageContent: chat?.latestMessage?.updateMessageContent,
                        createdat: chat?.latestMessage?.createdAt,
                        updatedat: chat?.latestMessage?.updatedAt,
                    }
                }

                realm.create('ChatsModel',
                    {
                        chatId: chat?._id,
                        isGroupChat: chat?.isGroupChat,
                        groupName: chat?.name,
                        chatUser: chatUser,
                        groupAdmin: chat?.groupAdmin,
                        usersList: usersCopy || [],
                        createdAt: chat?.createdAt,
                        latestMessage: msgData?.length > 0 ? msgData[0] : newMsgData?._id ? newMsgData : null,
                    }
                    , true)
            })

        })
        setRefreshing(false);
    }

    const getChatsData = () => {
        setRefreshing(true);
        Api1.get('/api/chat/allChats')
            .then(({ data }) => { storeChats(data.chats) })
            .catch((error) => { console.log({ error }); setRefreshing(false); })
    }


    useEffect(() => {
        getChatsData();
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
                onRefresh={() => { getChatsData() }}
                refreshing={refreshing}
                data={allChats}
                renderItem={({ item }) => <Chat chatData={item} />}
                keyExtractor={item => item?.chatId}
            />
            <TouchableHighlight style={styles.iconBtnStyle} underlayColor={"#344857"} onPress={() => { navigation.navigate("FindUsers") }}>
                <Icon source={"account-plus"} size={30} color="white" />
            </TouchableHighlight>
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
    },
    iconBtnStyle: {
        backgroundColor: '#056fb6',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        position: 'absolute',
        bottom: 15,
        right: 15
    }
});

export default Chats;