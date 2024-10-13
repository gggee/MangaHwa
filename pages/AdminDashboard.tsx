import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const CommentList = ({ comments, onDelete }) => {
    return (
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Text>User: {item.username}</Text>
            <Text>ID: {item.id}</Text>
            <Text>Manga: {item.title}</Text>
            <Text>Comment: {item.comment_text}</Text>
            <Button title="Delete" onPress={() => {
              Alert.alert(
                "Confirm deletion",
                "Are you sure you want to delete this comment?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", onPress: () => onDelete(item.id) }
                ]
              );
            }} />
          </View>
        )}
      />
    );
};

const BanUserForm = () => {
  const [userId, setUserId] = useState('');
  const [banDuration, setBanDuration] = useState('');

  const handleBanUser = async () => {
    try {
      const resp = await axios.post('http://192.168.0.103:3001/admin/ban-user', {
        user_id: userId,
        ban_duration: banDuration,
      });
      if (resp.status === 200) {
        Alert.alert(`User ${userId} has been banned for ${banDuration} hour(s)`);
      } else {
        Alert.alert('Error', 'Failed to block user');
      }
    } catch (err) {
      console.error('Error blocking user:', err);
      Alert.alert('Error', 'An error has occurred. Please try again.');
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Block user</Text>
      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        required
      />
      <TextInput
        style={styles.input}
        placeholder="Ban duration (hours)"
        value={banDuration}
        onChangeText={setBanDuration}
        keyboardType="numeric"
        required
      />
      <Button title="Block" onPress={handleBanUser} />
    </View>
  );
};

export default function AdminDashboard() {
  const [comments, setComments] = useState([]);
  const navigation = useNavigation();
  const { signOut, userProfile } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      const checkAdmin = () => {
        if (!userProfile) {
          navigation.navigate('SignIn');
        } else if (userProfile.email !== 'admin@gmail.com' || userProfile.username !== 'admin') {
          navigation.navigate('Profile'); 
        } else {
          fetchComments(); 
        }
      };

      checkAdmin();
    }, [userProfile, navigation]) 
  );

  const fetchComments = async () => {
    try {
      const resp = await axios.get('http://192.168.0.103:3001/admin/comments');
      setComments(resp.data);
    } catch (error) {
      console.error('Error while retrieving comments:', error);
      Alert.alert('Error', 'Failed to load comments.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://192.168.0.103:3001/admin/comments/${commentId}`);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment.');
    }
  };

  const handleLogout = () => {
    signOut(); 
    navigation.navigate('SignIn'); 
  };

  return (
    <View style={styles.container}>
      {userProfile && userProfile.email === 'admin@gmail.com' && userProfile.username === 'admin' ? (
        <>
          <Text style={styles.header}>Admin panel</Text>
          <Button title="Log out" onPress={handleLogout} />
          <Text style={styles.subHeader}>Comments</Text>
          <CommentList comments={comments} onDelete={handleDeleteComment} />
          <BanUserForm />
        </>
      ) : (
        <Text>Loading...</Text> 
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 20,
    marginBottom: 10,
  },
  commentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  formContainer: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
