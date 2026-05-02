import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import SideMenu from '../components/SideMenu';
import CartBadgeIcon from '../components/CartBadgeIcon';
import productService from '../services/productService';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import GHModal from '../components/GHModal';

const FILTERS = ['All', 'Serums', 'Oils', 'Cleansers', 'Balms', 'Mists'];

const ProductListScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: () => {},
    variant: 'primary'
  });

  const showModal = (config) => {
    setModalConfig({ ...config, visible: true });
  };

  const hideModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

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
    addToCart(product);
    showModal({
      title: 'Archive Added',
      message: `${product.title} has been added to your shopping bag.`,
      confirmText: 'VIEW BAG',
      onConfirm: () => {
        hideModal();
        navigation.navigate('Cart');
      },
      cancelText: 'CONTINUE',
      onCancel: hideModal,
      variant: 'primary'
    });
  };

  // Prepare data for FlatList including header items
  const listData = [
    { id: 'header-title', type: 'title' },
    { id: 'header-filters', type: 'filters' },
    ...filtered.map(p => ({ ...p, id: p._id, type: 'product' }))
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'title') {
      return (
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>CATALOGUE</Text>
          <Text style={styles.pageTitle}>Full Collection</Text>
          <Text style={styles.subtitle}>
            Each formulation represents a masterclass in scientifically advanced, botanically inspired skincare.
          </Text>
        </View>
      );
    }
    
    if (item.type === 'filters') {
      return (
        <View style={styles.stickyFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            decelerationRate="fast"
            snapToAlignment="start"
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
          <Text style={styles.productCount}>{filtered.length} PRODUCTS</Text>
        </View>
      );
    }

    return (
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id, product: item })}
        onAddToCart={() => handleAddToCart(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Main Header (Sticky Navigation) */}
      <View style={styles.header}>
        {user?.isAdmin ? (
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={26} color={Colors.black} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
        <Text style={styles.headerLogo}>Glow Hive Skincare</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CartBadgeIcon />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginLeft: Spacing.sm }}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product list */}
      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        stickyHeaderIndices={[1]}
        renderItem={renderItem}
        style={styles.flatList}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <SideMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
        navigation={navigation} 
      />

      <GHModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        cancelText={modalConfig.cancelText}
        onCancel={modalConfig.onCancel}
        variant={modalConfig.variant}
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
    marginBottom: Spacing.md,
  },
  stickyFilterContainer: {
    backgroundColor: Colors.neutral,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterRow: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    fontWeight: '700',
    letterSpacing: Typography.wider,
    textAlign: 'center',
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
    paddingBottom: 120, // Adjusted for floating tab bar
  },
  flatList: {
    flex: 1,
  },
});

export default ProductListScreen;
