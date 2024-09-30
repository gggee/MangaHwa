import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import GenreThemeScreen from './pages/GenreScreen';
import BookmarkScreen from './pages/BookmarkScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}> 
            <Stack.Navigator 
              initialRouteName='Home'
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name='Home' component={HomeScreen} />
              <Stack.Screen name='Profile' component={ProfileScreen} />
              <Stack.Screen name='Search' component={SearchScreen} />
              <Stack.Screen name='Register' component={RegisterScreen} />
              <Stack.Screen name='SignIn' component={SignInScreen} />
              <Stack.Screen name='Manga' component={MangaScreen} />
              <Stack.Screen name='Chapter' component={ChapterScreen} />
              <Stack.Screen name='Page' component={PageScreen} />
              <Stack.Screen name='OnePage' component={OnePageScreen}/>
              <Stack.Screen name='Genres' component={GenreThemeScreen}/>
              <Stack.Screen name='Bookmark' component={BookmarkScreen}/>
            </Stack.Navigator>
            <Menu /> 
          </SafeAreaView>
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
