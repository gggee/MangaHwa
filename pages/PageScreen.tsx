import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function PageScreen() {
  const route = useRoute();
  const { chapter, pages } = route.params;
  const navigation = useNavigation();

  const handleOpenPage = (page_index: number) => {
    navigation.navigate('OnePage', {
      chapter, pages, cur_page_index: page_index });
  };

  const renderPageItem = ({ item, index }: { item: string, index: number }) => (
    <TouchableOpacity onPress={() => handleOpenPage(index)}>
      <Text style={styles.page_item}>Page {index + 1}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.block}>
        <Text style={styles.header}>Pages of chapter {chapter.attributes.chapter}</Text>
        <FlatList
          data={pages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderPageItem}
        />
      </View>
    </SafeAreaView>
  );
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
  page_item: {
    fontSize: 18,
    marginVertical: 8,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    borderRadius: 5,
  },
});
