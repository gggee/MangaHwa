import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext'; 
import { Ionicons } from '@expo/vector-icons';
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
  const categories = ['read', 'reading', 'dropped', 'planned', 'favorites'];
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

  const renderMangaList = (mangaList: any) => {
    if (mangaList.length === 0) {
      return <Text style={styles.emptyMsg}>Empty</Text>;
    }
  
    return (
      <ScrollView style={styles.mangaList}>
        <View style={styles.mangaGrid}>
          {mangaList.map((manga) => (
            <View key={manga.id} style={styles.mangaCard}>
              <Image
                source={{ uri: manga.cover_image_url }}
                style={styles.mangaImg}
                resizeMode="cover"
              />
              <Text style={styles.mangaTitle}>
                {manga.title.length > 20 ? `${manga.title.substring(0, 20)}...` : manga.title}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.block}>
        {userProfile ? (
          <>
            <View style={styles.profileContainer}>
              <Ionicons name="person-outline" size={52} color="#564f6f" />
              <View style={styles.userInfoContainer}>
                <Text style={styles.usernameText}>{userProfile.username}</Text>
                <Text style={styles.emailText}>{userProfile.email}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={28} color="#564f6f" /> 
              </TouchableOpacity>
            </View>
            <Text style={styles.collectionText}>Collection</Text>
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
    const resp = await fetch(`http://192.168.0.105:3001/user-collection/${userId}`);
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
    return 'https://via.placeholder.com/100x150/FFFFFF/000000'; 
  } catch (error) {
    return 'https://via.placeholder.com/100x150/FFFFFF/000000'; 
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d7e0'
  },
  block: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  scene: {
    flex: 1,
  },
  categoryScroll: {
    flexDirection: 'row',
    paddingVertical: 5,
    overflow: 'hidden',
    maxHeight: 55,
  },
  categoryBtn: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#9590b0',
    borderRadius: 8,
    marginBottom: 5
  },
  selectedCategory: {
    backgroundColor: '#4c495d',
    color: '#fff'
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff'
  },
  mangaList: {
    marginTop: 10,
  },
  mangaGrid: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
  },
  mangaCard: {
    marginRight: 10,
    padding: 5,
    height: 200,
    width: '30%',
    alignItems: 'center'
  },
  mangaImg: {
    width: 100,
    height: 150,
    borderRadius: 5,
    borderColor: '#564f6f',
    borderWidth: 1
  },  
  mangaTitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4c495d',
    width: 100,
    textAlign: 'center',
  },
  mangaRow: {
    flexDirection: 'row',
  },
  emptyMsg: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888', 
    marginTop: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, 
  },
  usernameText: { 
    color: '#4c495d',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  logoutBtn: {
    marginLeft: 'auto', 
    padding: 8,
  },
  userInfoContainer: {
    marginLeft: 8, 
    justifyContent: 'center', 
  },
  emailText: {
    fontSize: 16, 
    color: '#4c495d', 
  },
  collectionText: {
    fontSize: 16, 
    color: '#4c495d',
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'center',
    fontWeight: '500'
  },
});