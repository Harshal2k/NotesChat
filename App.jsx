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
import Loader from './src/components/common/Loader';
import ErrorDialog from './src/components/common/ErrorDialog';
import { useQuery } from '@realm/react';
import { UserProfile } from './src/Models.js/UserProfile';


const Stack = createNativeStackNavigator();

function AppHeader() {

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: 'red' }}>
      <Text>Hi, Harsha</Text>
    </View>
  )
}


function App() {
  const userProfile = useQuery(UserProfile);
  return (
    <NavigationContainer>
      <Loader />
      <ErrorDialog />
      <Stack.Navigator>
        {!userProfile[0]?._id && <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />}
        <Stack.Screen name="Home" component={Home} options={{ headerBackVisible: false, headerTitle: (props) => (<AppHeader {...props} />), }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
