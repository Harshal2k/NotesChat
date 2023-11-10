import React, { useState } from "react";
import { FlatList, Keyboard, StyleSheet, TextInput, TouchableHighlight, View } from "react-native";
import { ActivityIndicator, Avatar, Icon, Text, TouchableRipple } from "react-native-paper";
import colors from "../styles/Colours";
import useDebounce from "../Hooks/useDebounce";
import { Api1 } from "../API";
import { useQuery, useRealm } from "@realm/react";
import { UserProfile } from "../Models.js/UserProfile";
import { hideLoader, showError, showLoader } from "../Redux/Actions";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
const RNFS = require('react-native-fs');
const profileDir = `file://${RNFS.ExternalDirectoryPath}/Profiles`

const User = ({ userData }) => {
    const realm = useRealm();
    const userProfile = useQuery(UserProfile);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const hConnectUser = () => {
        showLoader({ show: true, text1: 'Hold on!', text2: 'Establishing the connection...' })
        Api1.post('/api/chat/accessChat',
            {
                userId: userData?._id
            }
        ).then(async ({ data }) => {
            await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Profiles`);
            data?.chat?.map(async (chat) => {
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
                    realm.create('ChatsModel',
                        {
                            chatId: chat?._id,
                            isGroupChat: chat?.isGroupChat,
                            groupName: chat?.name,
                            chatUser: chatUser,
                            groupAdmin: chat?.groupAdmin,
                            usersList: usersCopy || [],
                            createdAt: chat?.createdAt,
                            updatedAt: chat?.updatedAt,
                            latestMessage: chat?.latestMessage || null,
                        }
                        , true)
                })
            })
            hideLoader();
            navigation.goBack("Home");
        }).catch((err) => {
            hideLoader();
            dispatch(showError("Connection failed"));
        })
    }

    return (
        <TouchableRipple style={styles.touchableRipple} rippleColor="#056fb6" onPress={hConnectUser} borderless={true}>
            <View style={styles.item}>
                <Avatar.Image style={{ backgroundColor: '#080f13' }} size={55} source={userData?.pic ? { uri: userData?.pic } : require('../Images/default_avatar.jpg')} />
                <View style={styles.txtContainer}>
                    <Text style={styles.title}>{userData?.name || ''}</Text>
                    <Text style={styles.message}>{userData?.email || ''}</Text>
                </View>
            </View>
        </TouchableRipple>
    )
}

const renderNoDataFound = () => {

    return (
        <View style={{ flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: 280 }}>
            <Icon source={"account-multiple-remove"} size={80} color="white" />
            <Text style={{ color: 'white', fontSize: 16 }}>No chat buddies here, keep searching!</Text>
        </View>
    )
}

const FindUsers = () => {
    const [active, setActive] = useState('Email');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const allUsers = [
        {
            "_id": "652ab62c3520eb6477e94422",
            "name": "Mr Ananymous",
            "email": "ananymosyou@gmail.com",
            "password": "$2b$10$/YSPW2JDi5VakoEsJdzMSONgkelQuVFxdwiop1hd5cd1olfPxMByq",
            "pic": "https://res.cloudinary.com/divzv8wrt/image/upload/v1698783305/jstgop76gwy5cirmn8rd.jpg",
            "createdAt": "2023-10-14T15:39:24.938Z",
            "updatedAt": "2023-10-14T15:39:24.938Z",
            "__v": 0,
            "picName": "jstgop76gwy5cirmn8rd.jpg"
        },
        {
            "_id": "654162c7a12be62d08588ddf",
            "name": "Harshal ",
            "email": "gosawiharshal@gmail.com",
            "password": "$2b$10$qkM5ewatLNnoyM120O4X6uXFXkLcjmI0Fa/1yMPf1Y2mCrKw1aK5S",
            "pic": "https://res.cloudinary.com/divzv8wrt/image/upload/v1698838182/mdgbpfio3byxvgw50ie3.jpg",
            "phone": "9359192032",
            "createdAt": "2023-10-31T20:25:43.585Z",
            "updatedAt": "2023-10-31T20:25:43.585Z",
            "__v": 0,
            "picName": "mdgbpfio3byxvgw50ie3.jpg"
        }
    ]

    const hSearch = (text) => {
        setSearch(text)
    }

    const searchUser = () => {
        setLoading(true)
        Keyboard.dismiss();
        Api1.post('/api/user/findUsers', {
            [active?.toLowerCase()]: search
        }).then(({ data }) => {
            setUsers(data?.users || [])
        }).catch((err) => { console.log({ err }) })
            .finally(() => { setLoading(false) })
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#121b22', flexDirection: 'column' }}>
            <View style={styles.btnContainer}>
                <TouchableHighlight underlayColor={"#044977"} style={{ ...styles.btnStyle, backgroundColor: active == 'Email' ? '#044977' : '#056fb6' }} onPress={() => { setSearch(''); setActive('Email') }}>
                    <Text style={styles.txt}>Email</Text>
                </TouchableHighlight>
                <TouchableHighlight underlayColor={"#044977"} style={{ ...styles.btnStyle, backgroundColor: active == 'Phone' ? '#044977' : '#056fb6' }} onPress={() => { setSearch(''); setActive('Phone') }}>
                    <Text style={styles.txt}>Phone</Text>
                </TouchableHighlight>
                <TouchableHighlight underlayColor={"#044977"} style={{ ...styles.btnStyle, backgroundColor: active == 'Username' ? '#044977' : '#056fb6' }} onPress={() => { setSearch(''); setActive('Username') }}>
                    <Text style={styles.txt}>Username</Text>
                </TouchableHighlight>
            </View>
            <View style={styles.searchContainer}>
                <TextInput style={styles.textInput} value={search} onChangeText={hSearch} placeholder={`Search Users by ${active}`} placeholderTextColor={colors.white} keyboardType={active === 'Email' ? 'email-address' : active === 'Phone' ? 'phone-pad' : 'default'} />
                <TouchableHighlight style={[styles.searchBtn, (search?.trim() === '') && { opacity: 0.5 }]} disabled={loading ? loading : search?.trim() === ''} onPress={searchUser} underlayColor={"#1a9a47"}>
                    {
                        loading ?
                            <ActivityIndicator animating={true} color="white" />
                            :
                            <Icon source={"account-search"} size={30} color="white" />
                    }
                </TouchableHighlight>
            </View>

            <FlatList
                data={users}
                renderItem={({ item }) => <User userData={item} />}
                keyExtractor={item => item?._id}
                ListEmptyComponent={renderNoDataFound}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    btnContainer: {
        flexDirection: 'row',
        backgroundColor: '#067fd0',
        justifyContent: 'space-evenly'
    },
    btnStyle: {
        backgroundColor: '#056fb6',
        flex: 1,
        marginVertical: 7,
        marginHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 7
    },
    txt: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    touchableRipple: {
        borderRadius: 15,
        marginHorizontal: 15,
        marginVertical: 5
    },
    item: {
        backgroundColor: '#0d171e',
        borderRadius: 15,
        flexDirection: 'row',
        paddingVertical: 16,
        padding: 10,
        alignItems: 'center'
    },
    txtContainer: {
        marginLeft: 20,
    },
    title: {
        fontSize: 17,
        color: colors.white,
        fontWeight: '700'
    },
    message: {
        color: '#b5b5b5bf',
        marginTop: 5
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        borderRadius: 12,
        marginVertical: 10,
        gap: 10
    },
    textInput: {
        backgroundColor: '#25343f',
        borderRadius: 12,
        paddingVertical: 8,
        paddingRight: 10,
        color: colors.white,
        paddingHorizontal: 17,
        flex: 1
    },
    searchBtn: {
        backgroundColor: '#23D160',
        height: 42,
        width: 80,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default FindUsers;