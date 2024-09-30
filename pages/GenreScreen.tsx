import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const genres = [
  'Romance', 'Drama', 'Fantasy', 'Action', 'Comedy',
  'Adventure', 'Horror', 'Mystery', 'Sci-Fi', 'Slice of Life',
];

export default function GenreScreen({ navigation }) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleSubmit = () => {
    navigation.navigate('Search', { selectedGenres });
  };

  const renderGenreItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => toggleGenre(item)}
      style={[styles.genreBtn, selectedGenres.includes(item) && styles.selected]}
    >
      <Text style={styles.genreTxt}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select genres</Text>
      <FlatList
        data={genres}
        renderItem={renderGenreItem}
        keyExtractor={(item) => item}
        numColumns={2}
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
        <Text style={styles.submitTxt}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  genreBtn: {
    backgroundColor: '#ddd',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#86C232',
  },
  genreTxt: {
    fontSize: 18,
  },
  submitBtn: {
    backgroundColor: '#61892F',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  submitTxt: {
    color: '#fff',
    fontSize: 18,
  },
});
