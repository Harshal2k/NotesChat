import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { Avatar, Icon, IconButton, Menu } from 'react-native-paper';

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
import { useDispatch, useSelector } from 'react-redux';
import NotesViewer from './src/components/NotesViewer';
import Account from './src/components/Account';
import AboutUs from './src/components/AboutUs';
import io from 'socket.io-client';
import PushController from './src/components/NotificationController';
import usePushNotification from './src/Hooks/usePushNotification';
import NotificationController from './src/components/NotificationController';
import { Api1 } from './src/API';
import { showError } from './src/Redux/Actions';
const ENDPOINT = "https://noteschat-backend-service.onrender.com"
const RNFS = require('react-native-fs');
const profileDir = `file://${RNFS.ExternalDirectoryPath}/Profiles`


const Stack = createNativeStackNavigator();

let activeChatCopy = {};

function AppHeader() {
  const navigation = useNavigation();
  const realm = useRealm()
  const dispatch = useDispatch();
  const userProfile = useQuery(UserProfile);
  const chatsModel = useQuery(ChatsModel);
  const userModel = useQuery(UserModel);
  const messageModel = useQuery(MessageModel);
  const [showLogout, setShowLogout] = useState(false);
  const [visible, setVisible] = useState(false);
  const [inprogress, setInProgress] = useState(false);
  const activeChat = useSelector(state => state.activeChat);

  useEffect(() => {
    activeChatCopy = JSON.parse(JSON.stringify(activeChat));
  }, [activeChat])

  const hUpdateChat = (data) => {
    const storedMsgs = realm
      .objects('Message')
      .filtered('chat = $0', data?.chat?._id)
    const chatRealmData = realm
      .objects('ChatsModel')
      .filtered('chatId = $0', data?.chat?._id)

    const chat = data?.chat;

    let usersCopy = JSON.parse(JSON.stringify(chat?.users));
    let chatUser = usersCopy?.find(user => user?._id !== userProfile[0]?._id);
    let pages = data?.pages?.map(page => {
      return {
        picUrl: page,
        picPath: '',
        picName: page?.split("/")?.pop() || ''
      }
    })

    const newMsgData = {
      _id: chat?.latestMessage,
      sender: data?.sender?._id,
      subject: data?.subject,
      pages: pages || [],
      chat: chat?._id,
      updateMessage: !!data?.updateMessage,
      updatedMsgId: data?.updatedMsgId,
      updateMessageContent: data?.updateMessageContent,
      createdat: data?.createdAt,
      updatedat: data?.updatedAt,
    }
    let pendingMessages = "0"
    if (activeChatCopy?.chatId == chat?._id) {
      pendingMessages = "0"
    } else {
      pendingMessages = Number(chatRealmData[0]?.pendingMessages) + 1;
    }
    realm.write(() => {
      realm.create('ChatsModel',
        {
          chatId: chat?._id,
          isGroupChat: chat?.isGroupChat,
          groupName: chat?.name,
          chatUser: chatUser,
          groupAdmin: chat?.groupAdmin,
          usersList: usersCopy || [],
          createdAt: chat?.createdAt,
          updatedAt: chat?.updatedAt,
          latestMessage: newMsgData || null,
          messageCount: chat?.messageCount || "0",
          pendingMessages: String(pendingMessages)
        }
        , true)

    })
  }

  const hUpdateMessage = (data) => {
    const chatRealmData = realm
      .objects('ChatsModel')
      .filtered('chatId = $0', data?.chat?._id)

    const updatedMessage = realm
      .objects('Message')
      .filtered('_id = $0', data?.message?._id)

    const chat = data?.chat;
    let usersCopy = JSON.parse(JSON.stringify(chat?.users));
    let chatUser = usersCopy?.find(user => user?._id !== userProfile[0]?._id);
    let oldPages = updatedMessage[0]?.pages || [];

    let updatedPages = data?.message?.pages?.map(page => {
      let exists = oldPages?.find(pg => pg.picUrl == page);
      if (exists) {
        return exists;
      }
      return {
        picUrl: page,
        picPath: '',
        picName: page?.split("/")?.pop() || ''
      }
    })

    const oldMessage = {
      _id: data?.message?._id,
      sender: data?.message?.sender,
      subject: data?.message?.subject,
      pages: updatedPages,
      chat: data?.message?.chat,
      updateMessage: !!data?.message?.updateMessage,
      updatedMsgId: data?.message?.updatedMsgId,
      updateMessageContent: data?.message?.updateMessageContent,
      createdat: data?.message?.createdAt,
      updatedat: data?.message?.updatedAt,
    }

    const newMsgData = {
      _id: data?.newMessage?._id,
      sender: data?.newMessage?.sender,
      subject: data?.newMessage?.subject,
      pages: updatedPages,
      chat: data?.newMessage?.chat,
      updateMessage: !!data?.newMessage?.updateMessage,
      updatedMsgId: data?.newMessage?.updatedMsgId,
      updateMessageContent: data?.newMessage?.updateMessageContent,
      createdat: data?.newMessage?.createdAt,
      updatedat: data?.newMessage?.updatedAt,
    }


    let pendingMessages = "0"
    if (activeChatCopy?.chatId == chat?._id) {
      pendingMessages = "0"
    } else {
      pendingMessages = Number(chatRealmData[0]?.pendingMessages) + 1;
    }

    realm.write(() => {
      realm.create('Message', oldMessage, true);
      realm.create('ChatsModel',
        {
          chatId: chat?._id,
          isGroupChat: chat?.isGroupChat,
          groupName: chat?.name,
          chatUser: chatUser,
          groupAdmin: chat?.groupAdmin,
          usersList: usersCopy || [],
          createdAt: chat?.createdAt,
          updatedAt: chat?.updatedAt,
          latestMessage: newMsgData || null,
          messageCount: chat?.messageCount || "0",
          pendingMessages: String(pendingMessages)
        }
        , true)

    })
  }

  const hCreateChat = async (data) => {
    await RNFS.mkdir(`${RNFS.ExternalDirectoryPath}/Profiles`);
    let chat = data?.chat[0];
    let usersCopy = JSON.parse(JSON.stringify(chat?.users));
    usersCopy = await Promise.all(usersCopy?.map(async (data) => {
      let fileExists = await RNFS.exists(`${profileDir}/${data?.picName}`);
      if (fileExists) {
        return {
          ...data,
          picPath: `${profileDir}/${data?.picName}`
        };
      }
      let filePath = ''
      await RNFS.downloadFile({
        fromUrl: data?.pic,
        toFile: `${profileDir}/${data?.picName}`
      }).promise.then((res) => {
        filePath = `${profileDir}/${data?.picName}`
      }).catch((error) => { })
      return {
        ...data,
        picPath: filePath
      }
    }));
    let chatUser = usersCopy?.find(user => user?._id !== userProfile[0]?._id);
    const chatRealmData = realm
      .objects('ChatsModel')
      .filtered('chatId = $0', chat?._id)
    realm.write(async () => {
      realm.create('ChatsModel',
        {
          chatId: chat?._id,
          isGroupChat: chat?.isGroupChat,
          groupName: chat?.name,
          chatUser: chatUser,
          groupAdmin: chat?.groupAdmin,
          usersList: usersCopy || [],
          createdAt: chat?.createdAt,
          updatedAt: chat?.updatedAt,
          latestMessage: null,
          messageCount: "0",
          pendingMessages: "0"
        }
        , true)
    })
  }

  useEffect(() => {
    const socket = io(ENDPOINT);

    const handleReconnect = () => {
      socket.emit("setup", userProfile[0]);
    };

    socket.emit("setup", userProfile[0]);

    socket.on("updatedChat", hUpdateChat);

    socket.on("updatedMessage", hUpdateMessage);

    socket.on("createChat", hCreateChat);

    socket.on("connect", () => { handleReconnect() });

    return () => {
      socket.off("updatedChat", hUpdateChat);
      socket.off("updatedMessage", hUpdateMessage);
      socket.off("createChat", hCreateChat);
      socket.off("connect", handleReconnect);
      socket.disconnect();
    };
  }, [])

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const hLogout = () => {
    setInProgress(true);
    Api1.post('/api/user/updateFCM', { userId: userProfile[0]?._id, fcm: '' })
      .then((data) => {
        AsyncStorage.setItem('token', '').catch((err) => { })
        realm.write(() => {
          realm.delete(userProfile);
          realm.delete(chatsModel);
          realm.delete(userModel);
          realm.delete(messageModel);
          navigation.navigate("Login");
        });
      }).catch((error) => {
        setShowLogout(false)
        dispatch(showError("Unable to logout. Please try again"));
      }).finally(() => { setInProgress(false) })

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
      <ActionDialog inprogress={inprogress} show={showLogout} icon={"power"} title='Logout?' desc='Are you sure you want to logout?' onYes={hLogout} onNo={setShowLogout} />
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

// const headerOptions = {
//   headerBackVisible: false,
//   headerBackTitleVisible: false,
//   headerTitle: (props) => (<AppHeader {...props} />),
//   gestureEnabled: false,
//   headerStyle: { backgroundColor: '#151a7b' },
//   statusBarColor: '#223bc9'
// }


function App() {
  const userProfile = useQuery(UserProfile);
  const [fcm, setfcm] = useState('');

  useEffect(() => {
    if (userProfile[0]?._id && fcm?.length > 0) {
      Api1.post('/api/user/updateFCM', { userId: userProfile[0]?._id, fcm: fcm })
        .then((data) => {
        }).catch((error) => { console.log({ error }) })
    }
  }, [fcm, userProfile[0]?._id]);

  const {
    requestUserPermission,
    getFCMToken,
    listenToBackgroundNotifications,
    listenToForegroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
  } = usePushNotification();

  useEffect(() => {
    const listenToNotifications = async () => {
      try {
        const newFcm = await getFCMToken();
        setfcm(newFcm);
        requestUserPermission();
        onNotificationOpenedAppFromQuit();
        listenToBackgroundNotifications();
        listenToForegroundNotifications();
        onNotificationOpenedAppFromBackground();
      } catch (error) {
        console.log(error);
      }
    };

    listenToNotifications();
  }, []);

  return (
    <NavigationContainer>
      <Loader />
      <ErrorDialog />
      <NotificationController />
      <Stack.Navigator initialRouteName={userProfile[0]?._id ? 'Home' : 'Login'}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerTitle: (props) => (<AppHeader {...props} />),
          gestureEnabled: false,
          headerStyle: { backgroundColor: '#151a7b' },
          statusBarColor: '#223bc9'
        }} />
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
          animation: 'none'
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
