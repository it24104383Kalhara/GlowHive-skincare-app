import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { BASE_SERVER_URL } from '../services/api';

/**
 * Product Card Component
 * Matches the tall card style in the Product List sketch:
 * full-height product image, price tag, name, and ADD TO BAG button
 */
const ProductCard = ({ product, onPress, onAddToCart }) => {
  const imageUrl = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_SERVER_URL}${product.imageUrl}`)
    : 'https://via.placeholder.com/300x300/F2F0ED/2D4B43?text=GlowHive';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category || 'SERUM COLLECTION'}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
        {product.stock <= 5 && product.stock > 0 && (
          <Text style={styles.lowStock}>• ONLY {product.stock} UNITS REMAINING</Text>
        )}
        {product.stock === 0 && (
          <Text style={styles.outOfStock}>• OUT OF STOCK</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddToCart}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>ADD TO BAG</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    marginBottom: Spacing.base,
    marginHorizontal: Spacing.base,
    overflow: 'hidden',
    ...Shadow.md,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: Colors.neutralDark,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.overlay,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  categoryText: {
    color: Colors.white,
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    fontWeight: '600',
  },
  info: {
    padding: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  name: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Georgia',
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: Typography.md,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  lowStock: {
    fontSize: Typography.xs,
    color: Colors.error,
    letterSpacing: Typography.wide,
    fontWeight: '600',
  },
  outOfStock: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    letterSpacing: Typography.wide,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: Radius.pill,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
    fontWeight: '700',
  },
});

export default ProductCard;
