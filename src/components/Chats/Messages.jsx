import { useQuery, useRealm } from "@realm/react";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { UserProfile } from "../../Models.js/UserProfile";
import colors from "../../styles/Colours";
import { Api1 } from "../../API";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { MessageModel } from "../../Models.js/ChatsModel";
const RNFS = require('react-native-fs');
const NOTESDIR = `${RNFS.ExternalDirectoryPath}/Notes`

const Message = ({ msgData, currentUserId }) => {
    // console.log({ subject: msgData.subject });
    // console.log({ pages: JSON.stringify(msgData.pages) });
    return (
        <View style={[styles.message, currentUserId === msgData?.sender ? styles.right : styles.left]}>
            <Text style={styles.text}>{msgData?.subject || ''} ({msgData?.pages?.length} Pages)</Text>
            <Text style={styles.time}>{msgData?.time || '8:00 pm'}</Text>
        </View>
    )
}

const Messages = () => {
    const navigation = useNavigation();
    const realm = useRealm();
    const userProfile = useQuery(UserProfile);
    const messages = useQuery(MessageModel);
    const listRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const activeChat = useSelector(state => state.activeChat);
    const messagesData = realm
        .objects('Message')
        .filtered('chat = $0', activeChat?.chatId)
        .sorted('createdat');

    useEffect(() => {
        Api1.get(`/api/message/${activeChat?.chatId}`)
            .then(async ({ data }) => {
                for (const msg of data?.message || []) {
                    const pages = [];
            
                    for (const page of msg?.pages || []) {
                        const imgName = page.split("/").pop();
                        const fileExists = await RNFS.exists(`${NOTESDIR}/${imgName}`);
                        pages.push({
                            picUrl: page,
                            picPath: fileExists ? `${NOTESDIR}/${imgName}` : '',
                            picName: imgName
                        });
                    }
            
                    await realm.write(async () => {
                        realm.create('Message', {
                            _id: msg?._id,
                            sender: msg?.sender?._id,
                            subject: msg?.subject,
                            pages: pages || [],
                            chat: msg?.chat?._id,
                            createdat: msg?.createdAt,
                            updatedat: msg?.updatedAt,
                        }, true);
                    });

                }
                
            })
            .catch((err) => { console.log({ err }) })
    }, [activeChat])

    return (
        <View style={{ flex: 1, backgroundColor: '#121b22' }}>
            <FlatList
                ref={listRef}
                data={messagesData || []}
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