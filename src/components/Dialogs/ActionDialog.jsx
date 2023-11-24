import React from "react";
import { View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

const ActionDialog = ({ icon, title = '', desc = '', show = false, onYes, onNo, inprogress = false }) => {

    const hClose = () => {
        if (inprogress) return;
        onNo && onNo();
    }

    const hYes = () => {
        if (inprogress) return;
        onYes && onYes();
    }

    return (
        <Portal>
            <Dialog style={{ marginHorizontal: '15%' }} visible={show} onDismiss={hClose}>
                {icon && <Dialog.Icon size={70} color="#FF445A" icon={icon} />}
                <Dialog.Title style={{ textAlign: 'center', fontSize: 25, fontWeight: 'bold', color: '#FF445A' }}>{title}</Dialog.Title>
                <Dialog.Content style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text variant="bodyMedium">{desc}</Text>
                    <View style={{ flexDirection: 'row', width: '90%', gap: 20, justifyContent: 'center' }}>
                        <Button loading={inprogress} style={{ width: '40%', marginTop: 20 }} mode="contained" onPress={hYes}>Yes</Button>
                        <Button loading={inprogress} style={{ width: '40%', marginTop: 20, backgroundColor: '#16cfa8' }} mode="contained" onPress={hClose}>No</Button>
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    )
}

export default ActionDialog;