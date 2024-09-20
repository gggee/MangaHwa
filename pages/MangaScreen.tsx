import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, Button, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function MangaScreen() {
  const route = useRoute();
  const { manga } = route.params;
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const [author, setAuthor] = useState<string | null>(null);
  const [artist, setArtist] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetailsAndSend = async () => {
      try {
        const { author, artist, genres, coverUrl } = await getMangaDetails(manga.id);
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
          status: manga.attributes.status || 'Unknown', 
          cover_image_url: coverUrl || '',
        });
      } catch (err) {
        console.error('Ошибка:', err.message);
      }
    };
    fetchDetailsAndSend();
  }, [manga.id]);

  const addToCollection = async () => {
    if (!userProfile) { Alert.alert('Ошибка', 'Пожалуйста, войдите в аккаунт'); return;}
  
    try {
      const response = await fetch('http://192.168.0.105:3000/collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userProfile.token}`,
        },
        body: JSON.stringify({
          user_id: userProfile.id,
          manga_id: manga.id,
          status: 'Прочитано',
        }),
      });

      if (!response.ok) { throw new Error('Не удалось добавить мангу в коллекцию');}
      Alert.alert('Успех', 'Манга добавлена в коллекцию');
    } catch (error) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const sendMangaToServer = async (mangaData: any) => {
    try {
      const response = await fetch('http://192.168.0.105:3000/add-manga', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mangaData),
      });

      if (!response.ok) { throw new Error('Не удалось добавить мангу на сервер'); }
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
        <Text style={styles.sub_header}>Chapters: {manga.attributes.chapter_count}</Text>
        <Text style={styles.descrip}>{manga.attributes.description.en}</Text>
        <Text style={styles.sub_header}>Author: {author || 'Unknown'}</Text>
        <Text style={styles.sub_header}>Artist: {artist || 'Unknown'}</Text>
        <Button title="View chapters" onPress={() => navigation.navigate('Chapter', { manga })} />
        <Button title="Add to Collection" onPress={addToCollection} />
        <Button title="Back to search" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

async function getMangaDetails(mangaId: string) {
  const resp = await fetch(`https://api.mangadex.org/manga/${mangaId}`);
  const data = await resp.json();

  if (data.data && data.data.relationships) {
    const relationships = data.data.relationships;
    const author_rel_ship = relationships.find((rel: any) => rel.type === 'author');
    const artist_rel_ship = relationships.find((rel: any) => rel.type === 'artist');
    const cover_art_rel_ship = relationships.find((rel: any) => rel.type === 'cover_art');

    const author = author_rel_ship ? await fetchAuthorOrArtist(author_rel_ship.id) : null;
    const artist = artist_rel_ship ? await fetchAuthorOrArtist(artist_rel_ship.id) : null;
    const genres = data.data.attributes.tags.map((tag: any) => tag.attributes.name.en);
    const coverUrl = cover_art_rel_ship ? await fetchCoverArt(cover_art_rel_ship.id) : null;
    return { author, artist, genres, coverUrl };
  } else {
    throw new Error('Данные не найдены');
  }
}

async function fetchAuthorOrArtist(id: string) {
  const resp = await fetch(`https://api.mangadex.org/author/${id}`);
  const data = await resp.json();
  if (data.data) {
    return data.data.attributes.name;
  } else {
    throw new Error('Данные не найдены');
  }
}

async function fetchCoverArt(id: string) {
  const resp = await fetch(`https://api.mangadex.org/cover/${id}`);
  const data = await resp.json();
  if (data.data) {
    const manga_rel_ship = data.data.relationships.find(
      (rel: any) => rel.type === 'manga'
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
    marginBottom: 16,
  },
  cover_img: {
    width: 200,
    height: 300,
    marginBottom: 16,
  },
  sub_header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  descrip: {
    fontSize: 16,
    marginVertical: 8,
    color: 'gray',
  },
});
