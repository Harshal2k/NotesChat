import React, { useState, useEffect } from 'react'
import { Image, View } from 'react-native'
import DocumentScanner from 'react-native-document-scanner-plugin'
import { Button } from 'react-native-paper';
import { useCameraPermission } from 'react-native-vision-camera';
import ScannerCamera from './ScannerCamera';

const Scanner = () => {
    const [scannedImage, setScannedImage] = useState([]);
    const [index, setIndex] = useState(0);
    const { hasPermission, requestPermission } = useCameraPermission()

    const scanDocument = async () => {
        const { scannedImages } = await DocumentScanner.scanDocument()

        if (scannedImages.length > 0) {
            setScannedImage(scannedImages)
        }
    }


    // useEffect(() => {

    //     if (!hasPermission) {
    //         requestPermission();
    //     } else {
    //         scanDocument()
    //     }
    // }, [hasPermission]);

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <ScannerCamera />
        </View>
    )
}

export default Scanner