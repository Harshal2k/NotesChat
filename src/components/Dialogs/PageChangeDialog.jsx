import React, { useState } from "react";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";
import HelperInput from "../common/HelperInput";
import { View } from "react-native";

const PageChangeDialog = ({ totalPages = 0, show = false, onYes, onNo }) => {
    const [pgNo, setPgNo] = useState('');
    const [error, setError] = useState('')
    const hClose = () => {
        onNo && onNo();
    }

    const hYes = () => {
        if (isNaN(Number(pgNo))) {
            setError("Invalid Page Number")
            return;
        } else if (Math.trunc(Number(pgNo)) > (totalPages)) {
            setError(`There are only ${totalPages} pages.`)
            return;
        } else if (Math.trunc(Number(pgNo)) === 0) {
            setError(`Page Number cannot be zero.`)
            return;
        } else {
            setError('');
            setPgNo('');
        }
        onYes && onYes(Math.trunc(Number(pgNo)));
    }

    return (
        <Portal>
            <Dialog style={{ marginHorizontal: '15%' }} visible={show} onDismiss={hClose}>
                <Dialog.Title style={{ textAlign: 'center', fontSize: 25, fontWeight: 'bold', color: '#FF445A' }}>Go to Page</Dialog.Title>
                <Dialog.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <HelperInput value={pgNo} onChange={(text) => { setPgNo(text?.trim()) }} mode={"outlined"} label={"Page No."} helperText={error} keyboardType="numeric" />
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Button style={{ width: '60%', marginTop: 20 }} mode="contained" onPress={hYes}>{"Let's Go"}</Button>
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

export default PageChangeDialog;