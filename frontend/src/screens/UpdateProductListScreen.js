import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import productService from '../services/productService';
import { BASE_SERVER_URL } from '../services/api';

const UpdateProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const imageUrl = item.imageUrl 
      ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_SERVER_URL}${item.imageUrl}`)
      : null;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('UpdateProductForm', { product: item })}
      >
        <View style={styles.imageBox}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <Ionicons name="image-outline" size={32} color={Colors.white} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.price}>${item.price.toFixed(2)}  •  Stock: {item.stock}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Update Mode</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>CATALOGUE › MODIFY ARCHIVE ENTRY</Text>
        <Text style={styles.pageTitle}>Select Product</Text>
        <Text style={styles.subText}>Select an existing specification from the archive to modify its pricing, stock count, or details.</Text>
      </View>
      
      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: Spacing.base, 
    paddingVertical: Spacing.md 
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.round,
    backgroundColor: Colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
    zIndex: 10, 
  },
  headerLogo: { fontSize: Typography.md, fontWeight: '700', color: Colors.black },
  titleBlock: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  eyebrow: { fontSize: Typography.xs, letterSpacing: Typography.wider, color: Colors.secondary, fontWeight: '600', marginBottom: Spacing.xs },
  pageTitle: { fontSize: Typography.xxxl, fontFamily: 'Georgia', fontWeight: '700', color: Colors.black, lineHeight: 42, marginBottom: Spacing.sm },
  subText: { 
    fontSize: Typography.sm, 
    color: Colors.secondary, 
    lineHeight: 22,
  },
  list: { padding: Spacing.base, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  imageBox: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: Spacing.base,
  },
  image: { width: '100%', height: '100%' },
  info: { flex: 1 },
  title: { fontSize: Typography.md, fontWeight: '700', color: Colors.black, marginBottom: 4 },
  price: { fontSize: Typography.xs, color: Colors.secondary, fontWeight: '500' },
});

export default UpdateProductListScreen;
