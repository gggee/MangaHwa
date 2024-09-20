import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, SafeAreaView } from 'react-native';
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
      const resp = await axios.post('http://192.168.0.105:3000/signin', {
        email,
        password_hash: passwHash,
      });

      if (resp.status === 200) {
        const userProfile = resp.data; 
        signIn(userProfile); 
        Alert.alert('Успешно', 'Вход выполнен успешно', [
          { text: 'OK', onPress: () => navigation.navigate('Profile') }
        ]);
      } else {
        Alert.alert('Ошибка', 'Неверный email или пароль');
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Электронная почта"
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Войти" onPress={handleSignIn} />
        <Button title="Зарегистрироваться" onPress={() => navigation.navigate('Register')}/>
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});