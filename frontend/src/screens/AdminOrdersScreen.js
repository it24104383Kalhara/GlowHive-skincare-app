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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUS_COLORS = {
  processing: { bg: '#FFF3E0', text: '#E65100', icon: 'hourglass-outline' },
  shipped: { bg: '#E3F2FD', text: '#1565C0', icon: 'airplane-outline' },
  delivered: { bg: '#E8F5E9', text: '#2E7D32', icon: 'checkmark-circle-outline' },
  cancelled: { bg: '#FFEBEE', text: '#C62828', icon: 'close-circle-outline' },
};

const AdminOrdersScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await orderService.getAllOrders(user.token);
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

  const handleUpdateStatus = (id, newStatus) => {
    console.log(`[AdminOrders] handleUpdateStatus clicked for ID: ${id}, Status: ${newStatus}`);
    
    const onConfirm = async () => {
      console.log(`[AdminOrders] Proceeding with update to ${newStatus}...`);
      try {
        setLoading(true);
        const response = await orderService.updateOrderStatus(id, newStatus, user.token);
        console.log('[AdminOrders] Update successful:', response);
        fetchOrders();
      } catch (error) {
        console.error('[AdminOrders] Failed to update status:', error);
        const msg = error.response?.data?.message || 'Failed to update the order status.';
        if (Platform.OS === 'web') {
          window.alert('Error: ' + msg);
        } else {
          Alert.alert('Error', msg);
        }
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
        onConfirm();
      } else {
        console.log('[AdminOrders] Update cancelled by user');
      }
    } else {
      Alert.alert(
        'Update Order Status',
        `Are you sure you want to mark this order as ${newStatus}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => console.log('[AdminOrders] Update cancelled by user') },
          {
            text: 'Yes, Update',
            style: newStatus === 'cancelled' ? 'destructive' : 'default',
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Summary stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const processingCount = orders.filter(o => o.orderStatus === 'processing').length;
  const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length;

  const renderOrderCard = ({ item }) => {
    const isExpanded = expandedId === item._id;
    const orderId = item._id.slice(-8).toUpperCase();
    const statusStyle = STATUS_COLORS[item.orderStatus] || STATUS_COLORS.processing;
    const isCard = item.paymentMethod === 'card';
    const customerName = item.user?.name || item.shippingInfo?.fullName || 'Unknown';
    const customerEmail = item.user?.email || '';

    return (
      <View style={styles.orderCard}>
        {/* Header - Now the only part that toggles expansion */}
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.7}
          onPress={() => toggleExpand(item._id)}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.orderId}>#{orderId}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Ionicons name={statusStyle.icon} size={12} color={statusStyle.text} />
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {item.orderStatus.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.customerName}>{customerName}</Text>
            {customerEmail ? (
              <Text style={styles.customerEmail}>{customerEmail}</Text>
            ) : null}
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.secondary}
          />
        </TouchableOpacity>

        {/* Summary Row */}
        <View style={styles.summaryStrip}>
          <View style={styles.summaryChip}>
            <Ionicons name="calendar-outline" size={13} color={Colors.secondary} />
            <Text style={styles.summaryChipText}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Ionicons
              name={isCard ? 'card-outline' : 'cube-outline'}
              size={13}
              color={Colors.secondary}
            />
            <Text style={styles.summaryChipText}>{isCard ? 'Card' : 'COD'}</Text>
          </View>
          <Text style={styles.orderTotal}>${item.totalAmount.toFixed(2)}</Text>
        </View>

        {/* Expanded */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.expandDivider} />

            {/* Items */}
            <Text style={styles.expandLabel}>ORDER ITEMS</Text>
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
            <Text style={[styles.expandLabel, { marginTop: Spacing.base }]}>DELIVERY ADDRESS</Text>
            <Text style={styles.expandInfoText}>{item.shippingInfo.fullName}</Text>
            <Text style={styles.expandInfoText}>{item.shippingInfo.address}</Text>
            <Text style={styles.expandInfoText}>
              {item.shippingInfo.postalCode} • {item.shippingInfo.contactNumber}
            </Text>

            {/* Payment */}
            <Text style={[styles.expandLabel, { marginTop: Spacing.base }]}>PAYMENT DETAILS</Text>
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

            <View style={styles.adminActions}>
              <Text style={styles.expandLabel}>UPDATE STATUS</Text>
              <View style={styles.actionButtonsRow}>
                {item.orderStatus !== 'shipped' && item.orderStatus !== 'delivered' && item.orderStatus !== 'cancelled' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnShipped]}
                    onPress={() => handleUpdateStatus(item._id, 'shipped')}
                  >
                    <Text style={[styles.actionBtnText, { color: '#1565C0' }]}>MARK SHIPPED</Text>
                  </TouchableOpacity>
                )}
                {item.orderStatus === 'shipped' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDelivered]}
                    onPress={() => handleUpdateStatus(item._id, 'delivered')}
                  >
                    <Text style={[styles.actionBtnText, { color: '#2E7D32' }]}>MARK DELIVERED</Text>
                  </TouchableOpacity>
                )}
                {item.orderStatus !== 'cancelled' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnCancel]}
                    onPress={() => handleUpdateStatus(item._id, 'cancelled')}
                  >
                    <Text style={[styles.actionBtnText, { color: '#C62828' }]}>CANCEL ORDER</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

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
        <Text style={styles.headerTitle}>All Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#E65100' }]}>{processingCount}</Text>
          <Text style={styles.statLabel}>PENDING</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2E7D32' }]}>{deliveredCount}</Text>
          <Text style={styles.statLabel}>DELIVERED</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>${totalRevenue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>REVENUE</Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="receipt-outline" size={72} color={Colors.neutralDark} />
          <Text style={styles.emptyTitle}>No Orders</Text>
          <Text style={styles.emptySub}>Orders placed by customers will appear here.</Text>
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
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginHorizontal: 3,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statValue: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Georgia',
  },
  statLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 2,
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  orderId: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Georgia',
  },
  customerName: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 4,
  },
  customerEmail: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
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
  adminActions: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
    minWidth: '45%',
  },
  actionBtnShipped: {
    backgroundColor: '#E3F2FD',
    borderColor: '#BBDEFB',
  },
  actionBtnDelivered: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  actionBtnCancel: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default AdminOrdersScreen;
