import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './pages/HomeScreen';
import ProfileScreen from './pages/ProfileScreen';
import SearchScreen from './pages/SearchScreen';
import Menu from './pages/Menu';
import RegisterScreen from './pages/RegisterScreen';
import SignInScreen from './pages/SignInScreen';
import { AuthProvider } from './context/AuthContext'; 
import MangaScreen from './pages/MangaScreen';
import ChapterScreen from './pages/ChapterScreen';
import PageScreen from './pages/PageScreen';
import OnePageScreen from './pages/OnePageScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//npm install react-native-reanimated react-native-gesture-handler

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Home'>
          <Stack.Screen name='Home' component={HomeScreen} />
          <Stack.Screen name='Profile' component={ProfileScreen} />
          <Stack.Screen name='Search' component={SearchScreen} />
          <Stack.Screen name='Register' component={RegisterScreen} />
          <Stack.Screen name='SignIn' component={SignInScreen} />
          <Stack.Screen name='Manga' component={MangaScreen} />
          <Stack.Screen name='Chapter' component={ChapterScreen} />
          <Stack.Screen name='Page' component={PageScreen} />
          <Stack.Screen name='OnePage' component={OnePageScreen}/>
        </Stack.Navigator>
        <Menu /> 
      </NavigationContainer>
    </AuthProvider>
    </GestureHandlerRootView>
  );
}
