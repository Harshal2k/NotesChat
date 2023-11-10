import React, { useEffect, useRef, useState } from "react";
import { Image, Keyboard, StyleSheet, TouchableHighlight, View } from "react-native";
import { Button, Icon, Text, TextInput } from "react-native-paper";
import colors from "../styles/Colours";
import CameraViewer from "./CameraView";
import { Api } from "../API";
import { UserProfile } from "../Models.js/UserProfile";
import { useNavigation } from "@react-navigation/native";
import OTPTextView from "react-native-otp-textinput";
import HelperInput from "./common/HelperInput";
import { validateEmail } from "../Helpers/Validations";
import { hideLoader, showError, showLoader } from "../Redux/Actions";
import { useQuery, useRealm } from "@realm/react";
import { useDispatch } from "react-redux";
import ImageUploadDialog from "./Dialogs/ImageUploadDialog";
import DocumentPicker, { types } from 'react-native-document-picker'
import ImageCropPicker from "react-native-image-crop-picker";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
const RNFS = require('react-native-fs');
const profileDir = `file://${RNFS.ExternalDirectoryPath}/Profiles`

const Login = () => {
    const [userData, setUserData] = useState({ name: '', email: '', password: '', phone: '', otp: '' });
    const [helperTxt, setHelperTxt] = useState({ name: '', email: '', password: '', phone: '' })
    const [showPass, setShowPass] = useState(true);
    const [loginMode, setLoginMode] = useState(true);
    const [otpMode, setOtpMode] = useState(false);
    const [imageMode, setImageMode] = useState(false);
    const [cameraMode, setCameraMode] = useState(false);
    const [imageSource, setImageSource] = useState('');
    const dispatch = useDispatch();
    let otpInput = useRef(null);

    const navigation = useNavigation();
    const realm = useRealm();
    const userProfile = useQuery(UserProfile)

    useEffect(() => {
        if (navigation.canGoBack()) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        }
    }, [])


    useEffect(() => {
        if (userProfile[0]?.token) {
            console.log("2222222222222222222222")
            navigation.navigate("Home");
            hideLoader();
            setUserData({ name: '', email: '', password: '', phone: '', otp: '' });
            setHelperTxt({ name: '', email: '', password: '', phone: '' });
            setImageSource("");
            setLoginMode(true);
            setOtpMode(false);
            setImageMode(false);
            setCameraMode(false);
        }
    }, [userProfile])

    useEffect(() => {
        setUserData({ name: '', email: '', password: '', phone: '', otp: '' });
        setHelperTxt({ name: '', email: '', password: '', phone: '' });
        setImageSource("")
    }, [loginMode])

    const hChange = (name, value) => {
        if (value[0] === ' ') {
            return;
        }
        setUserData({
            ...userData,
            [name]: value
        })
    }

    const commonValidation = () => {
        if (userData?.email?.length == 0) {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    email: 'Email is required!'
                }
            });
            return false;
        } else if (!validateEmail(userData?.email)) {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    email: 'Invalid Email Id'
                }
            });
            return false;
        } else {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    email: ''
                }
            });
        }

        if (userData?.password?.length == 0) {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    password: 'Password is required!'
                }
            });
            return false;
        } else {
            setHelperTxt((prev) => {
                return {
                    ...prev,
                    password: ''
                }
            })
        }
        return true;
    }

    const createRealmUserProfile = (picPath, data) => {
        AsyncStorage.setItem('token', data?.token || '').catch((err) => { })
        realm.write(() => {
            realm.create('UserProfile', {
                _id: data?.user?._id || '',
                name: data?.user?.name || '',
                email: data?.user?.email || '',
                pic: data?.user?.pic || '',
                phone: data?.user?.phone || '',
                picPath: picPath || '',
                token: data?.token || '',
            });
        })
    }

    const hLogin = () => {
        Keyboard.dismiss();
        if (!commonValidation()) {
            return;
        }
        showLoader({ show: true, text1: '', text2: '', gif: '' });
        Api.post("/api/user/login", {
            email: userData.email,
            password: userData.password
        }).then(async ({ data }) => {
            await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Profiles`);
            let fileExists = await RNFS.exists(`${profileDir}/${data?.user?.picName}`);
            if (fileExists) {
                createRealmUserProfile(`${profileDir}/${data?.user?.picName}`, data);
                return;
            }
            RNFS.downloadFile({
                fromUrl: data?.user?.pic,
                toFile: `${profileDir}/${data?.user?.picName}`
            }).promise.then((res) => {
                createRealmUserProfile(`${profileDir}/${data?.user?.picName}`, data);
            }).catch((error) => {
                createRealmUserProfile(null, data);
            })
        }).catch((error) => {
            if (error?.message) {
                dispatch(showError(error?.message));
            } else {
                dispatch(showError("Something went wrong!"));
            }
        });
    }

    const hSendOtp = () => {
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
        if (!commonValidation()) {
            return;
        }
        setOtpMode(true);
        Api.post("/api/user/sendOtp",
            {
                email: userData.email
            }
        ).then(() => {
            setOtpMode(true);
        }).catch((error) => {
            if (error?.message) {
                dispatch(showError(error?.message));
            } else {
                dispatch(showError("Something went wrong!"));
            }
        })
    }

    const hSignIn = async () => {
        Keyboard.dismiss();
        let imageUrl = '';
        let imageName = '';
        showLoader();
        if (imageSource) {
            try {
                const timestamp = Date.now();
                let data = new FormData();
                data.append('file', {
                    name: `my_image_${timestamp}.jpg`,
                    type: 'image/jpeg',
                    uri: imageSource,
                });
                data.append('upload_preset', 'NotesChat');
                data.append('api_key', '38918525699347');
                data.append('timestamp', timestamp);
                let imgUpload = await axios.post('https://api.cloudinary.com/v1_1/divzv8wrt/image/upload', data);
                imageUrl = imgUpload.data.url;
                imageName = `${imgUpload.data.public_id}.${imgUpload.data.format}`
            } catch (error) {
                console.log("0000000000000000");
                hideLoader();
                dispatch(showError("Profile picture upload failed"));
                setImageSource("");
            }
        }

        Api.post('/api/user/register', {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            otp: userData.otp,
            password: userData.password,
            pic: imageUrl,
            picName: imageName
        }).then(async ({ data }) => {
            await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Profiles`);
            RNFS.copyFile(imageSource, `${profileDir}/${imageName}`).then(() => {
                createRealmUserProfile(`${profileDir}/${imageName}`, data)
                ImageCropPicker.clean().then(() => { }).catch(e => { });
                RNFS.unlink(`file://${RNFS.ExternalDirectoryPath}/Pictures`).then(() => { }).catch((e) => { })
            }).catch((error) => {
                createRealmUserProfile(null, data);
            });
        }).catch((error) => {
            console.log("11111111111111111111");
            hideLoader();
            if (error?.message) {
                dispatch(showError(error?.message));
            } else {
                dispatch(showError("Something went wrong!"));
            }
        });

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
                setImageSource(image.path);
                setImageMode(false);
            }).catch((error) => {
                console.log({ error });
            });
        } catch (e) {
            console.log({ e })
        }
    }

    return (
        <>
            <ImageUploadDialog show={imageMode} hCamera={() => { setCameraMode(true); setImageMode(false) }} hGallery={hGallery} />
            {
                cameraMode ?
                    <CameraViewer setCameraMode={() => { setImageMode(false); setCameraMode(false) }} setImageSource={setImageSource}></CameraViewer >
                    :
                    <View style={styles.mainContainer}>
                        {loginMode ?
                            <View style={{ ...styles.fieldContainers, marginTop: 100 }}>
                                <HelperInput style={styles.inputStyle} mode={"outlined"} label={"Email"} value={userData?.email || ''} helperText={helperTxt.email} onChange={(text) => { hChange("email", text) }} />
                                {/* <TextInput style={styles.inputStyle} mode="outlined" label={"Email"} value={userData?.email || ''} onChangeText={(text) => { hChange("email", text) }} /> */}
                                <HelperInput style={styles.inputStyle} mode={"outlined"} label={"Password"} value={userData?.password || ''} helperText={helperTxt.password} onChangeText={(text) => { hChange("password", text) }} secureTextEntry={showPass} right={<TextInput.Icon onPress={() => setShowPass(!showPass)} icon="eye" />} />

                                <Button style={styles.btnStyle} textColor={colors.secondary} rippleColor={colors.primary} mode="elevated" onPress={() => hLogin()}>
                                    LOGIN
                                </Button>

                                <View style={styles.txtBtnContainer}>
                                    <Text style={{ color: colors.black }}>New to NotesChat?</Text>
                                    <Button mode="text" textColor="blue" onPress={() => { setLoginMode(!loginMode) }}>
                                        SIGN IN
                                    </Button>
                                </View>
                                <Image resizeMode="contain" source={require("../Images/NotesChatLogo.png")} style={{ width: 200, height: 200, position: 'absolute', top: -230 }} />
                            </View>
                            :
                            !otpMode ?
                                <View style={styles.fieldContainers}>
                                    <View style={styles.imageContainer}>
                                        <Image style={styles.avatar} source={imageSource ? { uri: imageSource } : require("../Images/default_avatar.jpg")}></Image>
                                        <TouchableHighlight underlayColor={"#0000002e"} style={styles.addProfileBtn} onPress={() => setImageMode(!imageMode)}>
                                            <Icon source={"camera-plus"} size={20} color="white" />
                                        </TouchableHighlight>
                                    </View>
                                    <HelperInput style={styles.inputStyle} mode="outlined" label={"Username"} helperText={helperTxt.name} value={userData?.name || ''} onChangeText={(text) => { hChange("name", text) }} />
                                    <HelperInput style={styles.inputStyle} mode="outlined" label={"Phone Number"} helperText={helperTxt.phone} value={userData?.phone || ''} keyboardType="numeric" onChangeText={(text) => { hChange("phone", text) }} />
                                    <HelperInput style={styles.inputStyle} mode="outlined" label={"Email"} helperText={helperTxt.email} value={userData?.email || ''} onChangeText={(text) => { hChange("email", text) }} />
                                    <HelperInput style={styles.inputStyle} mode="outlined" label={"Password"} helperText={helperTxt.password} value={userData?.password || ''} onChangeText={(text) => { hChange("password", text) }} secureTextEntry={showPass} right={<TextInput.Icon onPress={() => setShowPass(!showPass)} icon="eye" />} />
                                    <Button style={styles.btnStyle} textColor={colors.secondary} rippleColor={colors.primary} mode="elevated" onPress={hSendOtp}>
                                        SEND OTP
                                    </Button>

                                    <View style={styles.txtBtnContainer}>
                                        <Text style={{ color: colors.black }}>Already have an account?</Text>
                                        <Button mode="text" textColor="blue" onPress={() => { setLoginMode(!loginMode) }}>
                                            LOGIN
                                        </Button>
                                    </View>
                                </View>
                                :
                                <View style={styles.fieldContainers}>
                                    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 15, marginBottom: 5, fontWeight: 'bold' }}>Enter 4 digit OTP sent to your Email</Text>
                                        <Text style={{ backgroundColor: '#ff6d608f', fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>{userData.email || ''}</Text>
                                    </View>
                                    <OTPTextView
                                        ref={otpInput}
                                        handleTextChange={text => setUserData({ ...userData, otp: text })}
                                        textInputStyle={styles.otpInput}
                                    />
                                    <Button style={styles.btnStyle} textColor={colors.secondary} rippleColor={colors.primary} mode="elevated" onPress={hSignIn}>SIGN IN</Button>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                        <Button mode="text" onPress={() => setOtpMode(false)}>Back</Button>
                                        <Button mode="text" onPress={() => hSendOtp()}>Resend OTP</Button>
                                    </View>
                                </View>
                        }
                    </View >
            }
        </>
    )
};

export default Login;

const styles = StyleSheet.create({
    mainContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#121b22'
    },
    fieldContainers: {
        width: '80%',
        padding: 20,
        display: 'flex',
        gap: 10,
        backgroundColor: colors.white,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
        alignItems: 'center'
    },
    inputStyle: {
        color: colors.black,
        width: '100%',
    },
    btnStyle: {
        fontSize: 24,
        borderRadius: 10,
        backgroundColor: colors.black,
        marginTop: 20,
        width: '100%'
    },
    imageContainer: {
        backgroundColor: 'white',
        borderRadius: 100,
        borderColor: 'white',
        borderWidth: 10,
        width: 120,
        height: 120,
        marginTop: -80,
        display: 'flex'
    },
    txtBtnContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: -5,
        marginTop: 5,
        width: '100%'
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
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 100,
        position: 'absolute'
    },

    otpInput: {
        borderColor: colors.primary,
        color: 'black',
        backgroundColor: '#ededed',
        borderRadius: 10,
    },
});