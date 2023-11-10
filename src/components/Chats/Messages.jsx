import { useQuery, useRealm } from "@realm/react";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Button, Text, TouchableRipple } from "react-native-paper";
import { UserProfile } from "../../Models.js/UserProfile";
import colors from "../../styles/Colours";
import { Api1 } from "../../API";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { MessageModel } from "../../Models.js/ChatsModel";
import { hideLoader, set_active_message, showLoader } from "../../Redux/Actions";
const { DateTime } = require("luxon");
const RNFS = require('react-native-fs');
const NOTESDIR = `${RNFS.ExternalDirectoryPath}/Notes`

const Message = ({ msgData, currentUserId, hSelectedMsg, selectedMsg }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const realm = useRealm();
    const parsedDate = DateTime?.fromISO(msgData?.createdat);
    const formattedDate = parsedDate?.toFormat("LLL d hh:mm a") || ''

    const hActiveMsg = async () => {
        if (msgData?.updateMessage) {
            hSelectedMsg(msgData?.updatedMsgId);
            return;
        }
        showLoader({ show: true, text1: "Hold tight", text2: 'Preparing your notes' })
        await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Notes`);
        for (let i = 0; i < msgData?.pages?.length; i++) {
            try {
                const fileExists = await RNFS.exists(`${NOTESDIR}/${msgData?.pages[i]?.picName}`);
                if (fileExists) {
                    await realm.write(async () => {
                        realm.create('Page', {
                            picUrl: msgData?.pages[i]?.picUrl,
                            picPath: `file://${NOTESDIR}/${msgData?.pages[i]?.picName}`,
                            picName: msgData?.pages[i]?.picName
                        }, true);
                    });
                } else {
                    await RNFS.downloadFile({
                        fromUrl: msgData?.pages[i]?.picUrl,
                        toFile: `${NOTESDIR}/${msgData?.pages[i]?.picName}`
                    }).promise.then(async (res) => {
                        await realm.write(async () => {
                            realm.create('Page', {
                                picUrl: msgData?.pages[i]?.picUrl,
                                picPath: `file://${NOTESDIR}/${msgData?.pages[i]?.picName}`,
                                picName: msgData?.pages[i]?.picName
                            }, true);
                        });
                    }).catch((error) => { })
                }
            } catch (err) {
                console.log({ err })
            }
        }
        dispatch(set_active_message({
            _id: msgData?._id,
            sender: msgData?.sender,
            subject: msgData?.subject,
            pages: JSON.parse(JSON.stringify(msgData?.pages)) || [],
            chat: msgData?.chat,
            createdat: msgData?.createdat,
            updatedat: msgData?.updatedat,
        }));
        hideLoader();
        navigation.navigate("NotesViewer");
    }

    return (
        <TouchableRipple rippleColor={currentUserId === msgData?.sender ? "#056fb6" : "#86A789"} style={[styles.message, selectedMsg == msgData?._id && { backgroundColor: currentUserId === msgData?.sender ? "#056fb69e" : "#86A7899e" }, msgData?.updateMessage ? { width: '94%', marginLeft: '3%' } : currentUserId === msgData?.sender ? styles.right : styles.left]} onPress={hActiveMsg} borderless={true}>
            <View style={{ borderRadius: 8, padding: 5, backgroundColor: currentUserId === msgData?.sender ? '#056fb6' : '#86A789' }}>
                <Text style={{ ...styles.text, textAlign: msgData?.updateMessage ? 'center' : 'left' }}>{msgData?.updateMessage ? msgData?.updateMessageContent || '' : `${msgData?.subject || ''} (${msgData?.pages?.length} Pages)`}</Text>
                <Text style={styles.time}>{formattedDate}</Text>
            </View>
        </TouchableRipple >
    )
}

const Messages = () => {
    const navigation = useNavigation();
    const realm = useRealm();
    const userProfile = useQuery(UserProfile);
    const messages = useQuery(MessageModel);
    const listRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState('');
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
                            picPath: fileExists ? `file://${NOTESDIR}/${imgName}` : '',
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
                            updateMessage: !!msg?.updateMessage,
                            updatedMsgId: msg?.updatedMsgId || '',
                            updateMessageContent: msg?.updateMessageContent || '',
                            createdat: msg?.createdAt,
                            updatedat: msg?.updatedAt,
                        }, true);
                    });

                }

            })
            .catch((err) => { console.log({ err }) })
    }, [activeChat])

    const hSelectedMsg = (msgId) => {
        let msgIndex = messagesData?.findIndex(msg => msg?._id == msgId);
        listRef?.current?.scrollToIndex({
            animated: true,
            index: msgIndex
        })
        setSelectedMsg(msgId);
        setTimeout(() => {
            setSelectedMsg('');
        }, 3000)
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#121b22' }}>
            <FlatList
                ref={listRef}
                data={[...messagesData] || []}
                renderItem={({ item }) => <Message msgData={item} currentUserId={userProfile[0]?._id} selectedMsg={selectedMsg} hSelectedMsg={hSelectedMsg} />}
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
        width: '45%',
        marginVertical: 2,
        borderRadius: 8,
        marginLeft: '52%',
        padding: 5,
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
    }
})

export default Messages;