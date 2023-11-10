import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

const AboutUs = () => {

    return (
        <View style={{ flex: 1, backgroundColor: '#121b22', alignItems: 'center', paddingTop: '5%', justifyContent: 'flex-start' }}>
            <ScrollView style={{ width: '100%', paddingHorizontal: 20 }}>
                <Image resizeMode="contain" source={require("../Images/NotesChatLogo.png")} style={{ height: 150, width: 150}} />
                <Text style={styles.heading}>About Noteschat</Text>
                <Text style={styles.para}>Welcome to Noteschat, your go-to platform for seamless study note sharing with your friends and peers.</Text>

                <Text style={styles.heading}>Our Story</Text>
                <Text style={styles.para}>At Noteschat, we believe that learning is more effective when it's a collaborative effort. We understand the challenges of students and professionals in managing and sharing study materials efficiently. That's why we created Noteschat, a purpose-built chat app designed to make sharing and discussing study notes a breeze.</Text>

                <Text style={styles.heading}>Our Mission</Text>
                <Text style={styles.para}>Our mission is to empower students, educators, and lifelong learners to connect, collaborate, and elevate their study experience. We want to foster a sense of community and make knowledge-sharing more accessible than ever. Noteschat is not just a chat app; it's a knowledge-sharing hub that brings people together for a common goal - academic success.</Text>

                <Text style={styles.heading}>Contact Us</Text>
                <Text style={styles.para}>We love to hear from our users! If you have any feedback, suggestions, or questions, please don't hesitate to reach out to us at noteschatapp@gmail.com. Your input is invaluable in making Noteschat an even better platform for study note sharing.</Text>
                <Text style={styles.para}>Get started with Noteschat today and take your learning experience to the next level. Together, we can make studying more collaborative, efficient, and enjoyable.</Text>
                <Text style={styles.para}>Thank you for choosing Noteschat for your study note sharing needs.</Text>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    heading: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
        marginTop: 20
    },
    para:{
        color:'white',
        marginTop:10
    }
})

export default AboutUs;