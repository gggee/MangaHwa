import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Button, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper'; 
import { Ionicons } from '@expo/vector-icons';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const description = manga.attributes.description.en;

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

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
      const response = await fetch('http://192.168.0.105:3001/collection', {
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
      const response = await fetch('http://192.168.0.105:3001/add-manga', {
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
        <View style={styles.img_block}>
            {coverUrl && (
              <Image
                source={{ uri: coverUrl }}
                style={styles.background_img}
              />
            )}
            {coverUrl && (
              <Image
                source={{ uri: coverUrl }}
                style={styles.cover_img}
              />
            )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.header}>{manga.attributes.title.en}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Chapter', { manga })}
            >
              <Ionicons name="book-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Chapters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalAddVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Collection</Text>
            </TouchableOpacity>
          </View>
    
          <View style={styles.infoContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
              <View style={styles.infoBlock}>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Status</Text>
                  <Text style={styles.infoText}>{manga.attributes.status || 'Unknown'}</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Author</Text>
                  <Text style={styles.infoText}>{author || 'Unknown'}</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Artist</Text>
                  <Text style={styles.infoText}>{artist || 'Unknown'}</Text>
                </View>
              </View>
            </ScrollView>
          </View>

          <Text style={styles.descrip}>
            {description
              ? (isExpanded ? description : `${description.slice(0, 200)}...`)
              : 'Без описания'}
          </Text>
          <TouchableOpacity onPress={toggleDescription}>
            <Text style={styles.readMore}>
              {isExpanded ? 'Hide' : 'Read more...'}
            </Text>
          </TouchableOpacity>

          <View style={styles.genresContainer}>
            {genres.map((genre, index) => (
              <View key={index} style={styles.genreItem}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}> 
        <Ionicons name="arrow-back-outline" size={24} color="#564f6f" />
      </TouchableOpacity>

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
            <Text style={styles.modalText}>Manga successfully added</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(!modalVisible)}
              >
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
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
            <Text style={styles.modalText}>Select a status for the collection</Text>
            <RadioButton.Group onValueChange={value => setCollectionStatus(value)} value={collectionStatus}>
              <View>
                <View style={styles.radioContainer}>
                  <RadioButton value="Прочитано" />
                  <View style={styles.radioTextContainer}>
                    <Text style={styles.radioText}>Read</Text>
                  </View>
                </View>
                <View style={styles.separator_collection} />

                <View style={styles.radioContainer}>
                  <RadioButton value="Читаю" />
                  <View style={styles.radioTextContainer}>
                    <Text style={styles.radioText}>Reading</Text>
                  </View>
                </View>
                <View style={styles.separator_collection} />

                <View style={styles.radioContainer}>
                  <RadioButton value="В планах" />
                  <View style={styles.radioTextContainer}>
                    <Text style={styles.radioText}>Planned</Text>
                  </View>
                </View>
                <View style={styles.separator_collection} />

                <View style={styles.radioContainer}>
                  <RadioButton value="Брошено" />
                  <View style={styles.radioTextContainer}>
                    <Text style={styles.radioText}>Dropped</Text>
                  </View>
                </View>
                <View style={styles.separator_collection} />

                <View style={styles.radioContainer}>
                  <RadioButton value="Любимое" />
                  <View style={styles.radioTextContainer}>
                    <Text style={styles.radioText}>Favorite</Text>
                  </View>
                </View>
                <View style={styles.separator_collection} />
              </View>
            </RadioButton.Group>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={addToCollection}
              >
              <Text style={styles.modalButtonText_2}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalAddVisible(!modalAddVisible)}
              >
              <Text style={styles.modalButtonText_2}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

async function fetchDetailsAndSend(
  mangaId : any, 
  setAuthor : any, 
  setArtist : any, 
  setGenres : any, 
  setCoverUrl : any, 
  sendMangaToServer : any, 
  manga : any) {
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
    position: 'relative',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#d1d7e0',
  },
  block: {
    flexGrow: 1,
  },
  img_block: {
    alignItems: 'center',
    position: 'relative',  
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center', 
    color: '#4c495d',
  },
  sub_header: {
    fontSize: 18,
    marginVertical: 5,
    color: '#26242e'
  },
  descrip: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    color: '#26242e'
  },
  background_img: {
    width: '100%',
    height: 350,
    opacity: 0.3,
    position: 'absolute',  
    top: 0,                
    left: 0,           
  },
  cover_img: {
    width: '60%',
    height: 300,
    borderRadius: 15,
    marginBottom: 25,
    marginTop: 15,
    alignContent: 'center',
    position: 'relative',  
    zIndex: 1,           
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '75%',
    backgroundColor: '#fff', 
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#222629',
    fontSize: 16,
  },
  textContainer:{
    marginTop: 10,
    padding: 10, 
  },
  infoContainer:{
    alignItems: 'center'
  },
  infoBlock: {
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoItem: {
    marginHorizontal: 10,
    alignItems: 'center', 
    padding: 5,
  },
  label: {
    fontSize: 15, 
  },
  infoText: {
    fontSize: 12, 
    marginTop: 5, 
  },
  separator: {
    width: 1,
    backgroundColor: 'black',
    height: 30, 
    marginHorizontal: 10,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    marginTop: 10,
  },
  genreItem: {
    borderWidth: 1,          
    borderColor: '#9590b0',  
    borderRadius: 15,        
    padding: 8,             
    margin: 5,               
    backgroundColor: '#9590b0', 
  },
  genreText: {
    fontSize: 14, 
    color: '#e6eaf0', 
  },
  readMore: {
    color: '#6f6b88',
    marginBottom: 7,
    textDecorationLine: 'underline', 
  },
  backButton: {
    position: 'absolute',
    top: 7, 
    left: 15, 
    zIndex: 1,
    backgroundColor: 'white', 
    borderRadius: 20,
    padding: 10, 
    elevation: 2, 
  },
  buttonContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 5,
    marginBottom: 5
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6f6b88', 
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5, 
  },
  modalButtonText_2: {
    color: '#6f6b88',
    fontSize: 16,
    margin: 5
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center', 
    borderRadius: 10,
    margin: 5
  },
  closeButton: {
    color: '#6f6b88',
    fontSize: 16
  },  
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    paddingHorizontal: 25,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  radioTextContainer: {
    alignItems: 'center'
  },
  radioText: {
    color: '#4c495d',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  separator_collection: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#9590b0', 
    marginVertical: 5,
  },
});
