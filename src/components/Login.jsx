import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Dialog, HelperText, Portal, Text, TextInput } from "react-native-paper";
import colors from "../styles/Colours";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import CameraViewer from "./CameraView";
import RNFetchBlob from "rn-fetch-blob";
import { Api } from "../API";
import { AsyncStorage } from "react-native"
import { NotesChatRealmContext } from "../Models.js";
import { UserProfile } from "../Models.js/UserProfile";
import { useNavigation } from "@react-navigation/native";
import OTPTextView from "react-native-otp-textinput";
import HelperInput from "./common/HelperInput";
import { validateEmail } from "../Helpers/Validations";
import Loader from "./common/Loader";
import { showLoader } from "../Redux/Actions";
import { useQuery, useRealm } from "@realm/react";

const Login = () => {
    const [userData, setUserData] = useState({ name: '', email: '', password: '', phone: '', otp: '' });
    const [helperTxt, setHelperTxt] = useState({ name: '', email: '', password: '', phone: '' })
    const [showPass, setShowPass] = useState(true);
    const [loginMode, setLoginMode] = useState(true);
    const [otpMode, setOtpMode] = useState(false);
    const [cameraMode, setCameraMode] = useState(false);
    const [imageSource, setImageSource] = useState('');
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
        console.log({ userProfile2: userProfile[0] });
        if (userProfile[0]?.token) {
            navigation.navigate("Home");
            setUserData({ name: '', email: '', password: '', phone: '', otp: '' });
            setHelperTxt({ name: '', email: '', password: '', phone: '' });
            setImageSource("");
        }
    }, [userProfile])

    useEffect(() => {
        setUserData({ name: '', email: '', password: '', phone: '', otp: '' });
        setHelperTxt({ name: '', email: '', password: '', phone: '' });
        setImageSource("")
    }, [loginMode])


    useEffect(() => {
        // if (imageSource) {
        //     const imageUri = `file://${imageSource}`;
        //     const timestamp = Date.now();
        //     let data = new FormData();
        //     data.append('file', {
        //         name: `my_image_${timestamp}.jpg`,
        //         type: 'image/jpeg',
        //         uri: imageUri,
        //     });
        //     data.append('upload_preset', 'NotesChat');
        //     data.append('api_key', '389185256993476');
        //     data.append('timestamp', timestamp);

        //     fetch('https://api.cloudinary.com/v1_1/divzv8wrt/image/upload', {
        //         method: 'POST',
        //         body: data,
        //     })
        //         .then((response) => response.json())
        //         .then((responseJson) => {
        //             console.log('Image uploaded to Cloudinary:', responseJson);
        //         })
        //         .catch((error) => {
        //             console.error('Error uploading image to Cloudinary:', error);
        //         });
        // }
    }, [imageSource]);

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

    const hLogin = () => {
        if (!commonValidation()) {
            return;
        }
        showLoader();
        Api.post("/api/user/login", {
            email: userData.email,
            password: userData.password
        }).then(({ data }) => {
            realm.write(() => {
                realm.create('UserProfile', {
                    _id: data?.user?._id || '',
                    name: data?.user?.name || '',
                    email: data?.user?.email || '',
                    pic: data?.user?.pic || '',
                    phone: data?.user?.phone || '',
                    token: data?.token || '',
                });
            })
        }).catch((errors) => {
            console.log({ errors })
        });
    }

    const hSendOtp = () => {
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
        Api.post("/api/user/sendOtp",
            {
                email: userData.email
            }
        ).then(() => {
            setOtpMode(true);
        }).catch((error) => { console.log({ error }) })
    }

    const hSignIn = () => {
        return;
        if (imageSource) {
            const imageUri = `file://${imageSource}`;
            const timestamp = Date.now();
            let data = new FormData();
            data.append('file', {
                name: `my_image_${timestamp}.jpg`,
                type: 'image/jpeg',
                uri: imageUri,
            });
            data.append('upload_preset', 'NotesChat');
            data.append('api_key', '389185256993476');
            data.append('timestamp', timestamp);

            fetch('https://api.cloudinary.com/v1_1/divzv8wrt/image/upload', {
                method: 'POST',
                body: data,
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log('Image uploaded to Cloudinary:', responseJson);
                })
                .catch((error) => {
                    console.error('Error uploading image to Cloudinary:', error);
                });
        }
    }

    return (
        <>
            {
                cameraMode ?
                    <CameraViewer setCameraMode={setCameraMode} setImageSource={setImageSource}></CameraViewer>
                    :
                    <View style={styles.mainContainer}>
                        {loginMode ?
                            <View style={styles.fieldContainers}>
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
                            </View>
                            :
                            !otpMode ?
                                <View style={styles.fieldContainers}>
                                    <View style={styles.imageContainer}>
                                        <Image style={styles.avatar} source={imageSource ? { uri: `file://${imageSource}` } : require("../Images/default_avatar.jpg")}></Image>
                                    </View>
                                    <HelperInput style={styles.inputStyle} mode="outlined" label={"Username"} helperText={helperTxt.name} value={userData?.name || ''} onChangeText={(text) => { hChange("name", text) }} />
                                    <Button mode="elevated" onPress={() => setCameraMode(!cameraMode)}>Avatar</Button>
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
                                        <Text style={{ backgroundColor: '#ff6d608f', fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>{userData.email || 'harshalgosawi@gmail.com'}</Text>
                                    </View>
                                    <OTPTextView
                                        ref={otpInput}
                                        handleTextChange={text => setUserData({ ...userData, otp: text })}
                                        textInputStyle={styles.otpInput}
                                    />
                                    <Button style={styles.btnStyle} textColor={colors.secondary} rippleColor={colors.primary} mode="elevated" onPress={hSignIn}>SIGN IN</Button>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                        <Button mode="text" onPress={() => setOtpMode(false)}>Back</Button>
                                        <Button mode="text" onPress={() => setOtpMode(false)}>Resend OTP</Button>
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
        backgroundColor: colors.primary
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
        backgroundColor: 'red',
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