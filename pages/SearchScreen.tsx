import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
  const [title, setTitle] = useState<string>('');
  const [manga_list, setMangaList] = useState<any[]>([]);
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({}); //ID манги — URL обложки
  const navigation = useNavigation();

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
      console.error('Ошибка:', err.message);
    }
  };

  const handleSelectManga = (manga: any) => {
    navigation.navigate('Manga', { manga });
  };

  const renderMangaItem = ({ item }: { item: any }) => {
    const cover_img_url = coverUrls[item.id] || 'https://via.placeholder.com/100x150';
    return (
      <TouchableOpacity onPress={() => handleSelectManga(item)} style={styles.manga_block}>
        <Image source={{ uri: cover_img_url }} style={styles.cover_img} />
        <Text style={styles.manga_title}>{item.attributes.title.en}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.block}>
        <Text style={styles.header}>Search on MangaDex</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter manga title"
          value={title}
          onChangeText={setTitle}
        />
        <Button title="Search" onPress={handleSearch} />
        <FlatList
          data={manga_list}
          keyExtractor={(item) => item.id}
          renderItem={renderMangaItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      </View>
    </SafeAreaView>
  );
}

async function searchMangaByTitle(title: string) {
  const resp = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}`);
  const data = await resp.json();
  if (data.data && data.data.length > 0) {
    return data.data;
  } else {
    throw new Error('Манга не найдена');
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
  },
  block: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
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
  },
  manga_title: {
    fontSize: 16,
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
});
