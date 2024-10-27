import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordWarning, setPasswordWarning] = useState('');
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
      Alert.alert('Error', 'All fields must be filled in');
      return;
    }
    if (!requiremEmail(email)) {
      Alert.alert('Error', 'Email must be in the format @gmail.com');
      return;
    }
    if (!requiremPassw(password)) {
      Alert.alert(
        'Error',
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
      );
      return;
    }

    try {
      const passw_hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
      const resp = await axios.post('http://192.168.0.105:3001/register', {
        username,
        email,
        password_hash: passw_hash,
      });

      if (resp.status === 200) {
        const userProfile = resp.data;
        signIn(userProfile);
        Alert.alert('Success', 'Registration successful!', [
          { text: 'OK', onPress: () => navigation.replace('Profile') },
        ]);
      } else {
        Alert.alert('Error', 'Registration failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to the server');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!requiremPassw(text)) {
      setPasswordWarning(
        'Password must contain at least 8 characters, an uppercase letter, a number, and a special character'
      );
    } else {
      setPasswordWarning('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <Text style={styles.header}>Registration</Text>
        <TextInput
          style={styles.input}
          placeholder="Nick name"
          value={username}
          onChangeText={setName}
        />
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
          onChangeText={handlePasswordChange}
        />
        {passwordWarning ? <Text style={styles.warningText}>{passwordWarning}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d7e0',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6f6b88',
    alignSelf: 'center',
    marginBottom: 10,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    margin: 16,
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
  warningText: {
    color: '#4c495d',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#564f6f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '40%',
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
    width: '30%',
    alignSelf: 'center',
  }
});