import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen () {
  const { signOut, userProfile } = useAuth(); 
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('read');
  const [mangaData, setMangaData] = useState({
    read: [],
    reading: [],
    dropped: [],
    planned: [],
    favorites: [],
  });

  const statusMapping = {
    'прочитано': 'read',
    'в процессе': 'reading',
    'брошено': 'dropped',
    'в планах': 'planned',
    'избранное': 'favorites',
  };

  useEffect(() => {
    if (!userProfile) {
      navigation.navigate('SignIn'); 
    } else {
      fetchMangaCollections(userProfile.id); 
    }
  }, [userProfile, navigation]);

  const fetchMangaCollections = async (userId) => {
    try {
      const resp = await fetch(`http://192.168.0.105:3001/user-collection/${userId}`);
      if (!resp.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await resp.json();

      const categorizedManga = {
        read: [],
        reading: [],
        dropped: [],
        planned: [],
        favorites: [],
      };

      data.forEach(manga => {
        const status_key = statusMapping[manga.status.toLowerCase()];
        if (status_key) {
          categorizedManga[status_key].push(manga);
        } else {
          console.warn(`Invalid manga status: ${manga.status}`);
        }
      });

      setMangaData(categorizedManga); 
    } catch (error) {
      console.error('Error fetching manga collections:', error);
    }
  };

  const handleLogout = () => {
    signOut(); 
    navigation.navigate('SignIn'); 
  };

  const renderMangaList = (mangaList) => {
    return (
      <ScrollView horizontal style={styles.mangaList}>
        {mangaList.map((manga) => (
          <View key={manga.id} style={styles.mangaCard}>
            <Text>{manga.title}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const categories = ['read', 'reading', 'dropped', 'planned', 'favorites'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.block}>
        {userProfile ? (
          <>
            <Text>Профиль пользователя: {userProfile.username}</Text>
            <Button title="Выйти" onPress={handleLogout} />
            <ScrollView horizontal style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryBtn, selectedCategory === category && styles.selectedCategory]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.scene}>
              {renderMangaList(mangaData[selectedCategory])}
            </View>
          </>
        ) : (
          <Text>Загрузка...</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  block: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  scene: {
    flex: 1,
    padding: 10,
  },
  categoryScroll: {
    flexDirection: 'row',
    paddingVertical: 5,
    overflow: 'hidden',
    maxHeight: 80,
  },
  categoryBtn: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectedCategory: {
    backgroundColor: '#d0d0d0',
  },
  categoryText: {
    fontWeight: 'bold',
  },
  mangaList: {
    marginTop: 10,
  },
  mangaCard: {
    width: 100,
    height: 150,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

