import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { BASE_SERVER_URL } from '../services/api';
import GHButton from '../components/GHButton';
import GHModal from '../components/GHModal';

const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useContext(CartContext);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => { },
    variant: 'primary'
  });

  const showModal = (config) => {
    setModalConfig({ ...config, visible: true });
  };

  const hideModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    showModal({
      title: 'Proceed to Checkout',
      message: 'This feature is coming soon in the next clinical update. Would you like to keep exploring?',
      confirmText: 'KEEP EXPLORING',
      onConfirm: () => {
        hideModal();
        navigation.navigate('Catalogue');
      },
      variant: 'primary'
    });
  };

  const handleRemoveItem = (item) => {
    showModal({
      title: 'Remove Product',
      message: `Are you sure you want to remove "${item.title}" from your shopping bag?`,
      confirmText: 'REMOVE',
      onConfirm: () => {
        removeFromCart(item._id);
        hideModal();
      },
      variant: 'danger'
    });
  };

  const renderCartItem = ({ item }) => {
    const imageUrl = item.imageUrl
      ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_SERVER_URL}${item.imageUrl}`)
      : null;

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemImageBox}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.itemImage} />
          ) : (
            <Ionicons name="flask-outline" size={24} color={Colors.primary} />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemCategory}>{item.category || 'FORMULATION'}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => updateQuantity(item._id, -1)}
              style={styles.qtyBtn}
            >
              <Ionicons name="remove" size={16} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item._id, 1)}
              style={styles.qtyBtn}
            >
              <Ionicons name="add" size={16} color={Colors.black} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveItem(item)}
          style={styles.removeBtn}
        >
          <Ionicons name="close-circle-outline" size={22} color={Colors.secondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Bag</Text>
        <TouchableOpacity onPress={() => cartItems.length > 0 &&
          showModal({
            title: 'Clear Bag',
            message: 'Are you sure you want to remove all formulations from your archive?',
            confirmText: 'CLEAR ALL',
            onConfirm: () => {
              clearCart();
              hideModal();
            },
            variant: 'danger'
          })}>
          <Text style={[styles.headerClear, { opacity: cartItems.length > 0 ? 1 : 0.3 }]}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-handle-outline" size={80} color={Colors.neutralDark} />
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse our clinical formulations and add them to your archive.
          </Text>
          <GHButton
            title="EXPLORE CATALOGUE"
            onPress={() => navigation.navigate('Catalogue')}
            style={styles.exploreBtn}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={item => item._id}
            renderItem={renderCartItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping (Clinical Logistics)</Text>
              <Text style={styles.summaryValue}>$15.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${(cartTotal + 15).toFixed(2)}</Text>
            </View>

            <GHButton
              title="PROCEED TO CHECKOUT"
              onPress={handleCheckout}
              style={styles.checkoutBtn}
            />
          </View>
        </View>
      )}

      <GHModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onCancel={hideModal}
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
  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Georgia',
  },
  headerClear: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: Typography.wide,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  itemImageBox: {
    width: 90,
    height: 90,
    backgroundColor: Colors.neutralDark,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: Typography.xs - 1,
    color: Colors.secondary,
    letterSpacing: Typography.wide,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral,
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    padding: 2,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    paddingHorizontal: 12,
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.black,
  },
  removeBtn: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xxl,
  },
  exploreBtn: {
    width: '100%',
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    ...Shadow.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: Typography.sm,
    color: Colors.black,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.base,
  },
  totalLabel: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Georgia',
  },
  totalValue: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  checkoutBtn: {
    marginTop: Spacing.xl,
  },
});

export default CartScreen;
