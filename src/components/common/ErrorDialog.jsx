import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { hideError } from "../../Redux/Actions";

const ErrorDialog = () => {
    const dispatch = useDispatch();
    const errorData = useSelector(state => state?.errorDialog);

    const hClose = () => {
        dispatch(hideError())
    }

    return (
        <Portal>
            <Dialog style={{ marginHorizontal: '15%' }} visible={errorData.show} onDismiss={hClose}>
                <Dialog.Icon size={70} color="#FF445A" icon="close-circle" />
                <Dialog.Title style={{ textAlign: 'center', fontSize: 25, fontWeight: 'bold', color: '#FF445A' }}>Error</Dialog.Title>
                <Dialog.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text variant="bodyMedium">{errorData?.error}</Text>
                    <Button style={{ width: '50%', marginTop: 20 }} mode="contained" onPress={hClose}>Close</Button>
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

export default ErrorDialog;