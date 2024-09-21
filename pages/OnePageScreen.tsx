import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, Button, SafeAreaView, ScrollView, PanResponder, Animated as RNAnimated } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

export default function OnePageScreen() {
  const route = useRoute();
  const { chapter, pages, cur_page_index, manga } = route.params; 
  const navigation = useNavigation();
  const cur_page = pages[cur_page_index];
  const offset = useSharedValue(0);
  const pan = useRef(new RNAnimated.ValueXY()).current;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(offset.value) }],
    };
  });

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        {...panResponder.panHandlers}
      >
        <Text style={styles.header}>
          Chapter {chapter.attributes.chapter} - Page {cur_page_index + 1}
        </Text>
        <Animated.View style={[styles.pageContainer, animatedStyle]}>
          <Image source={{ uri: cur_page }} style={styles.page_img} resizeMode="contain" />
        </Animated.View>
      </ScrollView>

      <View style={styles.buttons}>
        <Button title="Previous" onPress={handlePrevPage} disabled={cur_page_index === 0} />
        <Button title="Next" onPress={handleNextPage} disabled={cur_page_index === pages.length - 1} />
      </View>
      <Button title="Back to chapters" onPress={handleGoBack} style={styles.backButton} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
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
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: '90%',
  },
});
