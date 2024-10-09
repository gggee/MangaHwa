import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen({ route }) {
  const [title, setTitle] = useState('');
  const [manga_list, setMangaList] = useState([]);
  const [coverUrls, setCoverUrls] = useState({});
  const navigation = useNavigation();
  const { selectedGenres, mangaList } = route.params || {};

  useEffect(() => {
    const { mangaList, selectedGenres } = navigation.getState().routes[navigation.getState().index].params || {};
    if (mangaList) {
      setMangaList(mangaList);
    } else if (selectedGenres) {
      fetchMangaByGenres(selectedGenres, setMangaList, setCoverUrls);
    } else {
      fetchRndManga(setMangaList, setCoverUrls);
    }
  }, []);

  const handleSearch = async () => {
    try {
      const manga_res = await searchMangaByTitle(title);
      setMangaList(manga_res);
    
      const cover_promis = manga_res.map(async (manga) => {
        const cover_art = manga.relationships.find((rel: any) => rel.type === 'cover_art');
        if (cover_art) {
          const coverUrl = await fetchCoverArt(cover_art.id);
          return { id: manga.id, url: coverUrl };
        }
        return { id: manga.id, url: '' };
      });

      const cover_url_arr = await Promise.all(cover_promis);
      setCoverUrls(cover_url_arr.reduce((temp, { id, url }) => {
        temp[id] = url;
        return temp;
      }, {} as Record<string, string>));
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  const handleSelectManga = (manga: any) => {
    navigation.navigate('Manga', { manga });
  };

  const renderMangaItem = ({ item }: { item: any }) => {
    const cover_img_url = coverUrls[item.id] || 'https://via.placeholder.com/100x150';
    const mangaTitle = item.attributes?.title?.en || 'Unknown title'; 
    return (
      <TouchableOpacity onPress={() => handleSelectManga(item)} style={styles.manga_block}>
        <Image source={{ uri: cover_img_url }} style={styles.cover_img} />
        <Text style={styles.manga_title} numberOfLines={2} ellipsizeMode="tail">{mangaTitle}</Text> 
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.block}>
        <Text style={styles.header}>Search on MangaDex</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter manga title"
            placeholderTextColor="#d1d7e0"
            value={title}
            onChangeText={setTitle}
          />
          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Genres', { selectedGenres })}>
            <Text style={styles.buttonText}>Genres</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={manga_list}
          keyExtractor={(item) => item.id}
          renderItem={renderMangaItem}
          numColumns={3}
          columnWrapperStyle={styles.row}
        />
      </View>
    </SafeAreaView>
  );
}

async function fetchRndManga(setMangaList, setCoverUrls) {
  try {
    const rnd_resp = await fetch(`https://api.mangadex.org/manga?limit=40&offset=${Math.floor(Math.random() * 1000)}`);
    const data = await rnd_resp.json();

    if (data.data && data.data.length > 0) {
      setMangaList(data.data);

      const cover_promis = data.data.map(async (manga) => {
        const cover_art = manga.relationships.find((rel: any) => rel.type === 'cover_art');
        if (cover_art) {
          const coverUrl = await fetchCoverArt(cover_art.id);
          return { id: manga.id, url: coverUrl };
        }
        return { id: manga.id, url: '' };
      });

      const cover_url_arr = await Promise.all(cover_promis);
      setCoverUrls(cover_url_arr.reduce((temp, { id, url }) => {
        temp[id] = url;
        return temp;
      }, {} as Record<string, string>));
    } else {
      throw new Error('No manga found');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function fetchMangaByGenres(selectedGenres, setMangaList, setCoverUrls) {
  try {
    const resp = await fetch('http://192.168.0.101:3001/search-by-genres', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ genres: selectedGenres }),
    });

    const data = await resp.json();
    if (resp.ok && data.length > 0) {
      setMangaList(data);
      const cover_promis = data.map(async (manga) => {
        const cover_art = manga.relationships.find((rel: any) => rel.type === 'cover_art');
        if (cover_art) {
          const coverUrl = await fetchCoverArt(cover_art.id);
          return { id: manga.id, url: coverUrl };
        }
        return { id: manga.id, url: '' };
      });

      const cover_url_arr = await Promise.all(cover_promis);
      setCoverUrls(cover_url_arr.reduce((temp, { id, url }) => {
        temp[id] = url;
        return temp;
      }, {} as Record<string, string>));
    } else {
      throw new Error('No manga found with the selected genres');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function searchMangaByTitle(title) {
  const resp = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=30`);
  const data = await resp.json();
  if (data.data && data.data.length > 0) {
    return data.data;
  } else {
    throw new Error('Манга не найдена');
  }
}

async function fetchCoverArt(id) {
  const resp = await fetch(`https://api.mangadex.org/cover/${id}`);
  const data = await resp.json();
  if (data.data) {
    const manga_rel_ship = data.data.relationships.find(
      (rel: any) => rel.type === 'manga'
    );
    if (!manga_rel_ship) {
      throw new Error('Манга не найдена');
    }

    const mangaId = manga_rel_ship.id; 
    const { fileName } = data.data.attributes;
    const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
    return coverUrl;
  } else {
    throw new Error('Обложка не найдена');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#d1d7e0', 
  },
  block: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4c495d',
    textAlign: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between', 
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#564f6f',
    borderWidth: 2,
    paddingHorizontal: 8,
    backgroundColor: '#4c495d', 
    color: '#4c495d', 
    borderRadius: 5,
    marginRight: 8,
    fontSize: 16,
  },
  manga_block: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#2d283e', 
    shadowOffset: { width: 2, height: 3 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 3, 
    elevation: 4,
  },
  cover_img: {
    width: 100,
    height: 150,
    marginBottom: 8,
    borderRadius: 8, 
  },
  manga_title: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4c495d',
  },
  row: {
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4c495d',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#564f6f',
    margin: 1
  },
  buttonText: {
    color: '#d1d7e0',
    textAlign: 'center',
    fontSize: 16,
  },
});
