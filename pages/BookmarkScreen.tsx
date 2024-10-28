import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 
import { useAuth } from '../context/AuthContext';

const fetchBookmarks = async (userId : any) => {
  try {
    const resp = await axios.get(`http://10.1.0.128:3001/bookmarks/${userId}`);
    return resp.data; 
  } catch (err) {
    console.error('Error fetching bookmarks:', err.message);
    return [];
  }
};

const fetchCoverArt = async (mangaId : any) => {
  try {
    const resp = await fetch(`https://api.mangadex.org/manga/${mangaId}`);
    const data = await resp.json();
    const coverRelShip = data.data.relationships.find(rel => rel.type === 'cover_art');

    if (coverRelShip) {
      const coverResp = await fetch(`https://api.mangadex.org/cover/${coverRelShip.id}`);
      const coverData = await coverResp.json();
      const filename = coverData.data.attributes.fileName;
      return `https://uploads.mangadex.org/covers/${mangaId}/${filename}.256.jpg`;
    }

    return 'https://via.placeholder.com/100x150/FFFFFF/000000'; 
  } catch (error) {
    console.error('Error fetching cover art:', error.message);
    return 'https://via.placeholder.com/100x150/FFFFFF/000000'; 
  }
};

const fetchChapterDetails = async (chapterId : any) => {
  try {
    const resp = await fetch(`https://api.mangadex.org/chapter/${chapterId}`);
    const data = await resp.json();
    const mangaId = data.data.relationships.find(rel => rel.type === 'manga')?.id;
    return { mangaId };
  } catch (err) {
    console.error('Error fetching chapter details:', err.message);
    return null;
  }
};

const fetchChapterTitle = async (chapterId : any) => {
  try {
    const resp = await fetch(`https://api.mangadex.org/chapter/${chapterId}`);
    const data = await resp.json();
    return data.data.attributes.title; 
  } catch (err) {
    console.error('Error fetching chapter title:', err.message);
    return null;
  }
}; 

const fetchMangaTitle = async (mangaId : any) => {
  try {
    const resp = await fetch(`https://api.mangadex.org/manga/${mangaId}`);
    const data = await resp.json();
    return data.data.attributes.title.en || data.data.attributes.title.ja || 'Untitled'; 
  } catch (err) {
    console.error('Error fetching manga title:', err.message);
    return 'Untitled'; 
  }
};

const deleteBookmark = async (userId : any, chapterId : any) => {
  try {
    await axios.delete(`http://10.1.0.128:3001/bookmarks/${userId}/${chapterId}`);
    return true;
  } catch (err) {
    console.error('Error deleting bookmark:', err.message);
    return false;
  }
};

export default function BookmarkScreen() {
  const { userProfile } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chapter_details, setChapterDetails] = useState({});
  const navigation = useNavigation();  

  useEffect(() => {
    const loadBookmarks = async () => {
      if (userProfile) {
        const fetchedBookmarks = await fetchBookmarks(userProfile.id);
        setBookmarks(fetchedBookmarks);
      }
      setLoading(false);
    };
    loadBookmarks();
  }, [userProfile]);

  useEffect(() => {
    const fetchDetails = async () => {
      const details = {};
      for (const bookmark of bookmarks) {
        const chapter_info = await fetchChapterDetails(bookmark.chapter_id);
        if (chapter_info && chapter_info.mangaId) {
          const chapter_title = await fetchChapterTitle(bookmark.chapter_id);
          const manga_title = await fetchMangaTitle(chapter_info.mangaId);
          const cover_art = await fetchCoverArt(chapter_info.mangaId);

          details[bookmark.chapter_id] = { 
            chapterTitle: chapter_title, 
            mangaId: chapter_info.mangaId,
            mangaTitle: manga_title || 'Untitled',
            coverArt: cover_art,
            pageIndex: bookmark.page_index 
          };
        }
      }
      setChapterDetails(details);
    };

    if (bookmarks.length > 0) {
      fetchDetails();
    }
  }, [bookmarks]);

  const handleDeleteBookmark = async (chapterId : any) => {
    const temp = await new Promise((resolve) => {
      Alert.alert(
        "Delete bookmark?",
        "Are you sure you want to delete this bookmark?",
        [
          { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
          { text: "Delete", onPress: () => resolve(true) },
        ]
      );
    });

    if (temp) {
      const success = await deleteBookmark(userProfile.id, chapterId);
      if (success) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.chapter_id !== chapterId));
        setChapterDetails(prev => {
          const updatedDetails = { ...prev };
          delete updatedDetails[chapterId];
          return updatedDetails;
        });
        Alert.alert("Bookmark removed!");
      } else {
        Alert.alert("Oops...", "Failed to delete bookmark.");
      }
    }
  };

  const renderBookmark = ({ item }) => {
    const { chapterTitle, mangaTitle, coverArt, pageIndex, mangaId } = chapter_details[item.chapter_id] || {};

    return (
      <TouchableOpacity>
        <View style={styles.bookmark}>
          <Image source={{ uri: coverArt || 'https://via.placeholder.com/100x150/FFFFFF/000000' }} style={styles.mangaImg} />
          <View style={styles.textContainer}>
            <Text style={styles.mangaTitle}>{mangaTitle || 'Load...'}</Text>
            <Text style={styles.chapterTitle}>
              {`Chapter: ${chapterTitle || 'Untitled'}`}
            </Text>
            {pageIndex !== undefined && (
              <Text style={styles.pageIndex}>{`Page: ${pageIndex}`}</Text> 
            )}
          </View>
          <TouchableOpacity onPress={() => handleDeleteBookmark(item.chapter_id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={22} color="#564f6f" /> 
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#564f6f" style={styles.load} />
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.chapter_id.toString()}
          renderItem={renderBookmark}
          contentContainerStyle={styles.bookmarksBlock}
          ListHeaderComponent={<Text style={styles.bookmarksHeader}>Bookmarks</Text>}
          ListEmptyComponent={<Text style={styles.emptyText}>Empty</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d7e0',
    padding: 16,
  },
  bookmarksBlock: {
    paddingBottom: 20,
  },
  bookmarksHeader: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18,
    textAlign: 'center',
    color: '#4c495d'
  },
  bookmark: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mangaImg: {
    width: 80,
    height: 110,
    marginRight: 10,
    borderRadius: 8,
    borderColor: '#564f6f',
    borderWidth: 0.8
  },
  textContainer: {
    flex: 1,
  },
  mangaTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#26242e'
  },
  chapterTitle: {
    color: '#666',
  },
  pageIndex: {
    color: '#666',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteBtnTxt: {
    color: '#fff',
  },
  load: {
    marginVertical: 350
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 310
  },
});
