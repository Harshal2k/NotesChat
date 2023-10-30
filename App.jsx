import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';

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
import { NotesChatRealmContext } from './src/Models.js';
import Loader from './src/components/common/Loader';
import ErrorDialog from './src/components/common/ErrorDialog';


const Stack = createNativeStackNavigator();


function App() {
  const { RealmProvider } = NotesChatRealmContext;
  return (
    <NavigationContainer>
      <RealmProvider>
        <Loader />
        <ErrorDialog />
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        </Stack.Navigator>
      </RealmProvider>
    </NavigationContainer>
  );
}

export default App;
