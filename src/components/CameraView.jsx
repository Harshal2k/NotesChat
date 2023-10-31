import React, { useEffect, useRef, useState } from "react";
import { Dimensions, TouchableHighlight, View } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import { Button, Icon } from "react-native-paper";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";

const CameraViewer = ({ setCameraMode, setImageSource }) => {
    const { hasPermission, requestPermission } = useCameraPermission()
    const [mode, setMode] = useState('');
    const [camType, setCamType] = useState('back');
    const device = useCameraDevice(camType);
    const camera = useRef(null)

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission])

    const cropImage = (photo) => {
        ImageCropPicker.openCropper({
            path: `file://${photo.path}`,
            width: 400,
            height: 400,
            compressImageQuality: 0.7,
            cropperCircleOverlay: true,
        }).then(image => {
            console.log(image);
            setImageSource(image.path);
            setCameraMode(false);
        }).catch((error) => {
            console.log({ error });
            if (camType == 'back') {
                setCamType('front');
            } else {
                setCamType('back');
            }
        });
    }

    const capturePhoto = async () => {
        if (camera.current !== null) {
            const photo = await camera.current.takePhoto({ Orientation: 'portrait' });
            cropImage(photo)
        }
    };
    console.log({ camType })
    return (
        <View style={{ flex: 1,backgroundColor:'black' }}>
            {hasPermission && <>
                <Camera
                    orientation="portrait"
                    ref={camera}
                    device={device}
                    isActive={true}
                    style={{ flex: 1 }}
                    photo={true}
                />
                <View style={{ width: '100%', alignItems: 'center', position: 'absolute', bottom: 30, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                    <TouchableHighlight onPress={() => { setCameraMode(false) }} underlayColor={"#0000008c"} style={{ borderColor: 'white', borderWidth: 3, padding: 7, borderRadius: 100 }}>
                        <Icon source={"arrow-left"} color="white" size={30} />
                    </TouchableHighlight>
                    <View onTouchEnd={() => { capturePhoto() }} onPress={() => { capturePhoto() }} style={{ width: 70, height: 70, backgroundColor: 'red', borderRadius: 100, borderColor: 'white', borderWidth: 5 }} />
                    <TouchableHighlight onPress={() => {
                        if (camType == 'front') {
                            setCamType('back');
                        } else {
                            setCamType('front')
                        }
                    }} underlayColor={"#0000008c"} style={{ borderColor: 'white', borderWidth: 3, padding: 7, borderRadius: 100 }}>
                        <Icon source={"camera-flip"} color="white" size={30} />
                    </TouchableHighlight>
                </View>
            </>}
        </View>
    )
}

export default CameraViewer;