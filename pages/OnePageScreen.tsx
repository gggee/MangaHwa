import React from 'react';
import { View, Text, Image, StyleSheet, Button, SafeAreaView, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function OnePageScreen() {
  const route = useRoute();
  const { chapter, pages, cur_page_index } = route.params;
  const navigation = useNavigation();
  const cur_page = pages[cur_page_index]; 

  const handleNextPage = () => {
    if (cur_page_index < pages.length - 1) {
      navigation.push('OnePage', { chapter, pages, cur_page_index: cur_page_index + 1 }); 
    }
  };

  const handlePrevPage = () => {
    if (cur_page_index > 0) {
      navigation.push('OnePage', { chapter, pages, cur_page_index: cur_page_index - 1 });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.block}>
        <Text style={styles.header}>Chapter {chapter.attributes.chapter} - page {cur_page_index + 1}</Text>
        <Image
          source={{ uri: cur_page }}
          style={styles.page_img}
          resizeMode="contain"
        />
      </ScrollView>

      <View style={styles.btns}>
        <Button
          title="Previous"
          onPress={handlePrevPage}
          disabled={cur_page_index === 0}
        />
        <Button
          title="Next"
          onPress={handleNextPage}
          disabled={cur_page_index === pages.length - 1}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  block: {
    paddingHorizontal: 16,
    paddingTop: 10,  
    alignItems: 'center',
    paddingBottom: 80, 
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  page_img: {
    width: '100%',
    height: 500,  
    marginBottom: 16,
  },
  btns: {
    position: 'absolute',
    bottom: 10, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
});
