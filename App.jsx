import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
import { ActivityIndicator, Icon, MD2Colors } from 'react-native-paper';

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


const Stack = createNativeStackNavigator();

function AppHeader() {
  const navigation = useNavigation();
  const realm = useRealm()
  const userProfile = useQuery(UserProfile)
  const [showLogout, setShowLogout] = useState(false);

  const hLogout = () => {
    realm.write(() => {
      realm.delete(userProfile)
      navigation.navigate("Login");
    });
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Noteschat</Text>
      <TouchableHighlight underlayColor={"#ff445a24"} onPress={setShowLogout} style={{ marginRight: 40, padding: 7,borderRadius:100 }}>
        <Icon source={"power"} color="#FF445A" size={30} />
      </TouchableHighlight>
      <ActionDialog show={showLogout} icon={"power"} title='Logout?' desc='Are you sure you want to logout?' onYes={hLogout} onNo={setShowLogout} />
    </View>
  )
}


function App() {
  const userProfile = useQuery(UserProfile);
  return (
    <NavigationContainer>
      <Loader />
      <ErrorDialog />
      <Stack.Navigator initialRouteName={userProfile[0]?._id ? 'Home' : 'Login'}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerBackVisible: false, headerBackTitleVisible: false, headerTitle: (props) => (<AppHeader {...props} />), gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
