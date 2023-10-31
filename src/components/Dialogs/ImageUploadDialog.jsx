import React from "react";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import { Button, Dialog, Icon, Portal, Text } from "react-native-paper";

const ImageUploadDialog = ({ show = false, hGallery, hCamera, hClose }) => {

    const onCamera = () => {
        hCamera && hCamera();
    }

    const onGallery = () => {
        hGallery && hGallery();
    }

    const onClose = () => {
        hClose && hClose();
    }

    return (
        <Portal>
            <Dialog style={{ marginHorizontal: '10%' }} visible={show} onDismiss={onClose}>
                <Text style={{ textAlign: 'center', fontSize: 35, fontWeight: 'bold', color: '#114b5f', marginVertical: 20 }}>Snap or Browse</Text>
                {/* <Dialog.Title style={{ textAlign: 'center', fontSize: 35, fontWeight: 'bold', color: '#FF445A',marginTop:30 }}>Snap or Browse</Dialog.Title> */}
                <Dialog.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', width: '90%', gap: 20, justifyContent: 'center', marginBottom: 20 }}>
                        <TouchableHighlight underlayColor={"#0d3948"} style={styles.iconButtonStyle} onPress={onCamera}>
                            <View style={styles.btnContainer}>
                                <Icon source={"camera"} size={60} color="#99edc3" />
                                <Text style={styles.btnText}>Camera</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor={"#0d3948"} style={styles.iconButtonStyle} onPress={onGallery}>
                            <View style={styles.btnContainer}>
                                <Icon source={"folder-image"} size={60} color="#99edc3" />
                                <Text style={styles.btnText}>Gallery</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

const styles = StyleSheet.create({
    iconButtonStyle: {
        backgroundColor: '#114b5f',
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",

        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
    },
    btnContainer: {
        alignItems: 'center'
    },
    btnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#faf3dd'
    }
})

export default ImageUploadDialog;