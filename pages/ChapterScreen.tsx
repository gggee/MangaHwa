import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChapterScreen() {
  const route = useRoute();
  const { manga } = route.params;
  const [chapters, setChapters] = useState<any[]>([]);
  const [load, setLoad] = useState(true); 
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const manga_chapters = await getAllMangaChapters(manga.id);
        setChapters(manga_chapters);
      } catch (err) {
        console.error('Ошибка:', err.message);
      } finally {
        setLoad(false); 
      }
    };
    fetchChapters();
  }, [manga]);

  const handleSelectChapter = async (chapter: any) => {
    try {
      const pages = await getChapterPages(chapter.id); 
      navigation.navigate('OnePage', { chapter, pages, cur_page_index: 0 }); 
    } catch (err) {
      console.error('Ошибка:', err.message);
    }
  };

  const renderChapterItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSelectChapter(item)}>
      <Text style={styles.chapter_item}>
        Chapter {item.attributes.chapter}: {item.attributes.title || 'Без названия'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.block}>
        <Button title="Back to manga" onPress={() => navigation.goBack()} />
        <Text style={styles.header}>Chapters:</Text>
        {load ? (
          <Text style={styles.loading}>Пожалуйста подождите, главы загружаются</Text>
        ) : (
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.id}
            renderItem={renderChapterItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

async function getAllMangaChapters(mangaId: string) {
  let all_chapters: any[] = []; //по 100 чтоб не нагружать
  let limit = 100;
  let offset = 0; 
  let end = true;
  while (end) {
    const resp = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}&limit=${limit}&offset=${offset}`);
    const data = await resp.json();
    if (data.data && data.data.length > 0) {
      all_chapters = all_chapters.concat(data.data);
      offset += limit;
      end = data.total > all_chapters.length;
    } else {
      end = false;
    }
  }
  return all_chapters.length > 0 ? all_chapters : [];
}

async function getChapterPages(chapterId: string) {
  const resp = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
  const data = await resp.json();
  const baseUrl = data.baseUrl;
  const pages = data.chapter.data.map((filename: string) => `${baseUrl}/data/${data.chapter.hash}/${filename}`);
  return pages; 
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
  chapter_item: {
    fontSize: 16,
    marginVertical: 4,
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
});
