import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GHButton from '../components/GHButton';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { BASE_SERVER_URL } from '../services/api';
import productService from '../services/productService';
import { CartContext } from '../contexts/CartContext';
import CartBadgeIcon from '../components/CartBadgeIcon';
import GHModal from '../components/GHModal';
import { AuthContext } from '../contexts/AuthContext';
import reviewService from '../services/reviewService';
import ReviewList from '../components/ReviewSystem/ReviewList';
import ReviewForm from '../components/ReviewSystem/ReviewForm';

const MOCK_PRODUCT = {
  _id: '1',
  title: 'Acidic Refinement Nº7',
  price: 124.00,
  size: '30ML / 1.0 FL OZ',
  stock: 2,
  description:
    'A transformative nocturnal resurfacing treatment engineered with molecular precision of the AHAs. Designed to gently dissolve cellular debris while reinforcing the skin lipid barrier for a refined, luminous architectural finish.',
  ingredients: ['Salicylic Acid 2%', 'Niacinamide', 'Squalane', 'Green Tea Extract'],
  skinTypeTags: ['Oily', 'Dry', 'Sensitive'],
  category: 'SERUM COLLECTION',
  imageUrl: null,
};

const StarRating = ({ rating, size = 14 }) => {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={size}
          color={Colors.tertiary}
        />
      ))}
    </View>
  );
};

