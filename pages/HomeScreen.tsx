import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Menu from './Menu';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Home</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16, 
    backgroundColor: '#1c1c1c'
  },
  text: {
    fontSize: 24,
    color: 'white'
  },
});
