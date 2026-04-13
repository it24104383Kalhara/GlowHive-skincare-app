import React, { useState, useCallback, useContext } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import SideMenu from '../components/SideMenu';
import productService from '../services/productService';
import { AuthContext } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

const FILTERS = ['All', 'Serums', 'Oils', 'Cleansers', 'Balms', 'Mists'];

const ProductListScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  const { user } = useContext(AuthContext);

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

  const filtered = activeFilter === 'All'
    ? products
    : products.filter(p =>
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
        {user?.isAdmin ? (
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={26} color={Colors.black} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
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

      <SideMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
        navigation={navigation} 
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
