import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, TouchableHighlight, View } from "react-native";
import { Icon } from "react-native-paper";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
const testImage = require('../Images/testImage.jpeg');

const ImageThumbnail = ({ imagePath }) => {

    return (
        <View style={{ width: 5, height: 4 }}>
            <Image style={{ width: 5, height: 4 }} source={imagePath} width={1} height={1} />
        </View>
    )
}

const ScannerCamera = () => {
    const { hasPermission, requestPermission } = useCameraPermission()
    const [camType, setCamType] = useState('back');
    const [images, setImages] = useState([]);
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
            {hasPermission && <>
                <View style={{ flex: 0.9, position: 'relative' }}>
                    <Camera
                        orientation="portrait"
                        ref={camera}
                        device={device}
                        isActive={true}
                        style={{ flex: 1 }}
                        photo={true}
                    />
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', position: 'absolute', bottom: 0 }}>
                        <TouchableHighlight onPress={() => { }} underlayColor={"#0000008c"} style={styles.borderBtn}>
                            <Icon source={"arrow-left"} color="white" size={30} />
                        </TouchableHighlight>
                        <View onTouchEnd={() => { capturePhoto() }} onPress={() => { capturePhoto() }} style={{ width: 70, height: 70, backgroundColor: 'red', borderRadius: 100, borderColor: 'white', borderWidth: 5 }} />
                        <TouchableHighlight onPress={() => {
                            if (camType == 'front') {
                                setCamType('back');
                            } else {
                                setCamType('front')
                            }
                        }} underlayColor={"#0000008c"} style={styles.borderBtn}>
                            <Icon source={"camera-flip"} color="white" size={30} />
                        </TouchableHighlight>
                    </View>
                </View>
                <View style={{ flex: 0.1, backgroundColor: 'red', width: '100%', justifyContent: 'center', alignContent: 'center' }}>
                    <ScrollView style={{ backgroundColor: 'black', width: '100%', }} horizontal={true}>
                        {images?.map((img, index) => {
                            return (
                                <View style={styles.imgContainer}>
                                    <Image style={styles.imgStyle} source={{ uri: img }} width={1} height={1} />
                                    <TouchableHighlight style={{ position: 'absolute', width: '100%', backgroundColor: 'red', bottom: 0, alignItems: 'center' }} onPress={() => { hRemoveImage(index) }}>
                                        <Icon source={"close-thick"} color="white" size={18} />
                                    </TouchableHighlight>
                                </View>
                            )
                        })}
                    </ScrollView>
                </View>
            </>}
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
        marginVertical: 7
    },
    imgStyle: {
        width: 45,
        height: '100%'
    }
})

export default ScannerCamera;