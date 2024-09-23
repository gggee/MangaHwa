import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, SafeAreaView, TextInput, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import axios from 'axios'; 
import { useAuth } from '../context/AuthContext';
import { PanResponder, Animated as RNAnimated } from 'react-native';

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

  const fetchComments = async () => {
    try {
      const resp = await axios.get(`http://192.168.0.105:3001/comments/${manga.id}/${chapter.id}/${cur_page_index}`);
      setComments(resp.data);
    } catch (err) {
      console.error('Error fetching comments:', err.message);
    }
  };

  const addComment = async () => {
    if (!comment_txt.trim()) return;
    try {
      const resp = await axios.post('http://192.168.0.105:3001/comments', {
        user_id: userProfile.id,
        manga_id: manga.id,
        chapter_id: chapter.id,
        page_index: cur_page_index,
        comment_text: comment_txt,
      });
      setComments(prevComments => [
        ...prevComments,
        { ...resp.data, username: userProfile.username }
      ]);
      setCommentText('');
    } catch (err) {
      console.error('Error:', err.response ? err.response.data : err.message);
    }
  };

  useEffect(() => {
    fetchComments(); 
  }, [cur_page_index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(offset.value) }],
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > 50 && cur_page_index > 0) {
          handlePrevPage();
        } else if (gestureState.dx < -50 && cur_page_index < pages.length - 1) {
          handleNextPage();
        }
        RNAnimated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  const renderComment = ({ item }) => (
    <View style={styles.comment}>
      <Text style={styles.commentUser}>{item.username}</Text>
      <Text style={styles.commentTxt}>{item.comment_text}</Text>
      <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
              <Image source={{ uri: cur_page }} style={styles.page_img} resizeMode="contain" />
            </Animated.View>
            <View style={styles.buttons}>
              <Button title="Previous" onPress={handlePrevPage} disabled={cur_page_index === 0} />
              <Button title="Next" onPress={handleNextPage} disabled={cur_page_index === pages.length - 1} />
            </View>
            <Button title="Back to chapters" onPress={handleGoBack} style={styles.backBtn} />
            <TextInput
              style={styles.input}
              value={comment_txt}
              onChangeText={setCommentText}
              placeholder="Оставьте комментарий..."
            />
            <Button title="Отправить комментарий" onPress={addComment} />
          </>
        }
      />
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
    height: 500,
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
    width: '90%',
  },
  comment: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  commentTxt: {
    fontSize: 16,
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 4,
  },  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
});
