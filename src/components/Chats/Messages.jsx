import { useQuery } from "@realm/react";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { UserProfile } from "../../Models.js/UserProfile";
import colors from "../../styles/Colours";
import { Api1 } from "../../API";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

const Message = ({ msgData, currentUserId }) => {

    return (
        <View style={[styles.message, currentUserId === msgData?.sender?._id ? styles.right : styles.left]}>
            <Text style={styles.text}>{msgData?.content || ''}</Text>
            <Text style={styles.time}>{msgData?.time || '8:00 pm'}</Text>
        </View>
    )
}

const Messages = () => {
    const navigation = useNavigation();
    const userProfile = useQuery(UserProfile);
    const listRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const activeChat = useSelector(state => state.activeChat);

    const [allMessages, setallMessages] = useState([]);
    useEffect(() => {
        console.log("1111111111111111111")
        console.log({ activeChat });
        Api1.get(`/api/message/${activeChat?.chatId}`)
            .then(({ data }) => setallMessages(data?.message || []))
            .catch((err) => { console.log({ err }) })
    }, [activeChat])

    return (
        <View style={{ flex: 1, backgroundColor: '#121b22' }}>
            <FlatList
                ref={listRef}
                data={allMessages || []}
                renderItem={({ item }) => <Message msgData={item} currentUserId={userProfile[0]?._id} />}
                keyExtractor={item => item?._id}
                onScrollEndDrag={() => { if (!scrolled) setScrolled(true) }}
                onContentSizeChange={() => {
                    if (!scrolled) {
                        listRef?.current?.scrollToEnd({ animated: false });
                    }
                }}
            />
            <Button style={{ marginVertical: 10 }} mode="contained" onPress={() => { navigation.navigate("Scanner") }}>Create Notes</Button>
        </View>
    )
}

const styles = StyleSheet.create({
    message: {
        backgroundColor: '#056fb6',
        width: '45%',
        marginVertical: 5,
        borderRadius: 8,
        marginLeft: '52%',
        padding: 5
    },
    text: {
        color: colors.white,
        marginLeft: 5
    },
    time: {
        color: '#cdcdcd',
        fontSize: 12,
        textAlign: 'right',
    },
    right: {
        marginLeft: '52%'
    },
    left: {
        marginLeft: '3%',
        backgroundColor: '#86A789'
    }
})

export default Messages;