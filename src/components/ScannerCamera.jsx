import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, Keyboard, ScrollView, StyleSheet, TouchableHighlight, View } from "react-native";
import { Button, Icon, Text, TextInput, TouchableRipple } from "react-native-paper";
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission } from "react-native-vision-camera";
import ImageViewerDialog from "./Dialogs/ImageViewerDialog";
import { AutoDragSortableView, DragSortableView } from "react-native-drag-sort";
import HelperInput from "./common/HelperInput";
import { useDispatch, useSelector } from "react-redux";
import { showError } from "../Redux/Actions";
import { Api1 } from "../API";
import axios from "axios";
import { Image as ImageCompress } from 'react-native-compressor';
import { useRealm } from "@realm/react";
import { useNavigation } from "@react-navigation/native";
const testImage = require('../Images/testImage.jpeg');
const RNFS = require('react-native-fs');
const profileDir = `file://${RNFS.ExternalDirectoryPath}`

const sHeight = Dimensions.get("window").height;
const sWidth = Dimensions.get("window").width;

const IMAGE_HEIGHT = 200;
const IMAGE_WIDTH = (IMAGE_HEIGHT * sWidth) / sHeight;

const ImageThumbnail = ({ imagePath }) => {

    return (
        <View style={{ width: 5, height: 4 }}>
            <Image style={{ width: 5, height: 4 }} source={imagePath} width={1} height={1} />
        </View>
    )
}

