import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, Keyboard, ScrollView, StyleSheet, TouchableHighlight, View } from "react-native";
import { Button, FAB, Icon, Portal, Text, TextInput, TouchableRipple } from "react-native-paper";
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission } from "react-native-vision-camera";
import ImageViewerDialog from "./Dialogs/ImageViewerDialog";
import { AutoDragSortableView, DragSortableView } from "react-native-drag-sort";
import HelperInput from "./common/HelperInput";
import { useDispatch, useSelector } from "react-redux";
import { set_active_message, showError } from "../Redux/Actions";
import { Api1 } from "../API";
import axios from "axios";
import { Image as ImageCompress } from 'react-native-compressor';
import { useQuery, useRealm } from "@realm/react";
import { useNavigation, useRoute } from "@react-navigation/native";
import DocumentPicker, { types } from 'react-native-document-picker'
import ImageCropPicker from "react-native-image-crop-picker";
import { CropView } from "react-native-image-crop-tools";
import { Page } from "../Models.js/ChatsModel";
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
    const [open, setOpen] = useState(false);

    return (
        <>
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
                <View style={{ backgroundColor: '#151a7b', height: 50, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Button disabled={images?.length == 0} style={{ width: '50%' }} buttonColor="#056fb6" mode="contained" onPress={() => { setStep(2) }}>Next</Button>
                </View>
            </View>
            <Portal>
                <FAB.Group
                    style={{ paddingBottom: 50 }}
                    open={open}
                    visible
                    icon={open ? 'minus' : 'plus'}
                    actions={[
                        {
                            icon: 'camera',
                            label: 'Camera',
                            onPress: () => { setOpen(false); setStep(0) },
                        },
                        {
                            icon: 'image-multiple',
                            label: 'Gallery',
                            onPress: () => {
                                setOpen(false);
                                DocumentPicker.pick({
                                    allowMultiSelection: true,
                                    type: [types.images],
                                    copyTo: 'cachesDirectory',
                                }).then((data) => {
                                    let galleryImages = data?.map(file => file.fileCopyUri) || [];
                                    setImages([...images, ...galleryImages])
                                }).catch((err) => { console.log({ err }) })
                            },
                        },
                    ]}
                    onStateChange={() => { }}
                    onPress={() => {
                        setOpen(!open)
                    }}
                />
            </Portal>
        </>
    )
}

const RenderStep3 = ({ images = [], setImages, setStep, editMode }) => {
    const cropRef = useRef(null);
    const [pgNo, setPgNo] = useState(0);
    const [cropped, setCropped] = useState([])
    const [loading, setLoading] = useState(false);
    useEffect(() => {

    }, [])

    const hCrop = () => {
        if (loading) return;
        cropRef.current.saveImage(true, 100);
        setLoading(true)
    }
    return (
        <View style={{ flex: 1, backgroundColor: '#121b22' }}>
            <View style={{ flex: 0.9, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <CropView
                    sourceUrl={images[pgNo]}
                    ref={cropRef}
                    style={{ height: '86%', width: '100%', }}
                    onImageCrop={(res) => {
                        let tempImages = images;
                        tempImages[pgNo] = `file://${res.uri}`
                        setImages([...tempImages]);
                        setCropped([...cropped, pgNo])
                        setLoading(false);
                    }}
                />
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', position: 'absolute', bottom: 0 }}>
                    <TouchableHighlight disabled={pgNo == 0} onPress={() => { if (pgNo > 0) setPgNo(pgNo - 1) }} underlayColor={"#056fb6"} style={{ paddingVertical: 7, paddingHorizontal: 10, borderRadius: 5 }}>
                        <Icon source={"arrow-left"} color={pgNo == 0 ? "#ffffff82" : "white"} size={30} />
                    </TouchableHighlight>
                    <Button mode="contained" onPress={() => { setStep(3) }} buttonColor="#056fb6" style={{ borderRadius: 5 }}>Next</Button>
                    <TouchableHighlight disabled={pgNo >= (images?.length - 1)} onPress={() => { if (pgNo < (images.length - 1)) setPgNo(pgNo + 1) }} underlayColor={"#056fb6"} style={{ paddingVertical: 7, paddingHorizontal: 10, borderRadius: 5 }}>
                        <Icon source={"arrow-right"} color={pgNo >= (images?.length - 1) ? "#ffffff82" : "white"} size={30} />
                    </TouchableHighlight>
                </View>
            </View>
            <View style={{ flex: 0.1, backgroundColor: 'red', width: '100%', justifyContent: 'center', alignContent: 'center' }}>
                <ScrollView style={{ backgroundColor: 'black', width: '100%', }} horizontal={true}>
                    {images?.map((img, index) => {
                        return (
                            <TouchableRipple key={index} rippleColor="red" onPress={() => { setPgNo(index) }} style={styles.imgContainer}>
                                <>
                                    <Image style={styles.imgStyle} source={{ uri: img }} width={1} height={1} />
                                    {cropped?.includes(index) && <TouchableHighlight style={{ position: 'absolute', width: '100%', backgroundColor: 'green', bottom: 0, alignItems: 'center' }}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Cropped</Text>
                                    </TouchableHighlight>}
                                </>
                            </TouchableRipple>
                        )
                    })}
                </ScrollView>
            </View>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', position: 'absolute', top: 15 }}>
                <Button mode="contained" onPress={() => { setStep(1) }} buttonColor="#056fb6" style={{ borderRadius: 5 }}>Back</Button>
                <Button loading={loading} mode="contained" onPress={hCrop} buttonColor="#056fb6" style={{ borderRadius: 5 }}>Crop</Button>
            </View>

        </View>
    )
}

const RenderStep4 = ({ images = [], editMode, messageId }) => {
    const dispatch = useDispatch();
    const realm = useRealm();
    const navigation = useNavigation();
    const [subject, setSubject] = useState('');
    const [percent, setPercent] = useState(0);
    const [error, setError] = useState('');
    const [uploadedLink, setUploadedLink] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatData = useSelector(state => state.activeChat);
    const message = useSelector(state => state.activeMessage);
    const page = useQuery(Page);
    const hSend = async () => {
        Keyboard.dismiss();
        if (subject?.trim()?.length == 0 && !editMode) {
            setError("Subject is required");
            return;
        } else {
            setError('');
        }
        if (loading) return;

        setLoading(true);
        setPercent(0);

        let uploadedData = [];
        await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Notes`);
        for (let i = 0; i < images.length; i++) {
            try {
                let existsImgName = images[i]?.split("/")?.pop() || ''
                const fileExists = await RNFS.exists(`${RNFS.ExternalDirectoryPath}/Notes/${existsImgName}`);
                if (!fileExists) {
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
                    uploadedData = [...uploadedData, { picUrl: imageUrl, picName: imageName, picPath: `file://${RNFS.ExternalDirectoryPath}/Notes/${imageName}` }]
                } else {
                    const pageData = realm
                        .objects('Page')
                        .filtered('picPath = $0', `file://${RNFS.ExternalDirectoryPath}/Notes/${existsImgName}`);
                    uploadedData = [...uploadedData, { picUrl: pageData[0]?.picUrl, picName: existsImgName, picPath: `file://${RNFS.ExternalDirectoryPath}/Notes/${existsImgName}` }]
                }
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

            if (editMode) {
                let { data } = await Api1.post(`/api/message/updateMessage`,
                    {
                        pages: uploadedData?.map(img => img.picUrl) || [],
                        messageId: messageId
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

                    realm.create('Message',
                        {
                            _id: data?.newMessage?._id,
                            sender: data?.newMessage?.sender,
                            updateMessage: data?.newMessage?.updateMessage,
                            updatedMsgId: data?.newMessage?.updatedMsgId,
                            updateMessageContent: data?.newMessage?.updateMessageContent,
                            pages: [],
                            chat: data?.newMessage?.chat,
                            createdat: data?.newMessage?.createdAt,
                            updatedat: data?.newMessage?.updatedAt,
                        }
                        , true)
                })
                dispatch(set_active_message({ ...message, pages: uploadedData }))

            } else {
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
                });
            }

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
            <Text style={{ fontSize: 150, color: 'white' }}>{Math.trunc(percent)}%</Text>
            <Text style={{ fontSize: 20, color: 'white', letterSpacing: 10, marginBottom: 20 }}>UPLOADED</Text>
            <View style={{ width: '70%' }}>
                {!editMode && <HelperInput value={subject} onChange={(text) => { setSubject(text) }} mode={"outlined"} label={"Subject*"} helperText={error} />}
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
    const [editMode, setEditMode] = useState(false)
    const device = useCameraDevice(camType);
    const message = useSelector(state => state.activeMessage);
    const camera = useRef(null);
    const route = useRoute();

    useEffect(() => {
        if (route?.params?.editMode == true) {
            setEditMode(true);
            setImages(message?.pages?.map(page => page?.picPath) || []);
            setStep(1);
        }
    }, [route?.params])

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
            {step == 1 && <RenderStep2 images={images} setImages={setImages} setStep={setStep} editMode={editMode} imageDimensions={imageDimensions?.height == 0 ? undefined : imageDimensions} hRemoveImage={hRemoveImage} />}
            {step == 2 && <RenderStep3 images={images} setImages={setImages} setStep={setStep} editMode={editMode} />}
            {step == 3 && <RenderStep4 images={images} editMode={editMode} messageId={message?._id} />}
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