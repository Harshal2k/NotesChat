import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  useColorScheme,
  View,
} from 'react-native';
import { ActivityIndicator, Avatar, Icon, IconButton, MD2Colors, Menu } from 'react-native-paper';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Login from './src/components/Login';
import Scanner from './src/components/Scanner';
import Home from './src/components/Home';
import Loader from './src/components/common/Loader';
import ErrorDialog from './src/components/common/ErrorDialog';
import { useQuery, useRealm } from '@realm/react';
import { UserProfile } from './src/Models.js/UserProfile';
import ActionDialog from './src/components/Dialogs/ActionDialog';
import colors from './src/styles/Colours';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatsModel, MessageModel, UserModel } from './src/Models.js/ChatsModel';
import FindUsers from './src/components/FindUsers';
import Messages from './src/components/Chats/Messages';
import { useSelector } from 'react-redux';
import NotesViewer from './src/components/NotesViewer';
import Account from './src/components/Account';
import AboutUs from './src/components/AboutUs';


const Stack = createNativeStackNavigator();

function AppHeader() {
  const navigation = useNavigation();
  const realm = useRealm()
  const userProfile = useQuery(UserProfile);
  const chatsModel = useQuery(ChatsModel);
  const userModel = useQuery(UserModel);
  const messageModel = useQuery(MessageModel);
  const [showLogout, setShowLogout] = useState(false);
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const hLogout = () => {
    AsyncStorage.setItem('token', '').catch((err) => { })
    realm.write(() => {
      realm.delete(userProfile);
      realm.delete(chatsModel);
      realm.delete(userModel);
      realm.delete(messageModel);
      navigation.navigate("Login");
    });
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.white }}>Noteschat</Text>
      <Menu
        contentStyle={{ backgroundColor: '#121b22' }}
        anchorPosition='bottom'
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon="dots-vertical" iconColor='white' style={{ marginRight: 30 }} onPress={openMenu} />}
      >
        <Menu.Item titleStyle={{ color: 'white' }} leadingIcon={() => <Icon source={"card-account-details"} color='white' size={22} />} onPress={() => { closeMenu(); navigation.navigate("Account") }} title="Account" />
        <Menu.Item titleStyle={{ color: 'white' }} leadingIcon={() => <Icon source={"information-outline"} color='white' size={22} />} onPress={() => { closeMenu(); navigation.navigate("AboutUs") }} title="About Us" />
        <Menu.Item titleStyle={{ color: 'white' }} leadingIcon={() => <Icon source={"power"} color='white' size={22} />} onPress={() => { closeMenu(); setShowLogout(true) }} title="Logout" />
      </Menu>
      <ActionDialog show={showLogout} icon={"power"} title='Logout?' desc='Are you sure you want to logout?' onYes={hLogout} onNo={setShowLogout} />
    </View>
  )
}

function MessageHeader() {
  const chatData = useSelector(state => state.activeChat);

  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: -20 }}>
      <Avatar.Image style={{ backgroundColor: '#080f13' }} size={40} source={chatData?.picPath ? { uri: chatData?.picPath } : require('./src/Images/default_avatar.jpg')} />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.white, marginLeft: 10 }}>{chatData?.name || ''}</Text>
    </View>
  )
}

function NotesViewerHeader() {
  const message = useSelector(state => state.activeMessage);
  const userProfile = useQuery(UserProfile);
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: -20, justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.white, marginLeft: 10 }}>Notes Viewer</Text>
      {userProfile[0]?._id == message?.sender && <TouchableHighlight underlayColor={"#ff445a24"} onPress={() => { navigation.navigate("Scanner", { editMode: true }) }} style={{ marginRight: '22%', padding: 7, borderRadius: 100 }}>
        <Icon source={"file-edit"} color="white" size={30} />
      </TouchableHighlight>}
    </View>
  )
}

const headerOptions = {
  headerBackVisible: false,
  headerBackTitleVisible: false,
  headerTitle: (props) => (<AppHeader {...props} />),
  gestureEnabled: false,
  headerStyle: { backgroundColor: '#151a7b' },
  statusBarColor: '#223bc9'
}


function App() {
  const userProfile = useQuery(UserProfile);
  return (
    <NavigationContainer>
      <Loader />
      <ErrorDialog />
      <Stack.Navigator initialRouteName={userProfile[0]?._id ? 'Home' : 'Login'}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={headerOptions} />
        <Stack.Screen name="FindUsers" options={{
          title: "Find Noteschat Users",
          animation: 'slide_from_bottom',
          headerStyle: {
            backgroundColor: '#151a7b',
          },
          headerTintColor: 'white',
          statusBarColor: '#223bc9'
        }} component={FindUsers} />
        <Stack.Screen name="Messages" component={Messages} options={{
          headerTitle: (props) => (<MessageHeader {...props} />),
          headerStyle: { backgroundColor: '#151a7b' },
          statusBarColor: '#223bc9',
          headerTintColor: 'white',
          animation: 'fade_from_bottom'
        }} />
        <Stack.Screen name="Scanner" component={Scanner} options={{ headerShown: false }} />
        <Stack.Screen name="NotesViewer" component={NotesViewer}
          options={{
            animation: 'slide_from_bottom',
            headerStyle: {
              backgroundColor: '#151a7b',
            },
            headerTintColor: 'white',
            statusBarColor: '#223bc9',
            headerTitle: (props) => (<NotesViewerHeader {...props} />)
          }}
        />
        <Stack.Screen name="Account" options={{
          title: "Account",
          animation: 'fade_from_bottom',
          headerStyle: {
            backgroundColor: '#151a7b',
          },
          headerTintColor: 'white',
          statusBarColor: '#223bc9'
        }} component={Account} />
        <Stack.Screen name="AboutUs" options={{
          title: "About Us",
          animation: 'fade_from_bottom',
          headerStyle: {
            backgroundColor: '#151a7b',
          },
          headerTintColor: 'white',
          statusBarColor: '#223bc9'
        }} component={AboutUs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
