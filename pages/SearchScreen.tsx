import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const availableGenres = [
  'Romance', 'Drama', 'Fantasy', 'Action', 'Comedy',
  'Adventure', 'Horror', 'Mystery', 'Survival', 'Slice of Life', 'Magic', 'Thriller'
];

export default function SearchScreen({ route }) {
  const [title, setTitle] = useState('');
  const [manga_list, setMangaList] = useState([]);
  const [coverUrls, setCoverUrls] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const { mangaList } = route.params || {};
    if (mangaList) {
      setMangaList(mangaList);
    } else {
      fetchRndManga(setMangaList, setCoverUrls);
    }
  }, []);

  const handleSearch = async () => {
    try {
      const manga_res = await searchMangaByTitle(title);
      setMangaList(manga_res);

      const cover_promises = manga_res.map(async (manga : any) => {
        const cover_art = manga.relationships.find((rel) => rel.type === 'cover_art');
        if (cover_art) {
          const coverUrl = await fetchCoverArt(cover_art.id);
          return { id: manga.id, url: coverUrl };
        }
        return { id: manga.id, url: '' };
      });

      const cover_url_arr = await Promise.all(cover_promises);
      setCoverUrls(cover_url_arr.reduce((temp, { id, url }) => {
        temp[id] = url;
        return temp;
      }, {}));
    } catch (err) {
      console.error('Error:', err.message);
    }
  };

  const handleSelectManga = (manga  : any) => {
    navigation.navigate('Manga', { manga });
  };

  const renderMangaItem = ({ item }) => {
    const cover_img_url = coverUrls[item.id] || 'https://via.placeholder.com/100x150/FFFFFF/000000';
    const mangaTitle = item.attributes?.title?.en || 'Unknown title'; 
    return (
      <TouchableOpacity onPress={() => handleSelectManga(item)} style={styles.manga_block}>
        <Image source={{ uri: cover_img_url }} style={styles.cover_img} />
        <Text style={styles.manga_title} numberOfLines={2} ellipsizeMode="tail">{mangaTitle}</Text> 
      </TouchableOpacity>
    );
  };

  const toggleGenre = (genre  : any) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const applyFilters = () => {
    setModalVisible(false);
    fetchMangaByGenres(selectedGenres, setMangaList, setCoverUrls);
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
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Ionicons name="options-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
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

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Genres</Text>
              <View style={styles.genreList}>
                {availableGenres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    onPress={() => toggleGenre(genre)}
                    style={[
                      styles.genreItem,
                      selectedGenres.includes(genre) && styles.selectedGenreItem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genreText,
                        selectedGenres.includes(genre) && styles.selectedGenreText,
                      ]}
                    >
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const fetchCoverArt = async (id : any) => {
  const resp = await fetch(`https://api.mangadex.org/cover/${id}`);
  const data = await resp.json();
  if (data.data) {
    const manga_rel_ship = data.data.relationships.find(
      (rel) => rel.type === 'manga'
    );
    if (!manga_rel_ship) {
      throw new Error('Manga not found');
    }

    const mangaId = manga_rel_ship.id; 
    const { fileName } = data.data.attributes;
    const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
    return coverUrl;
  } else {
    throw new Error('Cover not found');
  }
};

const searchMangaByTitle = async (title  : any) => {
  const resp = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=30`);
  const data = await resp.json();
  if (data.data && data.data.length > 0) {
    return data.data;
  } else {
    throw new Error('Мanga not found');
  }
};

const fetchRndManga = async (setMangaList : any, setCoverUrls : any) => {
  try {
    const rnd_resp = await fetch(`https://api.mangadex.org/manga?limit=60&offset=${Math.floor(Math.random() * 1000)}`);
    const data = await rnd_resp.json();

    if (data.data && data.data.length > 0) {
      setMangaList(data.data);

      const cover_promis = data.data.map(async (manga : any) => {
        const cover_art = manga.relationships.find((rel) => rel.type === 'cover_art');
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
      }, {}));
    } else {
      throw new Error('No manga found');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
};

const fetchMangaByGenres = async (selectedGenres : any, setMangaList : any, setCoverUrls : any) => {
  try {
    const rnd_resp = await fetch(`https://api.mangadex.org/manga?limit=100&offset=${Math.floor(Math.random() * 1000)}`);
    const data = await rnd_resp.json();

    if (data.data && data.data.length > 0) {
      const filteredMangas = data.data.filter(manga => {
        const genres = manga.attributes.tags.map(tag => tag.attributes.name.en);
        return selectedGenres.some(genre => genres.includes(genre));
      });

      setMangaList(filteredMangas);

      const cover_promises = filteredMangas.map(async (manga : any) => {
        const cover_art = manga.relationships.find((rel) => rel.type === 'cover_art');
        if (cover_art) {
          const coverUrl = await fetchCoverArt(cover_art.id);
          return { id: manga.id, url: coverUrl };
        }
        return { id: manga.id, url: '' };
      });

      const cover_url_arr = await Promise.all(cover_promises);
      setCoverUrls(
        cover_url_arr.reduce((temp, { id, url }) => {
          temp[id] = url;
          return temp;
        }, {})
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#564f6f',
    borderWidth: 2,
    paddingHorizontal: 8,
    backgroundColor: '#4c495d', 
    color: '#d1d7e0', 
    borderRadius: 8,
    marginRight: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6f6b88',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6f6b88',
    margin: 1
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  manga_block: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  cover_img: {
    width: 100,
    height: 150,
    marginBottom: 8,
    borderRadius: 5,
    borderColor: '#564f6f',
    borderWidth: 1
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4c495d',
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  genreItem: {
    width: '40%',
    borderWidth: 1,
    borderColor: '#9590b0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 5,
    backgroundColor: '#9590b0',
    alignItems: 'center',
  },
  genreText: {
    color: '#fff',
    textAlign: 'center',
  },
  selectedGenre: {
    fontWeight: 'bold',
    color: '#86C232',
  },
  applyButton: {
    backgroundColor: '#6f6b88',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
    width: '50%',
  },
  selectedGenreItem: {
    backgroundColor: '#4c495d',
    borderColor: '#4c495d',
  },
});