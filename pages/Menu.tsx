import React from 'react'; 
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; 

export default function Menu() {
  const navigation = useNavigation();
  const { isAuthenticated, userProfile } = useAuth(); 
  const isAdmin = userProfile?.isAdmin;

  return (
    <View style={styles.topMenu}>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home-outline" size={24} color="#564f6f" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Search')}>
        <Ionicons name="search-outline" size={24} color="#564f6f" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Bookmark')}>
        <Ionicons name="bookmark-outline" size={24} color="#564f6f" />
      </TouchableOpacity>

      {!isAuthenticated ? (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Register')}>
          <Ionicons name="person-add-outline" size={24} color="#564f6f" />
        </TouchableOpacity>
      ) : (
        <>
          {!isAdmin && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-outline" size={24} color="#564f6f" />
            </TouchableOpacity>
          )}
          {isAdmin && (  
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Admin')}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#564f6f" /> 
            </TouchableOpacity>
          )}
        </>
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
