import React, { useEffect, useState } from "react";
import { Image, Keyboard, StyleSheet, TouchableHighlight, View } from "react-native";
import HelperInput from "./common/HelperInput";
import { useQuery, useRealm } from "@realm/react";
import { UserProfile } from "../Models.js/UserProfile";
import colors from "../styles/Colours";
import { Button, Icon, Snackbar } from "react-native-paper";
import DocumentPicker, { types } from 'react-native-document-picker'
import ImageCropPicker from "react-native-image-crop-picker";
import ImageUploadDialog from "./Dialogs/ImageUploadDialog";
import CameraViewer from "./CameraView";
import { hideLoader, showError, showLoader } from "../Redux/Actions";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Api1 } from "../API";
const RNFS = require('react-native-fs');
const profileDir = `file://${RNFS.ExternalDirectoryPath}/Profiles`

const Account = () => {
    const dispatch = useDispatch();
    const realm = useRealm();
    const userProfile = useQuery(UserProfile);
    const [userData, setUserData] = useState({ name: '', phone: '', pic: '', picPath: '' })
    const [helperTxt, setHelperTxt] = useState({ name: '', email: '', password: '', phone: '' })
    const [imageMode, setImageMode] = useState(false);
    const [cameraMode, setCameraMode] = useState(false);
    const [visible, setVisible] = useState(false);

    const onToggleSnackBar = () => setVisible(!visible);

    const onDismissSnackBar = () => setVisible(false);

    useEffect(() => {
        if (userProfile?.length > 0) {
            setUserData({
                name: userProfile[0]?.name,
                phone: userProfile[0]?.phone,
                pic: userProfile[0]?.pic,
                picPath: userProfile[0]?.picPath
            })
        }
    }, [userProfile]);

    const hChange = (name, value) => {
        if (value[0] === ' ') {
            return;
        }
        setUserData({
            ...userData,
            [name]: value
        })
    }

    const hGallery = async () => {
        try {
            const pickerResult = await DocumentPicker.pickSingle({
                type: [types.images],
                presentationStyle: 'fullScreen',
            });
            ImageCropPicker.openCropper({
                path: `${pickerResult.uri}`,
                width: 400,
                height: 400,
                compressImageQuality: 0.7,
                cropperCircleOverlay: true,
            }).then(image => {
                setUserData({ ...userData, picPath: image.path });
                setImageMode(false);
            }).catch((error) => {
                console.log({ error });
            });
        } catch (e) {
            console.log({ e })
        }
    }

    const hUpdate = async () => {
        Keyboard.dismiss();
        if (userData?.name?.length === 0) {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    name: 'Username is required!'
                }
            });
            return;
        } else {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    name: ''
                }
            });
        }
        if (userData?.phone?.length === 0) {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    phone: 'Phone number is required!'
                }
            });
            return;
        } else {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    phone: ''
                }
            });
        }

        if (
            userData?.name?.trim() == userProfile[0]?.name &&
            userData?.phone?.trim() == userProfile[0]?.phone &&
            userData?.picPath == userProfile[0]?.picPath
        ) {
            setVisible(true);
            return;
        }
        showLoader();
        let imageUrl = '';
        let imageName = '';

        let existsImgName = userData?.picPath?.split("/")?.pop() || ''
        const fileExists = await RNFS.exists(`${RNFS.ExternalDirectoryPath}/Profiles/${existsImgName}`);

        if (userData?.picPath && !fileExists) {
            console.log("nooooooooooo")
            try {
                const timestamp = Date.now();
                let data = new FormData();
                data.append('file', {
                    name: `my_image_${timestamp}.jpg`,
                    type: 'image/jpeg',
                    uri: userData?.picPath,
                });
                data.append('upload_preset', 'NotesChat');
                data.append('api_key', '38918525699347');
                data.append('timestamp', timestamp);
                let imgUpload = await axios.post('https://api.cloudinary.com/v1_1/divzv8wrt/image/upload', data);
                imageUrl = imgUpload.data.url;
                imageName = `${imgUpload.data.public_id}.${imgUpload.data.format}`
            } catch (error) {
                hideLoader();
                dispatch(showError("Profile picture upload failed"));
                setUserData({ ...userData, picPath: "" })
                return;
            }
        }

        let reqBody = {
            name: userData.name,
            phone: userData.phone,
        }

        if (!fileExists) {
            reqBody = {
                ...reqBody,
                pic: imageUrl,
                picName: imageName
            }
        }

        Api1.post('/api/user/updateUser', reqBody).then(async ({ data }) => {
            console.log({ data });
            if (!fileExists) {
                await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Profiles`);
                RNFS.copyFile(userData?.picPath, `${profileDir}/${imageName}`).then(() => {
                    ImageCropPicker.clean().then(() => { }).catch(e => { });
                    RNFS.unlink(`file://${RNFS.ExternalDirectoryPath}/Pictures`).then(() => { }).catch((e) => { })
                }).catch((error) => { });
            }
            realm.write(() => {
                let tempBody = {
                    name: userData.name,
                    phone: userData.phone,
                }

                if (!fileExists) {
                    tempBody = {
                        ...tempBody,
                        pic: imageUrl,
                        picPath: `${profileDir}/${imageName}`
                    }
                }

                realm.create('UserProfile', { ...userProfile[0], ...tempBody }, true);
            });
            hideLoader();
        }).catch((error) => {
            hideLoader();
            if (error?.message) {
                dispatch(showError(error?.message));
            } else {
                dispatch(showError("Something went wrong!"));
            }
        });

    }

    return (
        <>
            <ImageUploadDialog show={imageMode} hCamera={() => { setCameraMode(true); setImageMode(false) }} hGallery={hGallery} />
            {
                cameraMode ?
                    <CameraViewer setCameraMode={() => { setImageMode(false); setCameraMode(false) }} setImageSource={(path) => { setUserData({ ...userData, picPath: path }) }}></CameraViewer >
                    :
                    <View style={{ flex: 1, backgroundColor: '#121b22', alignItems: 'center', paddingTop: '15%' }}>
                        <View style={styles.imageContainer}>
                            <Image style={styles.avatar} source={userData?.picPath ? { uri: userData?.picPath } : require("../Images/default_avatar.jpg")}></Image>
                            <TouchableHighlight underlayColor={"#0000002e"} style={styles.addProfileBtn} onPress={() => { setImageMode(!imageMode) }}>
                                <Icon source={"camera-plus"} size={20} color="white" />
                            </TouchableHighlight>
                        </View>
                        <View style={{ width: '80%', gap: 20, backgroundColor: '#25343f', paddingHorizontal: 20, paddingVertical: 40, borderRadius: 20 }}>
                            <HelperInput helperText={helperTxt.name} theme={{ colors: { onSurfaceVariant: 'white' } }} outlineColor="white" textColor={"white"} style={{ backgroundColor: '#141c23' }} value={userData?.name} label={"Username"} onChangeText={(text) => { hChange("name", text) }} />
                            <HelperInput helperText={helperTxt.phone} theme={{ colors: { onSurfaceVariant: 'white' } }} outlineColor="white" textColor={"white"} style={{ backgroundColor: '#141c23' }} value={userData?.phone} label={"Phone Number"} keyboardType="numeric" onChangeText={(text) => { hChange("phone", text) }} />
                            <HelperInput theme={{ colors: { onSurfaceVariant: 'white' } }} outlineColor="white" textColor={"white"} style={{ backgroundColor: '#141c23' }} disabled={true} value={userProfile[0]?.email} label={"Email"} />
                            <Button mode="contained" onPress={hUpdate}>Update</Button>
                        </View>
                    </View>
            }
            <Snackbar
                visible={visible}
                onDismiss={onDismissSnackBar}
                action={{
                    label: 'Ok',
                    onPress: () => {
                        onDismissSnackBar();
                    },
                }}>
                No Changes in user data detected
            </Snackbar>
        </>
    )
}

const styles = StyleSheet.create({
    avatar: {
        width: 180,
        height: 180,
        borderRadius: 100,
    },
    imageContainer: {
        backgroundColor: 'white',
        borderRadius: 100,
        borderColor: 'white',
        borderWidth: 10,
        width: 200,
        height: 200,
        display: 'flex',
        marginBottom: 30
    },
    addProfileBtn: {
        backgroundColor: colors.black,
        width: 35,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        position: 'absolute',
        bottom: 0,
        right: 0
    },
})

export default Account;