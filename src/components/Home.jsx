import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { PermissionsAndroid, View, useWindowDimensions } from "react-native";
import Chats from "./Chats/Chats";
import Notes from "./Notes";
import { Icon, Text } from "react-native-paper";
import { useState } from "react";

const FirstRoute = () => (
    <View style={{ flex: 1, backgroundColor: '#121b22' }} />
);

const SecondRoute = () => (
    <View style={{ flex: 1, backgroundColor: '#121b22' }} />
);

const renderScene2 = SceneMap({
    first: Chats,
    second: Notes,
});

const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'first':
        return <Chats />;
      case 'second':
        return <Notes />;
    }
  };

const renderTabBar = props => (
    <TabBar
        {...props}
        pressColor="#056fb6"
        pressOpacity={1}
        tabStyle={{ backgroundColor: '#056fb6', margin: 5, borderRadius: 10 }}
        indicatorStyle={{ backgroundColor: 'white' }}
        style={{ backgroundColor: '#067fd0' }}
        renderLabel={({ route, focused, color }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon source={route?.title === "Chats" ? "message-text" : "file-multiple"} color={color} size={20} />
                <Text style={{ color, fontWeight: 'bold', marginLeft: 5, fontSize: 16 }}>
                    {route.title}
                </Text>
            </View>
        )}
    />
);

const Home = () => {
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'first', title: 'Chats' },
        { key: 'second', title: 'Notes' },
    ]);

    const getContacts = () => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
            title: 'Contacts',
            message: 'This app would like to view your contacts.',
            buttonPositive: 'Please accept bare mortal',
        })
            .then((res) => {
                console.log('Permission: ', res);
                Contacts.getAll()
                    .then((contacts) => {
                        // work with contacts
                        console.log(contacts);
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((error) => {
                console.error('Permission error: ', error);
            });
    }

    return (
        <TabView
            renderTabBar={renderTabBar}
            navigationState={{ index, routes }}
            renderScene={renderScene2}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
        />
    )
}

export default Home;