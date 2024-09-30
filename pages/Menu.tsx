import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context'; 

export default function Menu() {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}> 
      <View style={styles.topMenu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#bfbfbf" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={24} color="#bfbfbf" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Bookmark')}>
          <Ionicons name="bookmark" size={24} color="#bfbfbf" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate(isAuthenticated ? 'Profile' : 'Register')}>
          <Ionicons name="person" size={24} color="#bfbfbf" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#252527', 
  },
  topMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
});
