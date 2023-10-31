/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './src/Redux/store';
import { RealmProvider } from '@realm/react';
import { UserProfile } from './src/Models.js/UserProfile';
import { NotesChatRealmContext } from './src/Models.js';


const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6D60',
    secondary: '#F7D060',
    backdrop: '#000420e8'
  },
};

export default function Main() {
  // const { RealmProvider } = useRealmC;
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <RealmProvider {...NotesChatRealmContext}>
          <App />
        </RealmProvider>
      </PaperProvider>
    </StoreProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
