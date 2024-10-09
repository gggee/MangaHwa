import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [rndMangaList, setRandomMangaList] = useState([]);
  const [romanceMangaList, setRomanceMangaList] = useState([]);
  const [actionAdventureMangaList, setActionAdventureMangaList] = useState([]);
  const [coverUrls, setCoverUrls] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    fetchRndManga(setRandomMangaList, setCoverUrls);
    fetchRndRomanceManga(setRomanceMangaList, setCoverUrls);
    fetchActionAdventureManga(setActionAdventureMangaList, setCoverUrls);
  }, []);

  const handleMangaPress = (manga) => {
    navigation.navigate('Manga', { manga });
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <View style={styles.mangaBlock}>
          <Text style={styles.sectionTitle}>Many people read</Text>
          <ScrollView horizontal style={styles.mangaScroll}>
            {rndMangaList.map((manga) => (
              <TouchableOpacity
                key={manga.id}
                style={styles.mangaItem}
                onPress={() => handleMangaPress(manga)}
              >
                <Image
                  source={{ uri: coverUrls[manga.id] || 'https://via.placeholder.com/100x150' }}
                  style={styles.mangaImg}
                />
                <Text style={styles.mangaTitle} numberOfLines={2} ellipsizeMode="tail">
                  {manga.attributes.title.en}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.genreBlock}>
          <Text style={styles.sectionTitle}>Manga with romance genre</Text>
          <ScrollView horizontal style={styles.mangaScroll}>
            {romanceMangaList.map((manga) => (
              <TouchableOpacity
                key={manga.id}
                style={styles.mangaItem}
                onPress={() => handleMangaPress(manga)}
              >
                <Image
                  source={{ uri: coverUrls[manga.id] || 'https://via.placeholder.com/100x150' }}
                  style={styles.mangaImg}
                />
                <Text style={styles.mangaTitle} numberOfLines={2} ellipsizeMode="tail">
                  {manga.attributes.title.en}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.genreBlock}>
          <Text style={styles.sectionTitle}>Action and Adventure manga</Text>
          <ScrollView horizontal style={styles.mangaScroll}>
            {actionAdventureMangaList.map((manga) => (
              <TouchableOpacity
                key={manga.id}
                style={styles.mangaItem}
                onPress={() => handleMangaPress(manga)}
              >
                <Image
                  source={{ uri: coverUrls[manga.id] || 'https://via.placeholder.com/100x150' }}
                  style={styles.mangaImg}
                />
                <Text style={styles.mangaTitle} numberOfLines={2} ellipsizeMode="tail">
                  {manga.attributes.title.en}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

async function fetchRndManga(setMangaList, setCoverUrls) {
  try {
    const rnd_resp = await fetch(`https://api.mangadex.org/manga?limit=15&offset=${Math.floor(Math.random() * 1000)}`);
    const data = await rnd_resp.json();

    if (data.data && data.data.length > 0) {
      setMangaList(data.data);

      const cover_promises = data.data.map(async (manga) => {
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
    console.error('Ошибка:', error.message);
  }
}

async function fetchRndRomanceManga(setMangaList, setCoverUrls) {
  try {
    const rnd_resp = await fetch(`https://api.mangadex.org/manga?limit=40&offset=${Math.floor(Math.random() * 1000)}`);
    const data = await rnd_resp.json();

    if (data.data && data.data.length > 0) {
      const romanceMangas = data.data.filter(manga => {
        const genres = manga.attributes.tags.map(tag => tag.attributes.name.en);
        return genres.includes('Romance'); 
      });

      setMangaList(romanceMangas);

      const cover_promises = romanceMangas.map(async (manga) => {
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
    console.error('Ошибка:', error.message);
  }
}

async function fetchActionAdventureManga(setMangaList, setCoverUrls) {
  try {
    const rnd_resp = await fetch(`https://api.mangadex.org/manga?limit=40&offset=${Math.floor(Math.random() * 1000)}`);
    const data = await rnd_resp.json();

    if (data.data && data.data.length > 0) {
      const actionAdventureMangas = data.data.filter(manga => {
        const genres = manga.attributes.tags.map(tag => tag.attributes.name.en);
        return genres.includes('Action') || genres.includes('Adventure'); 
      });

      setMangaList(actionAdventureMangas);

      const cover_promises = actionAdventureMangas.map(async (manga) => {
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
    console.error('Ошибка:', error.message);
  }
}

async function fetchCoverArt(id) {
  const resp = await fetch(`https://api.mangadex.org/cover/${id}`);
  const data = await resp.json();
  if (data.data) {
    const manga_rel_ship = data.data.relationships.find((rel) => rel.type === 'manga');
    if (!manga_rel_ship) {
      throw new Error('Манга не найдена в списках обложек');
    }

    const mangaId = manga_rel_ship.id;
    const { fileName } = data.data.attributes;
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
  } else {
    throw new Error('Обложка не найдена');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d7e0',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  mangaScroll: {
    flexDirection: 'row',
  },
  mangaItem: {
    marginRight: 10,
    backgroundColor: '#4c495d',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    height: 200
  },
  mangaImg: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  mangaTitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d1d7e0',
    width: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d283e',
    marginBottom: 10,
  },
  mangaBlock: {
    marginBottom: 20,
  },
  genreBlock: {
    marginBottom: 20,
  },
});