const RenderStep2 = ({ images, setImages, setStep, hRemoveImage, }) => {

    return (
        <View style={{ flex: 1, backgroundColor: '#121b22' }}>
            <View style={{ flex: 1, paddingHorizontal: 40 }}>
                <AutoDragSortableView
                    dataSource={images}
                    keyExtractor={(item, index) => item}
                    childrenHeight={220}
                    childrenWidth={170}
                    onDataChange={(data) => { setImages(data) }}
                    scaleStatus="scaleY"
                    renderItem={(item, index) => {
                        return (
                            <TouchableRipple key={index} rippleColor="red" style={{ ...styles.imgContainer, borderRadius: 10 }}>
                                <>
                                    <Image resizeMode="contain" style={{ height: 200, width: 150, borderRadius: 10 }} source={{ uri: item }} />
                                    <View style={{ position: 'absolute', width: '100%', bottom: 0, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'black', borderRadius: 10 }}>
                                        <TouchableHighlight style={{ flex: 1, backgroundColor: '#00c851', alignItems: 'center', borderBottomLeftRadius: 8, borderRightWidth: 1, borderColor: 'white', borderTopWidth: 2, paddingVertical: 4 }} onPress={() => { }}>
                                            <Icon source={"file-document-edit-outline"} color="white" size={25} />
                                        </TouchableHighlight>
                                        <TouchableHighlight disabled={images?.length <= 1} style={{ flex: 1, backgroundColor: '#ff4444', alignItems: 'center', borderBottomRightRadius: 8, borderLeftWidth: 1, borderColor: 'white', borderTopWidth: 2, paddingVertical: 4, opacity: images?.length <= 1 ? 0.5 : 1 }} onPress={() => { hRemoveImage(index) }}>
                                            <Icon source={"trash-can-outline"} color="white" size={25} />
                                        </TouchableHighlight>
                                    </View>
                                    <Text style={styles.numberStyle}>{index + 1}</Text>
                                </>
                            </TouchableRipple>
                        )
                    }}
                />
            </View>
            <View style={{ backgroundColor: '#056fb6', height: 50, width: '100%' }}>
                <Button mode="contained" onPress={() => { setStep(2) }}>Next</Button>
            </View>
        </View>
    )
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const RenderStep3 = ({ images = [] }) => {
    const dispatch = useDispatch();
    const realm = useRealm();
    const navigation = useNavigation();
    const [subject, setSubject] = useState('');
    const [percent, setPercent] = useState(0);
    const [error, setError] = useState('');
    const [uploadedLink, setUploadedLink] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatData = useSelector(state => state.activeChat);
    const hSend = async () => {
        Keyboard.dismiss();
        if (subject?.trim()?.length == 0) {
            setError("Subject is required");
            return;
        } else {
            setError('');
        }
        if (loading) return;

        setLoading(true);
        setPercent(0);
        let mockData =
            [
                {
                    imageUrl: "https://res.cloudinary.com/divzv8wrt/image/upload/v1699467984/x6oldfuacrvsd4xduudn.jpg",
                    imageName: "x6oldfuacrvsd4xduudn.jpg"
                },
                {
                    imageUrl: "https://res.cloudinary.com/divzv8wrt/image/upload/v1699465642/kkyfeopjtuyrw0on32nx.jpg",
                    imageName: "kkyfeopjtuyrw0on32nx.jpg"
                },
                {
                    imageUrl: "https://res.cloudinary.com/divzv8wrt/image/upload/v1698469788/tgxepmfp60p5qjiyqxms.jpg",
                    imageName: "tgxepmfp60p5qjiyqxms.jpg"
                }


            ]

        let uploadedData = [];
        await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Notes`);
        for (let i = 0; i < images.length; i++) {
            try {
                const result = await ImageCompress.compress(images[i]);
                const timestamp = Date.now();
                let data = new FormData();
                data.append('file', {
                    name: `my_image_${timestamp}.jpg`,
                    type: 'image/jpeg',
                    uri: result,
                });
                data.append('upload_preset', 'NotesChat');
                data.append('api_key', '38918525699347');
                data.append('timestamp', timestamp);
                let imgUpload = await axios.post('https://api.cloudinary.com/v1_1/divzv8wrt/image/upload', data);
                let imageUrl = imgUpload.data.url;
                let imageName = `${imgUpload.data.public_id}.${imgUpload.data.format}`

                await RNFS.copyFile(result, `${RNFS.ExternalDirectoryPath}/Notes/${imageName}`)
                uploadedData = [...uploadedData, { picUrl: imageUrl, picName: imageName, picPath: `${RNFS.ExternalDirectoryPath}/Notes/${imageName}` }]
                //setUploadedLink((prev) => [...prev, { imageUrl: mockData[i].imageUrl, imageName: mockData[i].imageName }]);)
                setPercent((prev) => (prev + (90 / images.length)));
            } catch (error) {
                console.log({ error });
                dispatch(showError("Notes upload failed"));
                setLoading(false);
                return;
            }
        }
        setUploadedLink(uploadedData);
        try {
            let { data } = await Api1.post(`/api/message/sendMessage`,
                {
                    subject: subject,
                    pages: uploadedData?.map(img => img.picUrl) || [],
                    chatId: chatData?.chatId
                }
            );

            realm.write(async () => {
                realm.create('Message',
                    {
                        _id: data?.message?._id,
                        sender: data?.message?.sender?._id,
                        subject: data?.message?.subject,
                        pages: uploadedData || [],
                        chat: data?.message?.chat?._id,
                        createdat: data?.message?.createdAt,
                        updatedat: data?.message?.updatedAt,
                    }
                    , true)
            })
            setPercent(100);
            navigation.goBack();
        } catch (err) {
            console.log({ error })
            dispatch(showError("Notes upload failed"));
            setLoading(false);
        }
        setLoading(false);
    }

    return (

        <View style={{ flex: 1, backgroundColor: '#121b22', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 150, color: 'white' }}>{percent}%</Text>
            <Text style={{ fontSize: 20, color: 'white', letterSpacing: 10, marginBottom: 20 }}>UPLOADED</Text>
            <View style={{ width: '70%' }}>
                <HelperInput value={subject} onChange={(text) => { setSubject(text) }} mode={"outlined"} label={"Subject*"} helperText={error} />
                <Button loading={loading} style={{ marginTop: 20 }} mode="contained" onPress={hSend}>SEND</Button>
            </View>
        </View>
    )
}

const ScannerCamera = () => {
    const { hasPermission, requestPermission } = useCameraPermission()
    const [camType, setCamType] = useState('back');
    const [images, setImages] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [step, setStep] = useState(0);
    const [imageDimensions, setImageDimension] = useState({ height: 0, width: 0 });
    const [open, setOpen] = useState(false);
    const device = useCameraDevice(camType);
    const camera = useRef(null)

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission])

    const capturePhoto = async () => {
        if (camera.current !== null) {
            const photo = await camera.current.takePhoto({ Orientation: 'portrait' });
            setImages([...images, `file://${photo.path}`])
        }
    };

    const hRemoveImage = (index) => {
        setImages(images?.filter((d, i) => i !== index));
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <ImageViewerDialog show={open} hClose={() => { setOpen(false) }} imagePath={images[selectedIndex]} onDelete={() => { setOpen(false); hRemoveImage(selectedIndex) }} />
            {(step == 0 && hasPermission) && <>
                <View style={{ flex: 0.9, position: 'relative' }}>
                    <Camera
                        resizeMode="cover"
                        orientation="portrait"
                        ref={camera}
                        device={device}
                        isActive={true}
                        style={{ flex: 1 }}
                        photo={true}
                    />
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', position: 'absolute', bottom: 0 }}>
                        <TouchableHighlight onPress={() => {
                            if (camType == 'front') {
                                setCamType('back');
                            } else {
                                setCamType('front')
                            }
                        }} underlayColor={"#0000008c"} style={styles.borderBtn}>
                            <Icon source={"camera-flip"} color="white" size={30} />
                        </TouchableHighlight>

                        <View onTouchEnd={() => { capturePhoto() }} onPress={() => { capturePhoto() }} style={{ width: 70, height: 70, backgroundColor: 'red', borderRadius: 100, borderColor: 'white', borderWidth: 5 }} />

                        <TouchableHighlight onPress={() => { setStep(1) }} underlayColor={"#0000008c"} style={styles.borderBtn}>
                            <Icon source={"arrow-right"} color="white" size={30} />
                        </TouchableHighlight>
                    </View>
                </View>
                <View style={{ flex: 0.1, backgroundColor: 'red', width: '100%', justifyContent: 'center', alignContent: 'center' }}>
                    <ScrollView style={{ backgroundColor: 'black', width: '100%', }} horizontal={true}>
                        {images?.map((img, index) => {
                            return (
                                <TouchableRipple key={index} rippleColor="red" onPress={() => { setSelectedIndex(index); setOpen(true) }} style={styles.imgContainer}>
                                    <>
                                        <Image style={styles.imgStyle} source={{ uri: img }} width={1} height={1} />
                                        <TouchableHighlight style={{ position: 'absolute', width: '100%', backgroundColor: 'red', bottom: 0, alignItems: 'center' }} onPress={() => { hRemoveImage(index); }}>
                                            <Icon source={"close-thick"} color="white" size={18} />
                                        </TouchableHighlight>
                                    </>
                                </TouchableRipple>
                            )
                        })}
                    </ScrollView>
                </View>
            </>}
            {step == 1 && <RenderStep2 images={images} setImages={setImages} setStep={setStep} imageDimensions={imageDimensions?.height == 0 ? undefined : imageDimensions} hRemoveImage={hRemoveImage} />}
            {step == 2 && <RenderStep3 images={images} />}
        </View>
    )
}

const styles = StyleSheet.create({
    borderBtn: {
        borderColor: 'white',
        borderWidth: 3,
        borderRadius: 100,
        height: 60,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imgContainer: {
        position: 'relative',
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 2,
        marginVertical: 7,
    },
    imgStyle: {
        width: 45,
        height: '100%'
    },
    numberStyle: {
        position: 'absolute',
        backgroundColor: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        top: 0,
        left: 0,
        borderTopLeftRadius: 5,
        borderBottomRightRadius: 5
    }
})

export default ScannerCamera;