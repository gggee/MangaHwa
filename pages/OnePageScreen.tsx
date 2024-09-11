import React from 'react';
import { View, Text, Image, StyleSheet, Button, SafeAreaView, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
<<<<<<< HEAD
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
=======
>>>>>>> origin/main

export default function OnePageScreen() {
  const route = useRoute();
  const { chapter, pages, cur_page_index } = route.params;
  const navigation = useNavigation();
<<<<<<< HEAD
  const cur_page = pages[cur_page_index];

  const offset = useSharedValue(0);
  const animat_stl = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(offset.value) }],
    };
  });

  const handleNextPage = () => {
    if (cur_page_index < pages.length - 1) {
      offset.value = -1000; 
      navigation.push('OnePage', { chapter, pages, cur_page_index: cur_page_index + 1 });
=======
  const cur_page = pages[cur_page_index]; 

  const handleNextPage = () => {
    if (cur_page_index < pages.length - 1) {
      navigation.push('OnePage', { chapter, pages, cur_page_index: cur_page_index + 1 }); 
>>>>>>> origin/main
    }
  };

  const handlePrevPage = () => {
    if (cur_page_index > 0) {
<<<<<<< HEAD
      offset.value = 1000; 
=======
>>>>>>> origin/main
      navigation.push('OnePage', { chapter, pages, cur_page_index: cur_page_index - 1 });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
<<<<<<< HEAD
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Chapter {chapter.attributes.chapter} - page {cur_page_index + 1}</Text>
        <Animated.View style={[styles.pageContainer, animat_stl]}>
          <Image
            source={{ uri: cur_page }}
            style={styles.page_img}
            resizeMode="contain"
          />
        </Animated.View>
      </ScrollView>

      <View style={styles.buttons}>
=======
      <ScrollView contentContainerStyle={styles.block}>
        <Text style={styles.header}>Chapter {chapter.attributes.chapter} - page {cur_page_index + 1}</Text>
        <Image
          source={{ uri: cur_page }}
          style={styles.page_img}
          resizeMode="contain"
        />
      </ScrollView>

      <View style={styles.btns}>
>>>>>>> origin/main
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
<<<<<<< HEAD
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'center',
    paddingBottom: 80,
=======
  block: {
    paddingHorizontal: 16,
    paddingTop: 10,  
    alignItems: 'center',
    paddingBottom: 80, 
>>>>>>> origin/main
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
<<<<<<< HEAD
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
    position: 'absolute',
    bottom: 10,
=======
  page_img: {
    width: '100%',
    height: 500,  
    marginBottom: 16,
  },
  btns: {
    position: 'absolute',
    bottom: 10, 
>>>>>>> origin/main
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
});
