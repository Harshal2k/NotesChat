import React from "react";
import { View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

const HelperInput = ({ style, mode, label, value, onChange, helperText, ...props }) => {

    return (
        <View style={{ width: '100%' }}>
            <TextInput style={style} mode={mode || "outlined"} label={label} value={value || ''} onChangeText={onChange} {...props} />
            {helperText?.length > 0 &&
                <HelperText type="error" visible={true}>{helperText}</HelperText>
            }
        </View>
    )
};

export default HelperInput;