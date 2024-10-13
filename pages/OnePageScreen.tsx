import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, SafeAreaView, TextInput, FlatList, Alert, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext';
import { PanResponder, Animated as RNAnimated } from 'react-native';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';

const fetchComments = async (
  mangaId : any, 
  chapterId : any, 
  curPageIndex : any, 
  setComments : any, 
  setLoading : any) => {
  try {
    setLoading(true);
    const resp = await axios.get(`http://192.168.0.103:3001/comments/${mangaId}/${chapterId}/${curPageIndex}`);
    setComments(resp.data);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
  } finally {
    setLoading(false);
  }
};

const addComment = async (
  userProfile : any, 
  mangaId : any, 
  chapterId : any, 
  curPageIndex : any, 
  commentText : any, 
  setComments : any, 
  setCommentText : any, 
  setLoadingComment : any) => {
  if (!commentText.trim()) return;
  try {
    setLoadingComment(true);
    const resp = await axios.post('http://192.168.0.103:3001/comments', {
      user_id: userProfile.id,
      manga_id: mangaId,
      chapter_id: chapterId,
      page_index: curPageIndex,
      comment_text: commentText,
    });
    setComments(prevComments => prevComments.concat({
      ...resp.data,
      username: userProfile.username,
      user_id: userProfile.id
    }));    
    setCommentText('');
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  } finally {
    setLoadingComment(false);
  }
};

const deleteComment = async (commentId : any, userProfile : any, setComments : any) => {
  Alert.alert(
    "Delete comment?",
    "Are you sure you want to delete this comment?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: async () => {
          try {
            await axios.delete(`http://192.168.0.103:3001/comments/${commentId}`);
            setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
          } catch (err) {
            console.error('Error deleting comment:', err.message);
          }
        }},
    ]
  );
};

const addBookmark = async (userProfile : any, mangaId : any, chapterId : any, curPageIndex : any) => {
  try {
    await axios.post('http://192.168.0.103:3001/bookmarks', {
      user_id: userProfile.id,
      manga_id: mangaId,
      chapter_id: chapterId,
      page_index: curPageIndex,
    });
    Alert.alert('Bookmark added!');
  } catch (err) {
    console.error('Error adding bookmark:', err.message);
  }
};

const fetchBookmarks = async (userId : any, setBookmarks : any) => {
  try {
    const resp = await axios.get(`http://192.168.0.103:3001/bookmarks/${userId}`);
    setBookmarks(resp.data);
  } catch (err) {
    console.error('Error fetching bookmarks:', err.message);
  }
};

export default function OnePageScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userProfile } = useAuth();
  const offset = useSharedValue(0);
  const { chapter, pages, cur_page_index, manga } = route.params; 
  const cur_page = pages[cur_page_index];
  const pan = useRef(new RNAnimated.ValueXY()).current;
  const [comment_txt, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComment, setLoadingComment] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchComments(manga.id, chapter.id, cur_page_index, setComments, setLoading);
    fetchBookmarks(userProfile.id, setBookmarks);
  }, [cur_page_index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(offset.value, { damping: 10 }) }],
  }));

  const handleNextPage = () => {
    if (cur_page_index < pages.length - 1) {
      offset.value = -1000;
      navigation.push('OnePage', { chapter, pages, cur_page_index: cur_page_index + 1, manga });
    }
  };

  const handlePrevPage = () => {
    if (cur_page_index > 0) {
      offset.value = 1000;
      navigation.push('OnePage', { chapter, pages, cur_page_index: cur_page_index - 1, manga });
    }
  };

  const handleGoBack = () => {
    navigation.navigate('Chapter', { manga: manga });
  };

  const handleAddBookmark = () => {
    addBookmark(userProfile, manga.id, chapter.id, cur_page_index);
  };

  const renderComment = ({ item }) => (
    <View style={styles.comment}>
      <Text style={styles.commentUser}>{item.username}</Text>
      <Text style={styles.commentTxt}>{item.comment_text}</Text>
      <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      {item.user_id === userProfile.id && (
        <Button title="Delete" onPress={() => deleteComment(item.id, userProfile, setComments)} color="#FF6347" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComment}
          contentContainerStyle={styles.comments_block}
          ListHeaderComponent={
            <>
              <Text style={styles.header}>
                Chapter {chapter.attributes.chapter} - Page {cur_page_index + 1}
              </Text>
              <Animated.View style={[styles.pageContainer, animatedStyle]}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
                  <Image source={{ uri: cur_page }} style={styles.page_img} resizeMode="contain" />
                </TouchableWithoutFeedback>
                <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
                  <ImageViewer imageUrls={[{ url: cur_page }]} />
                </Modal>
              </Animated.View>
              <View style={styles.buttons}>
                <Button title="Previous" onPress={handlePrevPage} disabled={cur_page_index === 0} />
                <Button title="Next" onPress={handleNextPage} disabled={cur_page_index === pages.length - 1} />
              </View>
              <Button title="Back to chapters" onPress={handleGoBack} style={styles.backBtn} />
              <Button title="Add bookmark" onPress={handleAddBookmark} />
              <TextInput
                style={styles.input}
                value={comment_txt}
                onChangeText={setCommentText}
                placeholder="Leave a comment..."
              />
              <Button title="Submit a comment" onPress={() => addComment(userProfile, manga.id, chapter.id, cur_page_index, comment_txt, setComments, setCommentText, setLoadingComment)} disabled={!comment_txt.trim() || loadingComment} />
              {loadingComment && <ActivityIndicator size="small" color="#0000ff" />}
            </>
          }
        />
      )}
    </SafeAreaView>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  comments_block: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pageContainer: {
    width: '100%',
    height: 600,
    marginBottom: 16,
  },
  page_img: {
    width: '100%',
    height: '100%',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16, 
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  comment: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentTxt: {
    marginVertical: 5,
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
});
