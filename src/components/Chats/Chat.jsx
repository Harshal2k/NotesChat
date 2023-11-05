import React from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Text, TouchableRipple } from "react-native-paper";
import { Image } from "react-native-paper/lib/typescript/components/Avatar/Avatar";
import colors from "../../styles/Colours";
import { useDispatch } from "react-redux";
import { set_active_chat } from "../../Redux/Actions";
import { useNavigation } from "@react-navigation/native";
const defaultimage = require('../../Images/default_avatar.jpg')

const Chat = ({ chatData }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const imageSource = () => {
        if (!chatData?.isGroupChat && chatData?.usersList[0]?.picPath) {
            return { uri: chatData?.usersList[0]?.picPath }
        } else {
            return defaultimage;
        }
    }

    const hChat = () => {
        dispatch(set_active_chat(chatData));
        navigation.navigate("Messages");
    }

    return (
        <TouchableRipple style={styles.touchableRipple} rippleColor="#056fb6" onPress={hChat} borderless={true}>
            <View style={styles.item}>
                <Text style={styles.dateTime}>{chatData?.date || '10:00 pm'}</Text>
                <Avatar.Image style={{ backgroundColor: '#080f13' }} size={55} source={imageSource()} />
                <View style={styles.txtContainer}>
                    <Text style={styles.title}>{!chatData?.isGroupChat ? chatData?.usersList[0]?.name || '' : ''}</Text>
                    <Text style={styles.message}>hi, Harshal how are you?</Text>
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
    }
});

export default Chat;