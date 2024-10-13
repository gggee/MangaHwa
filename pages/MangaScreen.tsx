import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Button, ScrollView, Alert, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper'; 
import { useAuth } from '../context/AuthContext';

export default function MangaScreen() {
  const route = useRoute();
  const { manga } = route.params;
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const [author, setAuthor] = useState(null);
  const [artist, setArtist] = useState(null);
  const [genres, setGenres] = useState([]);
  const [coverUrl, setCoverUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); 
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [collectionStatus, setCollectionStatus] = useState('Прочитано'); 

  useEffect(() => {
    const fetchDetails = async () => {
      await fetchDetailsAndSend(manga.id, setAuthor, setArtist, setGenres, setCoverUrl, sendMangaToServer, manga);
    };
    fetchDetails();
  }, [manga.id]);

  const addToCollection = async () => {
    if (!userProfile || !userProfile.id) {
      Alert.alert('Error', 'Failed to add manga to collection. Please log in.');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.103:3001/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userProfile.id,
          manga_id: manga.id,
          status: collectionStatus, 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add manga to collection');
      }

      setModalAddVisible(false); 
      setModalVisible(true); 
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const sendMangaToServer = async (mangaData : any) => {
    try {
      const response = await fetch('http://192.168.0.103:3001/add-manga', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mangaData),
      });

      if (!response.ok) {
        throw new Error('Не удалось добавить мангу на сервер');
      }
      console.log('Манга успешно добавлена на сервер');
    } catch (error) {
      console.error('Ошибка:', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.block}>
        <Text style={styles.header}>{manga.attributes.title.en}</Text>
        {coverUrl && (
          <Image
            source={{ uri: coverUrl }}
            style={styles.cover_img}
          />
        )}
        <Text style={styles.sub_header}>Genres: {genres.join(', ')}</Text>
        <Text style={styles.sub_header}>Status: {manga.attributes.status || 'Unknown'}</Text>
        <Text style={styles.sub_header}>Chapters: {manga.attributes.chapter_count}</Text>
        <Text style={styles.descrip}>{manga.attributes.description.en}</Text>
        <Text style={styles.sub_header}>Author: {author || 'Unknown'}</Text>
        <Text style={styles.sub_header}>Artist: {artist || 'Unknown'}</Text>
        <Button title="View chapters" onPress={() => navigation.navigate('Chapter', { manga })} />
        <Button title="Add to Collection" onPress={() => setModalAddVisible(true)} />
        <Button title="Back to search" onPress={() => navigation.goBack()} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Manga successfully added to collection!</Text>
            <Button
              title="Close"
              onPress={() => setModalVisible(!modalVisible)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAddVisible}
        onRequestClose={() => {
          setModalAddVisible(!modalAddVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Выберите статус для добавления в коллекцию</Text>
            <RadioButton.Group onValueChange={value => setCollectionStatus(value)} value={collectionStatus}>
              <View style={styles.radioContainer}>
                <RadioButton value="Прочитано" />
                <Text>Прочитано</Text>
              </View>
              <View style={styles.radioContainer}>
                <RadioButton value="Читаю" />
                <Text>Читаю</Text>
              </View>
              <View style={styles.radioContainer}>
                <RadioButton value="В планах" />
                <Text>В планах</Text>
              </View>
              <View style={styles.radioContainer}>
                <RadioButton value="Брошено" />
                <Text>Брошено</Text>
              </View>
              <View style={styles.radioContainer}>
                <RadioButton value="Любимое" />
                <Text>Любимое</Text>
              </View>
            </RadioButton.Group>
            <Button title="Add to collection" onPress={addToCollection} />
            <Button title="Cancel" onPress={() => setModalAddVisible(!modalAddVisible)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

async function fetchDetailsAndSend(mangaId, setAuthor, setArtist, setGenres, setCoverUrl, sendMangaToServer, manga) {
  try {
    const { author, artist, genres, coverUrl, status } = await getMangaDetails(mangaId);
    setAuthor(author);
    setArtist(artist);
    setGenres(genres);
    setCoverUrl(coverUrl);

    sendMangaToServer({
      id: manga.id,
      title: manga.attributes.title.en,
      description: manga.attributes.description.en,
      author: author || 'Unknown',
      artist: artist || 'Unknown',
      genres: genres,
      status: status || 'Unknown',
      cover_image_url: coverUrl || '',
    });
  } catch (err) {
    console.error('Ошибка:', err.message);
  }
}

async function getMangaDetails(mangaId : any) {
  const resp = await fetch(`https://api.mangadex.org/manga/${mangaId}`);
  const data = await resp.json();

  if (data.data && data.data.relationships) {
    const relationships = data.data.relationships;
    const author_rel_ship = relationships.find((rel) => rel.type === 'author');
    const artist_rel_ship = relationships.find((rel) => rel.type === 'artist');
    const cover_art_rel_ship = relationships.find((rel) => rel.type === 'cover_art');

    const author = author_rel_ship ? await fetchAuthorOrArtist(author_rel_ship.id) : null;
    const artist = artist_rel_ship ? await fetchAuthorOrArtist(artist_rel_ship.id) : null;
    const genres = data.data.attributes.tags.map((tag) => tag.attributes.name.en);
    const coverUrl = cover_art_rel_ship ? await fetchCoverArt(cover_art_rel_ship.id) : null;
    const status = data.data.attributes.status || 'Unknown';
    return { author, artist, genres, coverUrl, status };
  } else {
    throw new Error('Данные не найдены');
  }
}

async function fetchAuthorOrArtist(id : any) {
  const resp = await fetch(`https://api.mangadex.org/author/${id}`);
  const data = await resp.json();
  if (data.data) {
    return data.data.attributes.name;
  } else {
    throw new Error('Данные не найдены');
  }
}

async function fetchCoverArt(id : any) {
  const resp = await fetch(`https://api.mangadex.org/cover/${id}`);
  const data = await resp.json();
  if (data.data) {
    const manga_rel_ship = data.data.relationships.find(
      (rel) => rel.type === 'manga'
    );
    if (!manga_rel_ship) {
      throw new Error('Манга не найдена в списках обложек');
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
  },
  block: {
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sub_header: {
    fontSize: 18,
    marginVertical: 5,
  },
  descrip: {
    fontSize: 16,
    marginBottom: 20,
  },
  cover_img: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
});
