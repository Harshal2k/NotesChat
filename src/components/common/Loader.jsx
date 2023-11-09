import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import colors from "../../styles/Colours";
import { useSelector } from "react-redux";

const Loader = () => {
    const loading = useSelector(state => state.loading);
    return (
        <>
            {
                loading?.show && <View style={styles.mainContainer}>
                    <View style={styles.innerContainer}>
                        <Image style={{ height: 100, width: 100 }} source={require("../../Images/loading.gif")}></Image>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 10 }}>{loading?.text1 || "Almost There"}</Text>
                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{loading?.text2 || "NotesChat is on the Way"}</Text>
                    </View>
                </View>
            }
        </>
    )
};

const styles = StyleSheet.create({
    mainContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: '#1c1c1cc7',
        position: 'absolute',
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    innerContainer: {
        backgroundColor: colors.white,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
        alignItems: 'center'
    },
    inputStyle: {
        color: colors.black,
        width: '100%',
    },
    btnStyle: {
        fontSize: 24,
        borderRadius: 10,
        backgroundColor: colors.black,
        marginTop: 20,
        width: '100%'
    },
    imageContainer: {
        backgroundColor: 'red',
        borderRadius: 100,
        borderColor: 'white',
        borderWidth: 10,
        width: 120,
        height: 120,
        marginTop: -80,
        display: 'flex'
    },
    txtBtnContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: -5,
        marginTop: 5,
        width: '100%'
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 100,
        position: 'absolute'
    },

    otpInput: {
        borderColor: colors.primary,
        color: 'black',
        backgroundColor: '#ededed',
        borderRadius: 10,
    },
});

export default Loader;