import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Text, TouchableRipple } from "react-native-paper";
import { Image } from "react-native-paper/lib/typescript/components/Avatar/Avatar";
import colors from "../../styles/Colours";

import { set_active_chat } from "../../Redux/Actions";
import { useNavigation } from "@react-navigation/native";
import { UserProfile } from "../../Models.js/UserProfile";
import { useDispatch } from "react-redux";
import { useRealm } from "@realm/react";
const { DateTime } = require("luxon");
const defaultimage = require('../../Images/default_avatar.jpg')

const Chat = ({ chatData }) => {
    const dispatch = useDispatch()
    const navigation = useNavigation();
    const realm = useRealm()
    let formattedDate = ''
    const messages = realm.objects('Message').filtered('chat = $0', chatData?.chatId);

    try {
        const parsedDate = DateTime?.fromISO(chatData?.updatedAt);
        formattedDate = parsedDate?.toFormat("LLL d hh:mm a")
    } catch (err) { }
    const imageSource = () => {
        if (!chatData?.isGroupChat && chatData?.chatUser?.picPath) {
            return { uri: chatData?.chatUser?.picPath }
        } else {
            return defaultimage;
        }
    }

    const hChat = () => {
        navigation.navigate("Messages");
        dispatch(set_active_chat({
            chatId: chatData?.chatId,
            userId: chatData?.chatUser?._id,
            name: chatData?.chatUser?.name,
            email: chatData?.chatUser?.email,
            pic: chatData?.chatUser?.pic,
            picname: chatData?.chatUser?.picname,
            picPath: chatData?.chatUser?.picPath,
        }));
    }

    return (
        <TouchableRipple style={styles.touchableRipple} rippleColor="#056fb6" onPress={hChat} borderless={true}>
            <View style={styles.item}>
                <Text style={styles.dateTime}>{formattedDate}</Text>
                {
                    Number(chatData?.messageCount) > 0 && (Number(chatData?.messageCount) - messages?.length) + Number(chatData?.pendingMessages) > 0 &&
                    <View style={styles.msgCount}>
                        <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>{(Number(chatData?.messageCount) - messages?.length) + Number(chatData?.pendingMessages)}</Text>
                    </View>
                }
                <Avatar.Image style={{ backgroundColor: '#080f13' }} size={55} source={imageSource()} />
                <View style={styles.txtContainer}>
                    <Text style={styles.title}>{!chatData?.isGroupChat ? chatData?.chatUser?.name || '' : chatData?.groupName || ''}</Text>
                    <Text style={styles.message}>{chatData?.latestMessage?.subject ? `${chatData?.latestMessage?.subject} Notes` : chatData?.latestMessage?.updateMessageContent || ''}</Text>
                </View>
            </View>
        </TouchableRipple>
    )
}


const styles = StyleSheet.create({
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
    dateTime: {
        color: '#056fb6',
        fontSize: 12,
        fontWeight: '700',
        position: 'absolute',
        top: 10,
        right: 10
    },
    msgCount: {
        position: 'absolute',
        bottom: 20,
        right: 30,
        backgroundColor: '#056fb6',
        width: 30,
        height: 30,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default Chat;