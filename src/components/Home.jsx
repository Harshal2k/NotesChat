import { useNavigation } from "@react-navigation/native";
import { NotesChatRealmContext } from "../Models.js"
import { UserProfile } from "../Models.js/UserProfile";
import DocumentPicker, { types } from 'react-native-document-picker'
import { useState } from "react";
import CameraViewer from "./CameraView.jsx";
import Video from 'react-native-video';
import { useQuery, useRealm } from "@realm/react";
const { View, Image, PermissionsAndroid } = require("react-native")
const { Text, Button } = require("react-native-paper")


const Home = () => {
    const navigation = useNavigation();

    const userProfile = useQuery(UserProfile)
    const realm = useRealm()

    const [result, setResult] = useState([]);
    const [count, setCount] = useState(0);
    const [camMode, setCamMode] = useState(false);

    const hLogout = () => {
        realm.write(() => {
            realm.delete(userProfile);
            navigation.navigate("Login");
        });
    }

    const hPrev = () => {
        if (result?.length !== 0 && count !== 0) {
            setCount(count - 1)
        }
    }

    const hNext = () => {
        if (count < result?.length) {
            setCount(count + 1)
        }
    }

    const getContacts = () => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
            title: 'Contacts',
            message: 'This app would like to view your contacts.',
            buttonPositive: 'Please accept bare mortal',
        })
            .then((res) => {
                console.log('Permission: ', res);
                Contacts.getAll()
                    .then((contacts) => {
                        // work with contacts
                        console.log(contacts);
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((error) => {
                console.error('Permission error: ', error);
            });
    }

    console.log({ result });

    return (
        <>
            {camMode ? <CameraViewer setCameraMode={setCamMode} setImageSource={(image) => { setResult([...result, { uri: `file://${image}` }]) }}></CameraViewer>
                :
                <View style={{ flex: 1 }}>
                    <Text style={{ textAlign: 'center', fontSize: 30 }}>Memories</Text>
                    {/* <Button mode="contained" onPress={hLogout}>Log out</Button> */}
                    <Button
                        onPress={async () => {
                            try {
                                const pickerResult = await DocumentPicker.pick({
                                    allowMultiSelection: true,
                                    type: [types.video, types.images],
                                    presentationStyle: 'fullScreen',
                                })
                                setResult(pickerResult)
                            } catch (e) {
                                console.log({ e })
                            }
                        }}
                    >Import Memories</Button>
                    <View style={{ height: '80%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        {
                            result[count]?.type?.includes("video") ?
                                <Video source={{ uri: result[count]?.uri || "content://com.android.providers.media.documents/document/video%3A643059" }}   // Can be a URL or a local file.
                                    onBuffer={() => { console.log("buffering") }}
                                    onError={() => { console.log("error") }}
                                    controls={true}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                    }}
                                    resizeMode="contain"
                                />
                                :
                                <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={{ uri: result[count]?.uri }} />
                        }
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 }}>
                        <Button mode="contained" disabled={result?.length == 0 || count == 0} onPress={hPrev}>PREVIOUS</Button>
                        <Button mode="contained" onPress={setCamMode}>Click</Button>
                        <Button mode="contained" disabled={result?.length == 0 || result?.length == (count + 1)} onPress={hNext}>NEXT</Button>
                    </View>
                    <Button mode="contained" style={{marginTop:50}} onPress={getContacts}>Get Contacts</Button>
                </View>
            }
        </>
    )
}

export default Home;