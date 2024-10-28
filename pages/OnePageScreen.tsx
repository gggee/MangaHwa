import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, SafeAreaView, TextInput, FlatList, Alert, ActivityIndicator, TouchableWithoutFeedback, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext';
import { PanResponder, Animated as RNAnimated } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';

const fetchComments = async (
  mangaId : any, 
  chapterId : any, 
  curPageIndex : any, 
  setComments : any, 
  setLoading : any) => {
  try {
    setLoading(true);
    const resp = await axios.get(`http://10.1.0.128:3001/comments/${mangaId}/${chapterId}/${curPageIndex}`);
    setComments(resp.data);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
  } finally {
    setLoading(false);
  }
};

const addComment = async (
  userProfile: any, 
  mangaId: any, 
  chapterId: any, 
  curPageIndex: any, 
  commentText: any, 
  setComments: any, 
  setCommentText: any, 
  setLoadingComment: any
) => {
  if (!commentText.trim()) return;

  const newComment = {
    id: Date.now(), 
    username: userProfile.username,
    user_id: userProfile.id,
    comment_text: commentText,
    created_at: new Date().toISOString(), 
  };
  setComments(prevComments => [...prevComments, newComment]);
  setCommentText(''); 

  try {
    setLoadingComment(true);
    const resp = await axios.post('http://10.1.0.128:3001/comments', {
      user_id: userProfile.id,
      manga_id: mangaId,
      chapter_id: chapterId,
      page_index: curPageIndex,
      comment_text: commentText,
    });
    setComments(prevComments =>
      prevComments.map(comment => 
        comment.id === newComment.id ? { ...resp.data, ...newComment } : comment
      )
    );
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
    setComments(prevComments => prevComments.filter(comment => comment.id !== newComment.id));
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
            await axios.delete(`http://10.1.0.128:3001/comments/${commentId}`);
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
    await axios.post('http://10.1.0.128:3001/bookmarks', {
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
    const resp = await axios.get(`http://10.1.0.128:3001/bookmarks/${userId}`);
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
      <View style={styles.commentContent}>
        <View style={styles.userInfo}>
          <Ionicons name="person-outline" size={22} color="#564f6f" style={styles.profileIcon} />
          <View style={styles.userDetails}>
            <Text style={styles.commentUser}>{item.username}</Text>
            <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
        <Text style={styles.commentTxt}>{item.comment_text}</Text>
      </View>
      {item.user_id === userProfile.id && (
        <TouchableOpacity onPress={() => deleteComment(item.id, userProfile, setComments)}>
          <Ionicons name="trash-outline" size={20} color="#564f6f" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#564f6f" style={styles.load} />
      ) : (
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
        >
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderComment}
            contentContainerStyle={styles.comments_block}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              <>
                <View style={styles.headerContainer}>
                  <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                    <Ionicons name="arrow-back-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.header}>
                    Chapter {chapter.attributes.chapter}
                  </Text>
                  <TouchableOpacity style={styles.bookmarkButton} onPress={handleAddBookmark}>
                    <Ionicons name="bookmark-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <Animated.View style={[styles.pageContainer, animatedStyle]}>
                  <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
                    <Image source={{ uri: cur_page }} style={styles.page_img} resizeMode="contain" />
                  </TouchableWithoutFeedback>
                  <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                      <Ionicons name="arrow-back-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <ImageViewer 
                      imageUrls={[{ url: cur_page }]} 
                      style={styles.imageViewer} 
                      enableImageZoom={true} 
                      renderIndicator={() => <View />}
                    />
                    </View>
                  </Modal>
                </Animated.View>
  
                <View style={styles.buttons}>
                  <TouchableOpacity 
                    onPress={handlePrevPage} 
                    disabled={cur_page_index === 0}
                    style={[styles.iconButton, cur_page_index === 0 && styles.disabledButton]}
                  >
                    <Ionicons name="chevron-back-outline" size={30} color={cur_page_index === 0 ? '#564f6f' : '#000'} />
                  </TouchableOpacity>
  
                  <TouchableOpacity 
                    onPress={handleNextPage} 
                    disabled={cur_page_index === pages.length - 1}
                    style={[styles.iconButton, cur_page_index === pages.length - 1 && styles.disabledButton]}
                  >
                    <Ionicons name="chevron-forward-outline" size={30} color={cur_page_index === pages.length - 1 ? '#564f6f' : '#000'} />
                  </TouchableOpacity>
                </View>
  
                <View style={styles.commentContainer}>
                  <TextInput
                    style={styles.input}
                    value={comment_txt}
                    onChangeText={setCommentText}
                    placeholder="Write comments..."
                    multiline={true} 
                    numberOfLines={3} 
                    scrollEnabled={true} 
                  />
                  <TouchableOpacity 
                    onPress={() => addComment(userProfile, manga.id, chapter.id, cur_page_index, comment_txt, setComments, setCommentText, setLoadingComment)} 
                    disabled={!comment_txt.trim() || loadingComment}
                    style={[styles.sendButton, (!comment_txt.trim() || loadingComment) && styles.disabledButton]}
                  >
                    <Ionicons name="send" size={24} color={!comment_txt.trim() || loadingComment ? '#ccc' : '#564f6f'} />
                  </TouchableOpacity>
                </View>
                {loadingComment && <ActivityIndicator size="small" color="#564f6f" />}
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>There are no comments here yet</Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d7e0',
  },
  comments_block: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#26242e'
  },
  pageContainer: {
    width: '100%',
    height: 575,
    marginBottom: 16,
    backgroundColor: '#26242e'
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
    marginBottom: 10, 
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  input: {
    borderColor: '#6f6b88',
    borderWidth: 0.5,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '85%',
    height: 50, 
    maxHeight: 140, 
  },
  comment: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
    marginLeft: 15,
    marginTop: 10,
    marginRight: 15
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  profileIcon: { 
    marginTop: 5,
  },
  userDetails: {
    marginLeft: 5, 
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#4c495d'
  },
  commentContent: {
    flex: 1, 
    marginRight: 10, 
  },
  commentTxt: {
    marginVertical: 8,
    fontSize: 14,
    color: '#26242e'
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#6f6b88',
    height: 60,
  },
  backButton: { 
    left: 2, 
    zIndex: 1,
    padding: 10, 
    elevation: 2, 
  },
  bookmarkButton: {
    left: 2, 
    zIndex: 1,
    padding: 10, 
    elevation: 2, 
  },
  iconButton: {
    padding: 5,
  },
  disabledButton: {
    opacity: 0.8,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 15
  },
  sendButton: {
    padding: 10,
  },
  load: {
    marginVertical: 350
  },
  separator: {
    height: 0.4, 
    backgroundColor: '#9590b0',
    marginVertical: 5,
    width: '90%',
    alignSelf: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#b5b4bf', 
    fontSize: 16,
    textAlign: 'center',
  },
  imageViewer: {
    width: '100%', 
    height: '100%', 
    borderRadius: 10, 
  },
  modalContent: {
    height: '95%', 
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    left: 20,
    zIndex: 1, 
  },
});
