import React, { useState, useEffect } from 'react'
import { Image } from 'react-native'
import DocumentScanner from 'react-native-document-scanner-plugin'
import { useCameraPermission } from 'react-native-vision-camera';

export default Scanner = () => {
    const [scannedImage, setScannedImage] = useState();
    const { hasPermission, requestPermission } = useCameraPermission()

    const scanDocument = async () => {
        // start the document scanner
        const { scannedImages } = await DocumentScanner.scanDocument()

        // get back an array with scanned image file paths
        if (scannedImages.length > 0) {
            // set the img src, so we can view the first scanned image
            setScannedImage(scannedImages[0])
        }
    }


    useEffect(() => {
        // call scanDocument on load
        if (!hasPermission) {
            requestPermission();
        } else {
            scanDocument()
        }
    }, [hasPermission]);

    return (
        <Image
            resizeMode="contain"
            style={{ width: '100%', height: '100%' }}
            source={{ uri: scannedImage }}
        />
    )
}