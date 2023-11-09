import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, TouchableHighlight, View } from "react-native";
import { Directions, Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State } from "react-native-gesture-handler";
import { Button, Icon, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import ImageView from "react-native-image-viewing";
import PageChangeDialog from "./Dialogs/PageChangeDialog";
const testImage = require('../Images/testImage.jpeg');
const sHeight = Dimensions.get("window").height;
const sWidth = Dimensions.get("window").width;
const NotesViewer = () => {
    const message = useSelector(state => state.activeMessage);
    const [show, setShow] = useState(false);
    const [scale, setScale] = useState({ initial: 0, updated: 1 });
    const [translate, setTranslate] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (scale?.updated === 1) {
            setTranslate({ x: 0, y: 0 })
        }
    }, [scale])

    const [pageNo, setPageNo] = useState(0);

    const flingGestureRight = Gesture.Fling()
        .enabled(scale.updated <= 1)
        .direction(Directions.RIGHT)
        .onStart((e) => {
            if (pageNo > 0) {
                setPageNo(pageNo - 1)
            }
        })

    const flingGestureLeft = Gesture.Fling()
        .enabled(scale.updated <= 1)
        .direction(Directions.LEFT)
        .onStart((e) => {
            if (pageNo < (message?.pages?.length - 1)) {
                setPageNo(pageNo + 1)
            }
        })

    const pinchGesture = Gesture.Pinch()
        .onChange((e) => {
            if (e.scale >= 1) {
                setScale((prev) => {
                    let updatedValue = 0;
                    if (prev.initial === 0) {
                        updatedValue = e.scale;
                    } else {
                        updatedValue = prev.initial + (Math.abs(1 - e.scale))
                    }
                    return { ...prev, updated: (updatedValue <= 3) ? parseFloat(updatedValue?.toFixed(2)) : prev.updated }
                })
            } else if (scale.updated > 1) {
                setScale((prev) => {
                    let updatedValue = 0;
                    if (prev.initial === 0) {
                        updatedValue = e.scale;
                    } else {
                        updatedValue = prev.initial - (Math.abs(1 - e.scale))
                    }
                    return { ...prev, updated: (updatedValue <= 3) ? parseFloat(updatedValue?.toFixed(1)) : prev.updated }
                })
            }

        }).onEnd((e) => {

            setScale((prev) => ({ ...prev, initial: prev.updated }))
        })

    const panGesture = Gesture.Pan()
        .shouldCancelWhenOutside(true)
        .enabled(scale.updated > 1)
        .onChange((e) => {
            setTranslate((prev) => {
                let updatedX = prev.x + (e.changeX);
                let updatedY = prev.y + (e.changeY);
                return {
                    x: (updatedX > 200 || updatedX < -200) ? prev.x : prev.x + (e.changeX),
                    y: (updatedY > 250 || updatedY < -250) ? prev.y : prev.y + (e.changeY)
                }
            })
        })

    const doubleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(2)
        .onStart(() => {
            setScale({ initial: 0, updated: 1 });
            setTranslate({ x: 0, y: 0 })
        });

    const composedGesture = Gesture.Race(flingGestureRight, flingGestureLeft, Gesture.Simultaneous(pinchGesture, panGesture), doubleTap)

    return (
        <View style={{ flex: 1, backgroundColor: '#121b22', alignItems: 'center' }}>
            <PageChangeDialog show={show} totalPages={message?.pages?.length} onNo={() => { setShow(false) }} onYes={(pgNo) => { setPageNo(pgNo - 1); setShow(false) }} />
            <GestureHandlerRootView style={{ width: '100%', height: '100%' }}>
                <GestureDetector gesture={composedGesture}>
                    <GestureDetector gesture={panGesture}>
                        <Animated.Image
                            source={{ uri: message?.pages[pageNo]?.picPath || message?.pages[pageNo]?.picUrl }} style={[{ width: '100%', height: '100%', flex: 0.95, backgroundColor: 'black', resizeMode: 'contain' }, { transform: [{ scale: scale.updated }, { translateX: scale.updated <= 1 ? 0 : translate.x }, { translateY: scale.updated <= 1 ? 0 : translate.y }] }]}
                        />
                    </GestureDetector>

                </GestureDetector>
            </GestureHandlerRootView>
            {/* <Image source={testImage} resizeMode="contain" style={{ flex: 0.9 }} /> */}

            {/* <View style={{flex:0.7}}>
            <ImageView
                presentationStyle="formSheet"
                images={[testImage]}
                imageIndex={0}
                visible={true}
                onRequestClose={() => {}}
            />
            </View> */}
            <View style={{ backgroundColor: '#25343f', position: 'absolute', width: '100%', height: '9%', bottom: 0, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
                <TouchableHighlight disabled={pageNo == 0} onPress={() => { setPageNo(pageNo - 1) }} underlayColor={"#0000008c"} style={{ ...styles.borderBtn, opacity: pageNo == 0 ? 0.8 : 1 }}>
                    <Icon source={"arrow-left"} color="white" size={30} />
                </TouchableHighlight>
                <View style={{ justifyContent: 'space-between', height: '80%' }}>
                    <View style={{ backgroundColor: 'white', borderRadius: 10 }}>
                        <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center' }}>{pageNo + 1}/{message?.pages?.length}</Text>
                    </View>
                    <TouchableHighlight onPress={() => { setShow(true) }} underlayColor={"#0000008c"} style={{ ...styles.borderBtn, borderRadius: 10, width: 80, height: 30 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>GO TO</Text>
                    </TouchableHighlight>
                </View>
                <TouchableHighlight disabled={pageNo >= (message?.pages?.length - 1)} onPress={() => { setPageNo(pageNo + 1) }} underlayColor={"#0000008c"} style={{ ...styles.borderBtn, opacity: pageNo >= (message?.pages?.length - 1) ? 0.8 : 1 }}>
                    <Icon source={"arrow-right"} color="white" size={30} />
                </TouchableHighlight>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    borderBtn: {
        borderColor: 'white',
        borderWidth: 3,
        borderRadius: 100,
        height: 60,
        width: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
})


export default NotesViewer;