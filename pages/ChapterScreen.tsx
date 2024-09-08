import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Image, TouchableOpacity, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChapterScreen() {
  const route = useRoute();
  const { manga } = route.params;
  const [chapters, setChapters] = useState<any[]>([]);
  const [select_chapter, setSelectChapter] = useState<any | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const manga_chapters = await getMangaChapters(manga.id);
        setChapters(manga_chapters);
        if (manga_chapters.length > 0) {
          setSelectChapter(manga_chapters[0]);
        }
      } catch (err) {
        console.error('Ошибка:', err.message);
      }
    };
    fetchChapters();
  }, [manga]);

  const handleSelectChapter = async (chapter: any) => {
    try {
      setSelectChapter(chapter);
      const chapter_pages = await getChapterPages(chapter.id);
      setPages(chapter_pages);
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

  const renderPageItem = ({ item }: { item: string }) => (
    <Image
      source={{ uri: item }}
      style={styles.page_img}
      resizeMode="contain"
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.block}>
        <Button title="Back to Manga" onPress={() => navigation.goBack()} />
        <Text style={styles.header}>Chapters:</Text>
        <FlatList
          data={chapters}
          keyExtractor={(item) => item.id}
          renderItem={renderChapterItem}
        />

        {select_chapter && (
          <>
            <Text style={styles.sub_header}>Pages of the selected chapter:</Text>
            <FlatList
              data={pages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderPageItem}
              horizontal
              pagingEnabled
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

async function getMangaChapters(mangaId: string) {
  const resp = await fetch(`https://api.mangadex.org/chapter?manga=${mangaId}`);
  const data = await resp.json();
  if (data.data && data.data.length > 0) {
    return data.data;
  } else {
    throw new Error('Главы не найдены');
  }
}

async function getChapterPages(chapterId: string) {
  const resp = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
  const data = await resp.json();
  if (data.baseUrl && data.chapter) {
    const pages = data.chapter.data.map((page: string) => `${data.baseUrl}/data/${data.chapter.hash}/${page}`);
    return pages;
  } else {
    throw new Error('Страницы не найдены');
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
  chapter_item: {
    fontSize: 16,
    marginVertical: 4,
  },
  sub_header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  page_img: {
    width: 300,
    height: 400,
    marginBottom: 16,
  },
});

//доделать работу с главами
//страницы отделить на разные вкладки 