const ProductDetailScreen = ({ route, navigation }) => {
  const [product, setProduct] = useState(route?.params?.product || MOCK_PRODUCT);
  const [loading, setLoading] = useState(!route?.params?.product);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

  // Helper: get seller ID from product.user (could be string or populated object)
  const getSellerId = () => {
    // Always use the hardcoded admin ID as the seller
    return '000000000000000000000000';
  };

  useEffect(() => {
    if (product?._id) {
      loadReviews();
    }
    if (!route?.params?.product && route?.params?.productId) {
      loadProduct();
    }
  }, [route?.params?.productId, product?._id]);

  const loadReviews = async () => {
    try {
      const data = await reviewService.getProductReviews(product._id);
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews', error);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview._id, reviewData, user.token);
      } else {
        await reviewService.createReview(reviewData, user.token);
      }
      setEditingReview(null);
      setShowForm(false);
      loadReviews();
      loadProduct(); // Refresh product avg rating
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save review.');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    const executeDelete = async () => {
      try {
        await reviewService.deleteReview(reviewId, user.token);
        loadReviews();
        loadProduct();
      } catch (error) {
        console.error('Delete error:', error);
        if (Platform.OS === 'web') {
          window.alert(error.response?.data?.message || 'The archive could not be updated. Please try again.');
        } else {
          Alert.alert('Delete Failed', error.response?.data?.message || 'The archive could not be updated.');
        }
      }
    };

    if (Platform.OS === 'web') {
      window.alert('Processing deletion request...');
      executeDelete();
    } else {
      Alert.alert(
        'Delete Review',
        'Are you sure you want to remove this result from the archive?',
        [
          { text: 'CANCEL', style: 'cancel' },
          { 
            text: 'DELETE', 
            style: 'destructive',
            onPress: executeDelete
          }
        ]
      );
    }
  };

  const handleReviewEdit = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const loadProduct = async () => {
    try {
      const data = await productService.getProductById(route.params.productId);
      setProduct(data);
    } catch (error) {
      console.error(error);
      showModal({
        title: 'Error',
        message: 'Product record could not be retrieved from the archive.',
        confirmText: 'RETRY',
        onConfirm: () => {
          hideModal();
          loadProduct();
        },
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    setAddingToCart(true);
    addToCart(product);
    setTimeout(() => {
      setAddingToCart(false);
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
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>GlowHive</Text>
        <CartBadgeIcon />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image area */}
          <View style={styles.imageArea}>
            <View style={styles.mainImageBox}>
              {product.imageUrl ? (
                <Image 
                  source={{ uri: product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_SERVER_URL}${product.imageUrl}` }}
                  style={{ width: '100%', height: '100%', borderRadius: Radius.xl }}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="flask-outline" size={56} color={Colors.primary} />
                  <Text style={styles.placeholderText}>GlowHive Formulation</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.contentPad}>
            {/* Category */}
            <Text style={styles.categoryLabel}>{product.category}</Text>

            {/* Title */}
            <Text style={styles.title}>{product.title}</Text>

            {/* Price */}
            <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
            <Text style={styles.size}>{product.size || '30ML'}</Text>

            {/* Description */}
            <Text style={styles.description}>{product.description || 'No detailed formulation description provided for this archive entry.'}</Text>

            {/* Skin Type Tags */}
            <View style={styles.tagRow}>
              {product.skinTypeTags?.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            {/* Stock warning */}
            {product.stock <= 5 && product.stock > 0 && (
              <Text style={styles.stockAlert}>• ONLY {product.stock} UNITS REMAINING</Text>
            )}

            {/* Add to Cart */}
            <GHButton
              title="ADD TO CART"
              onPress={handleAddToCart}
              loading={addingToCart}
              style={styles.addCartBtn}
              disabled={product.stock === 0}
            />

            {/* 👇 MESSAGE THE SELLER button – visible only to customers */}
            {user && !user.isAdmin && getSellerId() && (
              <GHButton
                title="MESSAGE THE SELLER"
                variant="outline"
                onPress={() => {
                  navigation.navigate('Chat', {
                    sellerId: getSellerId(),
                    productId: product._id,
                    productTitle: product.title,
                  });
                }}
                style={styles.messageBtn}
              />
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Molecular Composition */}
            <Text style={styles.sectionTitle}>Molecular Composition</Text>
            <View style={styles.ingredientsGrid}>
              {(Array.isArray(product.ingredients) ? product.ingredients : 
                 (typeof product.ingredients === 'string' ? product.ingredients.split(',').map(s => s.trim()) : MOCK_PRODUCT.ingredients)
              ).map((ing, i) => (
                <View key={i} style={styles.ingredientChip}>
                  <Text style={styles.ingredientText}>{ing.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Customer Review System — THE SOCIAL PROOF */}
            <View style={{ backgroundColor: '#F0F4F2', padding: 20, borderRadius: 15, marginTop: 40 }}>
              <Text style={{ color: '#2D4B43', fontWeight: '800', marginBottom: 10 }}>● REVIEW MODULE ACTIVE</Text>
              <Text style={styles.sectionTitle}>Customer Testimonials</Text>
              <View style={styles.ratingRow}>
                <StarRating rating={Math.round(product.rating || 0)} size={16} />
                <Text style={styles.ratingNum}>{(product.rating || 0).toFixed(1)} ({product.numReviews || 0} Reviews)</Text>
              </View>

              {user ? (
                showForm ? (
                  <ReviewForm
                    productId={product._id}
                    onSubmit={handleReviewSubmit}
                    initialData={editingReview}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingReview(null);
                    }}
                    token={user.token}
                  />
                ) : (
                  !reviews.find(r => String(r.user) === String(user._id)) && (
                    <GHButton
                      title="WRITE A REVIEW"
                      onPress={() => setShowForm(true)}
                      style={styles.writeReviewBtn}
                      variant="outline"
                    />
                  )
                )
              ) : (
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginToReview}>Login to share your results</Text>
                </TouchableOpacity>
              )}

              <ReviewList
                reviews={reviews}
                onEdit={handleReviewEdit}
                onDelete={handleReviewDelete}
                currentUser={user}
              />
            </View>
          </View>
        </ScrollView>
      )}

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
  headerLogo: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.black,
  },

  // Image area
  imageArea: { paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  mainImageBox: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.xl,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: {
    marginTop: Spacing.sm,
    fontSize: Typography.xs,
    color: Colors.secondary,
    letterSpacing: Typography.wider,
    fontWeight: '600',
  },

  // Content
  contentPad: { paddingHorizontal: Spacing.base, paddingBottom: 150 },
  categoryLabel: {
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.xxl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    lineHeight: 34,
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: Typography.xxl,
    color: Colors.black,
    fontWeight: '700',
    marginBottom: 2,
  },
  size: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    color: Colors.secondary,
    marginBottom: Spacing.base,
  },
  description: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: Spacing.base,
  },
  stockAlert: {
    fontSize: Typography.xs,
    color: Colors.error,
    letterSpacing: Typography.wide,
    fontWeight: '600',
    marginBottom: Spacing.base,
  },
  addCartBtn: { width: '100%', marginBottom: Spacing.xl },
  messageBtn: { marginTop: Spacing.sm, borderColor: Colors.primary }, // 👈 New style
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xl },

  sectionTitle: {
    fontSize: Typography.lg + 2,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.base,
    letterSpacing: -0.2,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.neutralDark,
    borderRadius: Radius.sm,
  },
  tagText: {
    fontSize: Typography.xs - 2,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: Typography.widest,
  },
  ingredientChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  ingredientText: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    color: Colors.secondary,
    fontWeight: '500',
  },

  // Reviews
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  ratingNum: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontWeight: '500',
  },
  writeReviewBtn: { marginBottom: Spacing.xl },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  reviewDate: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    color: Colors.secondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  reviewText: {
    fontSize: Typography.sm,
    color: Colors.black,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  reviewAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { color: Colors.white, fontSize: Typography.xs, fontWeight: '700' },
  reviewAuthor: { fontSize: Typography.xs, fontWeight: '700', color: Colors.black, letterSpacing: Typography.wide },
  loginToReview: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    textDecorationLine: 'underline',
  },
});

export default ProductDetailScreen;