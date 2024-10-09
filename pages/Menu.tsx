import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; 

export default function Menu() {
  const navigation = useNavigation();
  const { isAuthenticated, userProfile } = useAuth(); 

  return (
    <View style={styles.topMenu}>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home" size={24} color="#564f6f" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Search')}>
        <Ionicons name="search" size={24} color="#564f6f" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Bookmark')}>
        <Ionicons name="bookmark" size={24} color="#564f6f" />
      </TouchableOpacity>

      {!isAuthenticated || (isAuthenticated && userProfile?.userData?.email !== 'admin@gmail.com') ? (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate(isAuthenticated ? 'Profile' : 'Register')}>
          <Ionicons name={isAuthenticated ? "person" : "person-add"} size={24} color="#564f6f" />
        </TouchableOpacity>
      ) : null}

      {isAuthenticated && userProfile?.userData?.email === 'admin@gmail.com' && (
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Admin')}>
          <Ionicons name="shield" size={24} color="#564f6f" /> 
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
