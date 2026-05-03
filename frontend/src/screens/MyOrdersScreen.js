import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { AuthContext } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import GHButton from '../components/GHButton';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUS_COLORS = {
  processing: { bg: '#FFF3E0', text: '#E65100' },
  shipped: { bg: '#E3F2FD', text: '#1565C0' },
  delivered: { bg: '#E8F5E9', text: '#2E7D32' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
};

const MyOrdersScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await orderService.getMyOrders(user.token);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCancelOrder = (id) => {
    console.log(`[MyOrders] handleCancelOrder clicked for ID: ${id}`);
    
    const onConfirm = async () => {
      console.log(`[MyOrders] Proceeding with cancellation for ${id}...`);
      try {
        setLoading(true);
        await orderService.cancelOrder(id, user.token);
        console.log('[MyOrders] Order cancelled successfully');
        fetchOrders();
      } catch (error) {
        console.error('[MyOrders] Failed to cancel order:', error);
        const msg = error.response?.data?.message || 'Failed to cancel the order.';
        if (Platform.OS === 'web') {
          window.alert('Error: ' + msg);
        } else {
          Alert.alert('Error', msg);
        }
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
        onConfirm();
      } else {
        console.log('[MyOrders] Cancel aborted by user');
      }
    } else {
      Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order? This action cannot be undone.',
        [
          { text: 'No', style: 'cancel', onPress: () => console.log('[MyOrders] Cancel aborted by user') },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: onConfirm
          }
        ]
      );
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderOrderCard = ({ item }) => {
    const isExpanded = expandedId === item._id;
    const orderId = item._id.slice(-8).toUpperCase();
    const statusStyle = STATUS_COLORS[item.orderStatus] || STATUS_COLORS.processing;
    const isCard = item.paymentMethod === 'card';

    return (
      <View style={styles.orderCard}>
        {/* Header Row - Now the trigger for expansion */}
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.7}
          onPress={() => toggleExpand(item._id)}
        >
          <View>
            <Text style={styles.orderId}>#{orderId}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.orderStatus.toUpperCase()}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.secondary}
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>

        {/* Summary Row */}
        <View style={styles.summaryStrip}>
          <View style={styles.summaryChip}>
            <Ionicons name="bag-handle-outline" size={14} color={Colors.secondary} />
            <Text style={styles.summaryChipText}>
              {item.orderItems.reduce((sum, i) => sum + i.quantity, 0)} Items
            </Text>
          </View>
          <View style={styles.summaryChip}>
            <Ionicons
              name={isCard ? 'card-outline' : 'cube-outline'}
              size={14}
              color={Colors.secondary}
            />
            <Text style={styles.summaryChipText}>
              {isCard ? 'Card' : 'COD'}
            </Text>
          </View>
          <Text style={styles.orderTotal}>${item.totalAmount.toFixed(2)}</Text>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.expandDivider} />

            {/* Items */}
            <Text style={styles.expandLabel}>ITEMS</Text>
            {item.orderItems.map((orderItem, idx) => (
              <View key={idx} style={styles.expandItemRow}>
                <View style={styles.expandDot} />
                <Text style={styles.expandItemName} numberOfLines={1}>{orderItem.title}</Text>
                <Text style={styles.expandItemQty}>×{orderItem.quantity}</Text>
                <Text style={styles.expandItemPrice}>
                  ${(orderItem.price * orderItem.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Shipping */}
            <Text style={[styles.expandLabel, { marginTop: Spacing.base }]}>DELIVERY TO</Text>
            <Text style={styles.expandInfoText}>{item.shippingInfo.fullName}</Text>
            <Text style={styles.expandInfoText}>{item.shippingInfo.address}</Text>
            <Text style={styles.expandInfoText}>
              {item.shippingInfo.postalCode} • {item.shippingInfo.contactNumber}
            </Text>

            {/* Payment */}
            <Text style={[styles.expandLabel, { marginTop: Spacing.base }]}>PAYMENT</Text>
            <View style={styles.expandPayRow}>
              <Text style={styles.expandInfoText}>
                {isCard ? `Card •••• ${item.cardLastFour || '****'}` : 'Cash on Delivery'}
              </Text>
              <View style={[
                styles.payStatusBadge,
                { backgroundColor: item.paymentStatus === 'paid' ? '#E8F5E9' : '#FFF3E0' }
              ]}>
                <Text style={[
                  styles.payStatusText,
                  { color: item.paymentStatus === 'paid' ? '#2E7D32' : '#E65100' }
                ]}>
                  {item.paymentStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Totals */}
            <View style={[styles.expandDivider, { marginTop: Spacing.base }]} />
            <View style={styles.expandTotalRow}>
              <Text style={styles.expandTotalLabel}>Subtotal</Text>
              <Text style={styles.expandTotalValue}>${item.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.expandTotalRow}>
              <Text style={styles.expandTotalLabel}>Shipping</Text>
              <Text style={styles.expandTotalValue}>${item.shippingFee.toFixed(2)}</Text>
            </View>
            <View style={styles.expandTotalRow}>
              <Text style={styles.expandGrandLabel}>Total</Text>
              <Text style={styles.expandGrandValue}>${item.totalAmount.toFixed(2)}</Text>
            </View>

            {item.orderStatus === 'processing' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(item._id)}
              >
                <Text style={styles.cancelButtonText}>CANCEL ORDER</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={72} color={Colors.neutralDark} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySub}>
            Your order history will appear here once you make your first purchase.
          </Text>
          <GHButton
            title="EXPLORE CATALOGUE"
            onPress={() => navigation.navigate('MainTabs')}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
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
  list: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Georgia',
  },
  orderDate: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: Typography.wide,
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginRight: Spacing.sm,
  },
  summaryChipText: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderTotal: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 'auto',
  },
  expandedSection: {
    marginTop: Spacing.sm,
  },
  expandDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.base,
  },
  expandLabel: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: Spacing.sm,
  },
  expandItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  expandDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  expandItemName: {
    flex: 1,
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.black,
  },
  expandItemQty: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    fontWeight: '600',
    marginHorizontal: Spacing.sm,
  },
  expandItemPrice: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  expandInfoText: {
    fontSize: Typography.sm,
    color: Colors.black,
    lineHeight: 20,
  },
  expandPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payStatusBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  payStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  expandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expandTotalLabel: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontWeight: '500',
  },
  expandTotalValue: {
    fontSize: Typography.sm,
    color: Colors.black,
    fontWeight: '600',
  },
  expandGrandLabel: {
    fontSize: Typography.md,
    fontWeight: '700',
    fontFamily: 'Georgia',
    color: Colors.black,
  },
  expandGrandValue: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: Spacing.lg,
  },
  cancelButtonText: {
    color: '#C62828',
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default MyOrdersScreen;
