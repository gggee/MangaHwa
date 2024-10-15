import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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

  const handleSelectChapter = async (chapter : any) => {
    try {
        const pages = await getChapterPages(chapter.id);
        navigation.navigate('OnePage', { chapter, pages, cur_page_index: 0, manga }); 
    } catch (err) {
        console.error('Ошибка:', err.message);
    }
  };

  const renderChapterItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSelectChapter(item)} style={styles.chapterRow}>
      <Ionicons name="book-outline" size={20} color="#26242e" style={styles.chapterIcon} />
      <Text style={styles.chapter_item}>
        <Text style={styles.boldText}>Chapter {item.attributes.chapter}</Text>. {item.attributes.title ? item.attributes.title.slice(0, 28) + (item.attributes.title.length > 30 ? '...' : '') : 'Без названия'}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backBlock}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={22} color="#fff" />
          </TouchableOpacity>
      </View>
      <View style={styles.block}>
        {load ? (
          <Text style={styles.loading}>Load...</Text>
        ) : (
          <FlatList
            data={chapters}
            keyExtractor={(item) => item.id}
            renderItem={renderChapterItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    backgroundColor: '#d1d7e0'
  },
  block: {
    flex: 1,
    paddingHorizontal: 14,
  },
  backBlock: {
    height: 50,
    backgroundColor: '#6f6b88',
    marginBottom: 6
  },
  chapter_item: {
    fontSize: 16,
    marginVertical: 5,
    paddingBottom: 6,
    paddingTop: 6,
    color: '#26242e'
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    position: 'absolute',
    top: 4, 
    left: 2, 
    zIndex: 1,
    borderRadius: 20,
    padding: 10, 
    elevation: 2, 
    marginBottom: 30,
  },
  separator: {
    height: 0.5, 
    backgroundColor: '#9590b0',
    marginVertical: 5,
    width: '85%',
    alignSelf: 'flex-end'
  },
  boldText: {
    fontWeight: 'bold', 
    color: '#26242e'
  },
  chapterIcon: {
    marginRight: 10, 
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
});
