import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const CommentList = ({ comments, onDelete }) => {
  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        const createdAt = new Date(item.created_at);
        const date_options = { year: 'numeric', month: 'long', day: 'numeric' };
        const time_options = { hour: '2-digit', minute: '2-digit', hour12: false };

        const formatDate = createdAt.toLocaleDateString('en-US', date_options); 
        const formatTime = createdAt.toLocaleTimeString('en-US', time_options); 

        return (
          <View style={styles.commentItem}>
            <Text style={styles.commentTitle}>Manga: {item.title}</Text>
            <Text style={styles.commentUser}>UserID: {item.user_id}</Text>
            <Text style={styles.commentText}>Comment: {item.comment_text}</Text>
            <Text style={styles.commentDate}>{formatDate} at {formatTime}</Text>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => {
                Alert.alert(
                  "Confirm deletion",
                  "Are you sure you want to delete this comment?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", onPress: () => onDelete(item.id) }
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#564F6F" />
            </TouchableOpacity>
          </View>
        );
      }}
      
    />
  );
};

const BanUserForm = () => {
  const [userId, setUserId] = useState('');
  const [banDuration, setBanDuration] = useState('');

  const handleBanUser = async () => {
    try {
      const resp = await axios.post('http://10.1.0.128:3001/admin/ban-user', {
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
      <TouchableOpacity style={styles.banButton} onPress={handleBanUser}>
        <Text style={styles.buttonText}>Block</Text>
      </TouchableOpacity>
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
      const resp = await axios.get('http://10.1.0.128:3001/admin/comments');
      const sortedComments = resp.data.sort((a : any, b : any) => new Date(b.created_at) - new Date(a.created_at));
      setComments(sortedComments);
    } catch (error) {
      console.error('Error while retrieving comments:', error);
      Alert.alert('Error', 'Failed to load comments.');
    }
  };

  const handleDeleteComment = async (commentId : any) => {
    try {
      await axios.delete(`http://10.1.0.128:3001/admin/comments/${commentId}`);
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
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Admin panel</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={28} color="#564F6F" />
              </TouchableOpacity>
            </View>
            <BanUserForm />
            <CommentList comments={comments} onDelete={handleDeleteComment} />
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
    backgroundColor: '#D1D7E0',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D283E',
  },
  logoutButton: {
    padding: 8,
  },
  formContainer: {
    marginBottom: 10,
    padding: 20,
    paddingBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderBlockColor: '#564f6f',
    backgroundColor: '#9590b0',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    alignSelf: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#4C495D',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#FFF',
    color: '#2D283E',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderRadius: 15,
    padding: 8,
  },  
  banButton: {
    backgroundColor: '#564f6f',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 5,
    width: '40%',
    alignSelf: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  commentItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
    borderWidth: 1,
    width: '95%',
    alignSelf: 'center',
    borderBlockColor: '#564f6f'
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D283E',
    marginBottom: 5
  },
  commentDate: {
    fontSize: 12,
    color: '#6C757D', 
  },
  commentUser: {
    fontSize: 16,
    color: '#4C495D',
  },
  commentText: {
    fontSize: 16,
    color: '#2D283E',
    marginTop: 5,
    marginBottom: 10,
  },
});
