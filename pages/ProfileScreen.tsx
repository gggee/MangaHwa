import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
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
    'читаю': 'reading',
    'брошено': 'dropped',
    'в планах': 'planned',
    'любимое': 'favorites',
  };

  useEffect(() => {
    if (!userProfile) { navigation.navigate('SignIn'); } 
    else { fetchMangaCollections(userProfile.id, setMangaData, statusMapping); }
  }, [userProfile, navigation]);

  const handleLogout = () => {
    signOut(); 
    navigation.navigate('SignIn'); 
  };

  const renderMangaList = (mangaList) => {
    if (mangaList.length === 0) { return <Text style={styles.emptyMsg}>Empty</Text>; }
    return (
      <ScrollView horizontal style={styles.mangaList}>
        {mangaList.map((manga) => (
          <View key={manga.id} style={styles.mangaCard}>
            <Image
              source={{ uri: manga.cover_image_url }}
              style={styles.mangaImg}
              resizeMode="cover"
            />
            <Text style={styles.mangaTitle}>{manga.title}</Text>
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
            <Text>User profile: {userProfile.username}</Text>
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
          <Text>Load...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const fetchMangaCollections = async (userId, setMangaData, statusMapping) => {
  try {
    const resp = await fetch(`http://192.168.0.103:3001/user-collection/${userId}`);
    const data = await resp.json();
    const categorizedManga = {
      read: [],
      reading: [],
      dropped: [],
      planned: [],
      favorites: [],
    };

    await Promise.all(data.map(async (manga) => {
      const coverUrl = await fetchCoverArt(manga.id);
      const status_key = statusMapping[manga.status.toLowerCase()];
      if (status_key) {
        categorizedManga[status_key].push({
          id: manga.id,
          title: manga.title,
          cover_image_url: coverUrl
        });
      } else {
        console.warn(`Invalid manga status: ${manga.status}`);
      }
    }));
    setMangaData(categorizedManga); 
  } catch (error) {
    console.error('Error fetching manga collections:', error);
  }
};

const fetchCoverArt = async (mangaId) => {
  try {
    const resp = await fetch(`https://api.mangadex.org/manga/${mangaId}`);
    const data = await resp.json();
    if (data.data && data.data.relationships) {
      const cover_rel_ship = data.data.relationships.find(rel => rel.type === 'cover_art');
      if (cover_rel_ship) {
        const { id } = cover_rel_ship;
        const cover_resp = await fetch(`https://api.mangadex.org/cover/${id}`);
        const cover_data = await cover_resp.json();
        const filename = cover_data.data.attributes.fileName;
        return `https://uploads.mangadex.org/covers/${mangaId}/${filename}.256.jpg`;
      }
    }
    return 'https://via.placeholder.com/100x150'; 
  } catch (error) {
    return 'https://via.placeholder.com/100x150'; 
  }
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
    width: 120,
    height: 200,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 5,
  },
  mangaImg: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },  
  mangaTitle: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyMsg: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888', 
    marginTop: 20,
  },
});