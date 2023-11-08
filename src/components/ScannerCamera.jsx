import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, TouchableHighlight, View } from "react-native";
import { Icon, Text, TouchableRipple } from "react-native-paper";
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission } from "react-native-vision-camera";
import ImageViewerDialog from "./Dialogs/ImageViewerDialog";
import { AutoDragSortableView, DragSortableView } from "react-native-drag-sort";
const testImage = require('../Images/testImage.jpeg');

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
                                    <View style={{ position: 'absolute', width: '100%', bottom: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <TouchableHighlight style={{ flex: 1, backgroundColor: '#00c851', alignItems: 'center', borderBottomLeftRadius: 8, borderRightWidth: 1, borderColor: 'white', borderTopWidth: 2 }} onPress={() => { }}>
                                            <Icon source={"file-document-edit-outline"} color="white" size={25} />
                                        </TouchableHighlight>
                                        <TouchableHighlight style={{ flex: 1, backgroundColor: '#ff4444', alignItems: 'center', borderBottomRightRadius: 8, borderLeftWidth: 1, borderColor: 'white', borderTopWidth: 2 }} onPress={() => { hRemoveImage(index) }}>
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
            console.log({ photo })
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