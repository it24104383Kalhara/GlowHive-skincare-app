import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import GHButton from '../components/GHButton';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { order } = route.params;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isCard = order.paymentMethod === 'card';
  const orderId = order._id ? order._id.slice(-8).toUpperCase() : 'N/A';
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark" size={56} color={Colors.white} />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.heading}>Order Placed</Text>
          <Text style={styles.subheading}>Your order has been placed successfully!</Text>

          {/* Order ID Card */}
          <View style={[styles.cardBase, styles.orderIdCard]}>
            <Text style={styles.orderIdLabel}>ORDER ID</Text>
            <Text style={styles.orderIdValue}>#{orderId}</Text>
            <Text style={styles.orderDate}>{orderDate}</Text>
          </View>

          {/* Order Items */}
          <View style={[styles.cardBase, styles.sectionCard]}>
            <Text style={styles.sectionEyebrow}>ITEMS ORDERED</Text>
            <Text style={styles.sectionTitle}>
              {order.orderItems.length} {order.orderItems.length === 1 ? 'Item' : 'Items'}
            </Text>
            {order.orderItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemDot} />
                <Text style={styles.itemName} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Shipping Info */}
          <View style={[styles.cardBase, styles.sectionCard]}>
            <Text style={styles.sectionEyebrow}>DELIVERY DETAILS</Text>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={Colors.secondary} />
              <Text style={styles.infoText}>{order.shippingInfo.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color={Colors.secondary} />
              <Text style={styles.infoText}>{order.shippingInfo.contactNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={Colors.secondary} />
              <Text style={styles.infoText}>{order.shippingInfo.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={16} color={Colors.secondary} />
              <Text style={styles.infoText}>{order.shippingInfo.postalCode}</Text>
            </View>
          </View>

          {/* Payment Info */}
          <View style={[styles.cardBase, styles.sectionCard]}>
            <Text style={styles.sectionEyebrow}>PAYMENT</Text>
            <View style={styles.paymentRow}>
              <View style={[styles.paymentBadge, { backgroundColor: isCard ? '#E8EAF6' : '#FFF3E0' }]}>
                <Ionicons
                  name={isCard ? 'card-outline' : 'cube-outline'}
                  size={20}
                  color={isCard ? '#3F51B5' : '#E65100'}
                />
              </View>
              <View>
                <Text style={styles.paymentMethodText}>
                  {isCard ? 'Card Payment' : 'Cash on Delivery'}
                </Text>
                {isCard && order.cardLastFour && (
                  <Text style={styles.cardLastFour}>•••• {order.cardLastFour}</Text>
                )}
              </View>
              <View style={{ flex: 1 }} />
              <View style={[
                styles.statusBadge,
                { backgroundColor: order.paymentStatus === 'paid' ? '#E8F5E9' : '#FFF3E0' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: order.paymentStatus === 'paid' ? '#2E7D32' : '#E65100' }
                ]}>
                  {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                </Text>
              </View>
            </View>

            {!isCard && (
              <View style={styles.codNote}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.secondary} />
                <Text style={styles.codNoteText}>
                  Payment of ${order.totalAmount.toFixed(2)} will be collected upon delivery.
                </Text>
              </View>
            )}

            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          {/* Actions */}
          <GHButton
            title="VIEW MY ORDERS"
            onPress={() => navigation.replace('MyOrders')}
            style={{ marginBottom: Spacing.base, width: '100%' }}
          />
          <GHButton
            title="CONTINUE SHOPPING"
            variant="outline"
            onPress={() => navigation.replace('MainTabs')}
            style={{ width: '100%' }}
          />

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  scrollContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
    ...Shadow.md,
  },
  heading: {
    fontSize: Typography.xxl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: Typography.base,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  cardBase: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  orderIdCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    marginBottom: Spacing.base,
    alignItems: 'center',
    ...Shadow.sm,
  },
  orderIdLabel: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  orderIdValue: {
    fontSize: Typography.xxl,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'Georgia',
    letterSpacing: 2,
  },
  orderDate: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  sectionEyebrow: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.base,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: '500',
    color: Colors.black,
  },
  itemQty: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontWeight: '600',
    marginHorizontal: Spacing.sm,
  },
  itemPrice: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.base,
    color: Colors.black,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  paymentMethodText: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.black,
  },
  cardLastFour: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: Typography.wide,
  },
  codNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: Radius.sm,
    padding: Spacing.base,
    marginTop: Spacing.base,
  },
  codNoteText: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.base,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Typography.lg,
    fontWeight: '700',
    fontFamily: 'Georgia',
    color: Colors.black,
  },
  totalValue: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default OrderConfirmationScreen;
