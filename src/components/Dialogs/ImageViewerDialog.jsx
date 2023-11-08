import React from "react";
import { Image, StyleSheet, TouchableHighlight, View } from "react-native";
import { Button, Dialog, Icon, Portal, Text } from "react-native-paper";

const ImageViewerDialog = ({ show = false, onDelete, hClose, imagePath = '' }) => {
    const hDelete = () => {
        onDelete && onDelete();
    }

    const onClose = () => {
        hClose && hClose();
    }

    return (
        <Portal>
            <Dialog style={{ marginHorizontal: '10%' }} visible={show} onDismiss={onClose}>
                {/* <Dialog.Title style={{ textAlign: 'center', fontSize: 35, fontWeight: 'bold', color: '#FF445A',marginTop:30 }}>Snap or Browse</Dialog.Title> */}
                <View style={{paddingHorizontal:20}}>
                    <Image resizeMode="contain" source={{ uri: imagePath }} style={{ height: 400, paddingHorizontal: 20 }} />
                </View>

                <Dialog.Actions style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', width: '90%', gap: 20, justifyContent: 'center' }}>
                        <Button style={{ width: '40%', marginTop: 20,backgroundColor: '#16cfa8' }} mode="contained" onPress={onClose}>Close</Button>
                        <Button style={{ width: '40%', marginTop: 20 }} mode="contained" onPress={hDelete}>Delete</Button>
                    </View>
                </Dialog.Actions>
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

export default ImageViewerDialog;