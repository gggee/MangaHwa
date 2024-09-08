import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { signIn } = useAuth();

  const requiremPassw = (password) => {
    const passw_req = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passw_req.test(password);
  };

  const requiremEmail = (email) => {
    return email.endsWith('@gmail.com');
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Ошибка', 'Все поля должны быть заполнены');
      return;
    }
    if (!requiremEmail(email)) {
      Alert.alert('Ошибка', 'Email должен быть в формате @gmail.com');
      return;
    }
    if (!requiremPassw(password)) {
      Alert.alert(
        'Ошибка',
        'Пароль должен содержать как минимум 8 символов, одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.'
      ); 
      return;
    }

    try {
      const passw_hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
      const resp = await axios.post('http://172.20.10.3:3000/register', {
        username,
        email,
        password_hash: passw_hash,
      });

      if (resp.status === 200) {
        const userProfile = resp.data; 
        signIn(userProfile); 
        Alert.alert('Успешно', 'Пользователь успешно зарегистрирован', [
          { text: 'OK', onPress: () => navigation.navigate('Profile') }
        ]); 
      } else {
        Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
      }
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Имя пользователя"
          value={username}
          onChangeText={setName}
        />
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
        <Button title="Зарегистрироваться" onPress={handleRegister} />
        <Button title="Войти в аккаунт" onPress={() => navigation.navigate('SignIn')} />
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
