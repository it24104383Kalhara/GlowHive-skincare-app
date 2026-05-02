import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import productService from '../services/productService';
import { AuthContext } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { BASE_SERVER_URL } from '../services/api';

const DeleteProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleDelete = async (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to completely remove "${product.title}" from the database? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(product._id);
              await productService.deleteProduct(product._id, user.token);
              
              // Remove locally to quickly update the screen
              setProducts(prev => prev.filter(p => p._id !== product._id));
              setSelectedProductId(null);
              
              Alert.alert('Deleted', 'The product has been removed.');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Could not delete the product');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const toggleSelect = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedProductId(selectedProductId === id ? null : id);
  };

  const renderProduct = ({ item }) => {
    const isSelected = selectedProductId === item._id;
    const imageUrl = item.imageUrl 
      ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_SERVER_URL}${item.imageUrl}`)
      : null;

    return (
      <View style={[styles.card, isSelected && styles.cardSelected]}>
        <TouchableOpacity 
          style={styles.cardHeader} 
          activeOpacity={0.8}
          onPress={() => toggleSelect(item._id)}
        >
          <View style={styles.imageBox}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <Ionicons name="image-outline" size={24} color={Colors.white} />
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.price}>${item.price?.toFixed(2)}  •  Stock: {item.stock}</Text>
          </View>
          <Ionicons name={isSelected ? "chevron-up" : "chevron-down"} size={20} color={Colors.secondary} />
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.deleteSection}>
            <Text style={styles.warningText}>
              Warning: Deleting this formulation will permanently erase all associated data.
            </Text>
            <TouchableOpacity 
              style={styles.deleteBtn} 
              activeOpacity={0.8}
              onPress={() => handleDelete(item)}
              disabled={deletingId === item._id}
            >
              {deletingId === item._id ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color={Colors.white} />
                  <Text style={styles.deleteBtnText}>PERMANENTLY DELETE</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Delete Mode</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>ADMIN CONTROLS › DELETION</Text>
        <Text style={styles.pageTitle}>Remove Product</Text>
        <Text style={styles.subText}>Select a discontinued formulation from the archive to permanently delete it from the system.</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.black} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerLogo: { fontSize: Typography.md, fontWeight: '700', color: Colors.error },
  titleBlock: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  eyebrow: { fontSize: Typography.xs, letterSpacing: Typography.wider, color: Colors.error, fontWeight: '600', marginBottom: Spacing.xs },
  pageTitle: { fontSize: Typography.xxxl, fontFamily: 'Georgia', fontWeight: '700', color: Colors.black, lineHeight: 42, marginBottom: Spacing.sm },
  subText: { 
    fontSize: Typography.sm, 
    color: Colors.secondary, 
    lineHeight: 22,
  },
  list: { padding: Spacing.base, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.error,
    backgroundColor: '#FFFAFA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBox: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  info: { flex: 1 },
  title: { fontSize: Typography.md, fontWeight: '600', color: Colors.black, marginBottom: 4 },
  price: { fontSize: Typography.sm, color: Colors.secondary, fontWeight: '500' },
  deleteSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0E5E5',
    alignItems: 'center',
  },
  warningText: {
    fontSize: Typography.xs,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 18,
    paddingHorizontal: Spacing.sm,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    gap: 8,
  },
  deleteBtnText: {
    color: Colors.white,
    fontSize: Typography.sm,
    fontWeight: '700',
    letterSpacing: Typography.wide,
  },
});

export default DeleteProductListScreen;
