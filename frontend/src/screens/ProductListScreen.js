import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

const FILTERS = ['All', 'Serums', 'Oils', 'Cleansers', 'Balms', 'Mists'];

const MOCK_PRODUCTS = [
  {
    _id: '1',
    title: 'Verdant Dew Serum',
    price: 299,
    stock: 12,
    category: 'SERUM COLLECTION',
    imageUrl: null,
    ingredients: ['Hyaluronic Acid', 'Green Tea Extract'],
    skinTypeTags: ['All'],
  },
  {
    _id: '2',
    title: 'Arctic Clay Cleanser',
    price: 149,
    stock: 0,
    category: 'CLEANSER',
    imageUrl: null,
    ingredients: ['Kaolin Clay', 'Peppermint'],
    skinTypeTags: ['Oily', 'Combination'],
  },
  {
    _id: '3',
    title: 'Velvet Rose Balm',
    price: 112,
    stock: 3,
    category: 'BALM',
    imageUrl: null,
    ingredients: ['Rosehip', 'Jojoba'],
    skinTypeTags: ['Dry', 'Sensitive'],
  },
  {
    _id: '4',
    title: 'Lunar Night Oil',
    price: 189,
    stock: 8,
    category: 'FACIAL OIL',
    imageUrl: null,
    ingredients: ['Marula', 'Bakuchiol'],
    skinTypeTags: ['All'],
  },
  {
    _id: '5',
    title: 'Citrus Glow Mist',
    price: 79,
    stock: 20,
    category: 'MIST',
    imageUrl: null,
    ingredients: ['Vitamin C', 'Aloe Vera'],
    skinTypeTags: ['All'],
  },
  {
    _id: '6',
    title: 'Herbalism Balm',
    price: 95,
    stock: 5,
    category: 'BALM',
    imageUrl: null,
    ingredients: ['Calendula', 'Chamomile'],
    skinTypeTags: ['Sensitive'],
  },
];

const ProductListScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [cart, setCart] = useState([]);

  const filtered = activeFilter === 'All'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p =>
        p.category.toUpperCase().includes(activeFilter.toUpperCase().slice(0, -1))
      );

  const handleAddToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="menu-outline" size={26} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Glow Hive Skincare</Text>
        <TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Page title */}
      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>CATALOGUE</Text>
        <Text style={styles.pageTitle}>Full Collection</Text>
        <Text style={styles.subtitle}>
          Each formulation represents a masterclass in scientifically advanced, botanically inspired skincare.
        </Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product count */}
      <Text style={styles.productCount}>{filtered.length} PRODUCTS</Text>

      {/* Product list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id, product: item })}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
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
    paddingVertical: Spacing.md,
  },
  headerLogo: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: 0.5,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutralDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  eyebrow: {
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontSize: Typography.xxxl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    lineHeight: 20,
  },
  filterScroll: { maxHeight: 48 },
  filterRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: Colors.white,
  },
  productCount: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    color: Colors.textLight,
    fontWeight: '600',
  },
  list: {
    paddingTop: Spacing.sm,
    paddingBottom: 32,
  },
});

export default ProductListScreen;
