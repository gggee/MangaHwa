import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Все поля должны быть заполнены');
      return;
    }

    try {
      const passwHash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
      const resp = await axios.post('http://10.1.0.128:3001/signin', {
        email,
        password_hash: passwHash,
      });

      if (resp.status === 200) {
        const userProfile = resp.data;
        console.log('User profile data:', userProfile);

        if (userProfile.isAdmin) {
          signIn(userProfile);
          Alert.alert('Успешно', 'Вход выполнен как администратор!', [
            { text: 'OK', onPress: () => navigation.navigate('Admin') },
          ]);
        } else {
          signIn(userProfile);
          Alert.alert('Успешно', 'Вход выполнен успешно!', [
            { text: 'OK', onPress: () => navigation.navigate('Profile') },
          ]);
        }
      } else {
        Alert.alert('Ошибка', 'Неверный email или пароль');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      if (err.response && err.response.status === 401) {
        Alert.alert('Ошибка', 'Неверный email или пароль');
      } else {
        Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.header}>Log in</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d7e0',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    margin: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6f6b88',
    alignSelf: 'center',
    marginBottom: 15,
  },
  input: {
    height: 40,
    backgroundColor: '#D1D7E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#564f6f',
    color: '#000',
    fontSize: 16
  },
  button: {
    backgroundColor: '#564f6f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '30%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button2:{
    backgroundColor: '#9590b0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '40%',
    alignSelf: 'center',
  }
});
