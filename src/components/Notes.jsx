
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { Divider, Icon, Text, TouchableRipple } from "react-native-paper";
import { hideLoader, set_active_message, showLoader } from "../Redux/Actions";
import { useDispatch } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQuery, useRealm } from "@realm/react";
import { MessageModel } from "../Models.js/ChatsModel";
const { DateTime } = require("luxon");
const RNFS = require('react-native-fs');
const NOTESDIR = `${RNFS.ExternalDirectoryPath}/Notes`

const NotesRender = ({ item }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const realm = useRealm();

    let formattedDate = ''
    try {
        const parsedDate = DateTime?.fromISO(item?.createdat);
        formattedDate = parsedDate?.toFormat("LLL d hh:mm a")
    } catch (err) { }

    const hActiveMsg = async () => {
        showLoader({ show: true, text1: "Hold tight", text2: 'Preparing your notes' })
        await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Notes`);
        for (let i = 0; i < item?.pages?.length; i++) {
            try {
                const fileExists = await RNFS.exists(`${NOTESDIR}/${item?.pages[i]?.picName}`);
                if (fileExists) {
                    await realm.write(async () => {
                        realm.create('Page', {
                            picUrl: item?.pages[i]?.picUrl,
                            picPath: `file://${NOTESDIR}/${item?.pages[i]?.picName}`,
                            picName: item?.pages[i]?.picName
                        }, true);
                    });
                } else {
                    await RNFS.downloadFile({
                        fromUrl: item?.pages[i]?.picUrl,
                        toFile: `${NOTESDIR}/${item?.pages[i]?.picName}`
                    }).promise.then(async (res) => {
                        await realm.write(async () => {
                            realm.create('Page', {
                                picUrl: item?.pages[i]?.picUrl,
                                picPath: `file://${NOTESDIR}/${item?.pages[i]?.picName}`,
                                picName: item?.pages[i]?.picName
                            }, true);
                        });
                    }).catch((error) => { })
                }
            } catch (err) {
                console.log({ err })
            }
        }
        dispatch(set_active_message({
            _id: item?._id,
            sender: item?.sender,
            subject: item?.subject,
            pages: JSON.parse(JSON.stringify(item?.pages)) || [],
            chat: item?.chat,
            createdat: item?.createdat,
            updatedat: item?.updatedat,
        }));
        hideLoader();
        navigation.navigate("NotesViewer");
    }

    return (
        <TouchableRipple style={styles.touchableRipple} rippleColor="#056fb6" onPress={hActiveMsg} borderless={true}>
            <View style={styles.notesContainer}>
                <Icon source={"notebook"} color="#056fb6" size={40} />
                <Divider style={styles.dividerStyle} />
                <Text numberOfLines={1} style={styles.textStyle}>{item?.subject}</Text>
                <Divider style={styles.dividerStyle} />
                <Text numberOfLines={1} style={{ ...styles.textStyle, color: '#b5b5b5bf' }}>Pages: {item?.pages?.length}</Text>
                <Divider style={styles.dividerStyle} />
                <Text numberOfLines={1} style={{ ...styles.textStyle, fontSize: 11, color: '#25343f' }}>{formattedDate}</Text>
            </View>
        </TouchableRipple>
    )
}

const Notes = () => {
    const realm = useRealm();
    const notes = useQuery(MessageModel);
    const [allNotes, setAllNotes] = useState(realm.objects('Message').filtered('updateMessage = $0', false).sorted('createdat', true));
    useEffect(() => {
        setAllNotes(realm.objects('Message').filtered('updateMessage = $0', false).sorted('createdat', true))
    }, [notes])
    return (
        <View style={{ flex: 1, backgroundColor: '#121b22' }}>
            <FlatList
                contentContainerStyle={{ alignItems: 'center' }}
                columnWrapperStyle={{ width: '100%' }}
                data={allNotes}
                numColumns={2}
                renderItem={({ item }) => <NotesRender item={item} />}
                keyExtractor={(item, index) => item?._id}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    touchableRipple: {
        borderRadius: 15,
        marginHorizontal: 15,
        marginVertical: 5,
        width: '40%',
    },
    notesContainer: {
        backgroundColor: '#0d171e',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        padding: 10,
        borderRadius: 10
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'left',
        width: '100%'
    },
    dividerStyle: {
        backgroundColor: '#056fb6',
        width: '100%',
        height: 2,
        marginVertical: 3
    }
})

export default Notes;