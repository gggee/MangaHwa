import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { signOut, userProfile } = useAuth(); 
  const navigation = useNavigation();

  const handleLogout = () => {
    signOut(); 
    navigation.navigate('SignIn'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text>Профиль пользователя</Text>
        <Button title="Выйти" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});