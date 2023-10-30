import React, { useEffect, useRef, useState } from "react";
import { TouchableHighlight, View } from "react-native";
import { Button, Icon } from "react-native-paper";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";

const CameraViewer = ({ setCameraMode, setImageSource }) => {

    const { hasPermission, requestPermission } = useCameraPermission()
    const [camType, setCamType] = useState('back');
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
            setImageSource(photo.path);
            setCameraMode(false);
            console.log(photo.path);
        }
    };
    console.log({ camType })
    return (
        <View style={{ flex: 1 }}>
            {hasPermission && <>
                <Camera
                    orientation="portrait"
                    ref={camera}
                    device={device}
                    isActive={true}
                    style={{ flex: 1 }}
                    photo={true}
                />
                <View style={{ width: '100%', alignItems: 'center', position: 'absolute', bottom: 30,flexDirection:'row',justifyContent:'space-between',paddingHorizontal:20 }}>
                    <TouchableHighlight onPress={() => {setCameraMode(false)}} underlayColor={"#0000008c"} style={{ borderColor: 'white', borderWidth: 3, padding: 7, borderRadius: 100 }}>
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
                        <Icon source={"camera"} color="white" size={30} />
                    </TouchableHighlight>
                </View>
            </>}
        </View>
    )
}

export default CameraViewer;