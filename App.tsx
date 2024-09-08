import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './pages/HomeScreen';
import ProfileScreen from './pages/ProfileScreen';
import SearchScreen from './pages/SearchScreen';
import Menu from './pages/Menu';
import RegisterScreen from './pages/RegisterScreen';
import SignInScreen from './pages/SignInScreen';
import { AuthProvider } from './context/AuthContext'; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Home'>
          <Stack.Screen name='Home' component={HomeScreen} />
          <Stack.Screen name='Profile' component={ProfileScreen} />
          <Stack.Screen name='Search' component={SearchScreen} />
          <Stack.Screen name='Register' component={RegisterScreen} />
          <Stack.Screen name='SignIn' component={SignInScreen} />
        </Stack.Navigator>
        <Menu /> 
      </NavigationContainer>
    </AuthProvider>
  );
}
