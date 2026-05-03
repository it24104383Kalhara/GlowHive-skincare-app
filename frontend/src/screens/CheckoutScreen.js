import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { BASE_SERVER_URL } from '../services/api';
import GHInput from '../components/GHInput';
import GHButton from '../components/GHButton';
import PaymentModal from '../components/PaymentModal';
import orderService from '../services/orderService';

const SHIPPING_FEE = 15.00;

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  // Shipping form state
  const [fullName, setFullName] = useState(user?.name || '');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Form errors
  const [errors, setErrors] = useState({});

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalAmount = cartTotal + SHIPPING_FEE;

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    switch (field) {
      case 'fullName':
        if (!value.trim()) newErrors.fullName = 'Full name is required';
        else delete newErrors.fullName;
        break;
      case 'contactNumber':
        if (!value.trim()) newErrors.contactNumber = 'Contact number is required';
        else if (!/^[0-9]{10}$/.test(value.replace(/[\s\-]/g, ''))) newErrors.contactNumber = 'Enter a valid phone number (10 digits)';
        else delete newErrors.contactNumber;
        break;
      case 'address':
        if (!value.trim()) newErrors.address = 'Address is required';
        else if (value.trim().length < 10) newErrors.address = 'Please enter a complete address';
        else delete newErrors.address;
        break;
      case 'postalCode':
        if (!value.trim()) newErrors.postalCode = 'Postal code is required';
        else if (!/^[0-9]{5}$/.test(value.trim())) newErrors.postalCode = 'Must be a 5-digit postal code';
        else delete newErrors.postalCode;
        break;
    }
    setErrors(newErrors);
    return !newErrors[field];
  };

  const validateAll = () => {
    console.log('[Checkout] Validating fields...', { fullName, contactNumber, address, postalCode });
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else {
      const cleanPhone = contactNumber.replace(/[\s\-\+]/g, '');
      if (cleanPhone.length < 9 || cleanPhone.length > 12) {
        newErrors.contactNumber = 'Enter a valid phone number';
      }
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    } else if (address.trim().length < 5) { // Relaxed from 10 to 5
      newErrors.address = 'Please enter a complete address';
    }

    if (!postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else {
      const cleanPostal = postalCode.trim();
      if (cleanPostal.length < 4 || cleanPostal.length > 6) {
        newErrors.postalCode = 'Invalid postal code format';
      }
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[Checkout] Validation result:', isValid, newErrors);
    return isValid;
  };

  const buildOrderData = (cardLastFour = null) => ({
    orderItems: cartItems.map(item => ({
      product: item._id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    })),
    shippingInfo: {
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
    },
    paymentMethod,
    ...(cardLastFour ? { cardLastFour } : {}),
  });

  const handleProceed = () => {
    console.log('[Checkout] Proceed button clicked. Items in cart:', cartItems.length);
    
    if (cartItems.length === 0) {
      Alert.alert('Empty Bag', 'Your bag is empty. Please add items before checking out.');
      return;
    }

    if (!validateAll()) {
      console.log('[Checkout] Validation failed. Order aborted.');
      return;
    }

    if (paymentMethod === 'card') {
      console.log('[Checkout] Opening payment modal');
      setShowPaymentModal(true);
    } else {
      console.log('[Checkout] Placing COD order');
      handleCODOrder();
    }
  };

  const handleCODOrder = async () => {
    setLoading(true);
    console.log('[Checkout] Starting handleCODOrder...');
    try {
      const orderData = buildOrderData();
      console.log('[Checkout] Sending order data:', orderData);
      const order = await orderService.createOrder(orderData, user.token);
      console.log('[Checkout] Order created successfully:', order._id);
      clearCart();
      navigation.replace('OrderConfirmation', { order });
    } catch (error) {
      console.error('[Checkout] handleCODOrder error:', error);
      const msg = error.response?.data?.message || 'Failed to place order. Please try again.';
      Alert.alert('Order Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPaymentSuccess = async (cardLastFour) => {
    setShowPaymentModal(false);
    setLoading(true);
    try {
      const orderData = buildOrderData(cardLastFour);
      const order = await orderService.createOrder(orderData, user.token);
      clearCart();
      navigation.replace('OrderConfirmation', { order });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to place order. Please try again.';
      Alert.alert('Order Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Summary */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionEyebrow}>ORDER SUMMARY</Text>
            <Text style={styles.sectionTitle}>Your Bag</Text>
            {cartItems.map(item => {
              const imageUrl = item.imageUrl
                ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_SERVER_URL}${item.imageUrl}`)
                : null;
              return (
                <View key={item._id} style={styles.orderItem}>
                  <View style={styles.orderItemImageBox}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.orderItemImage} />
                    ) : (
                      <Ionicons name="flask-outline" size={18} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.orderItemMeta}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              );
            })}
          </View>

          {/* Shipping Information */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionEyebrow}>DELIVERY DETAILS</Text>
            <Text style={styles.sectionTitle}>Shipping Information</Text>

            <GHInput
              label="FULL NAME"
              value={fullName}
              onChangeText={(v) => { setFullName(v); if (errors.fullName) validateField('fullName', v); }}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.fullName}
              onBlur={() => validateField('fullName', fullName)}
            />
            <GHInput
              label="CONTACT NUMBER"
              value={contactNumber}
              onChangeText={(v) => {
                const cleaned = v.replace(/[^0-9]/g, '');
                setContactNumber(cleaned);
                if (errors.contactNumber) validateField('contactNumber', cleaned);
              }}
              placeholder="e.g. 0771234567"
              keyboardType="phone-pad"
              error={errors.contactNumber}
              onBlur={() => validateField('contactNumber', contactNumber)}
            />
            <GHInput
              label="DELIVERY ADDRESS"
              value={address}
              onChangeText={(v) => { setAddress(v); if (errors.address) validateField('address', v); }}
              placeholder="Street, city, state"
              autoCapitalize="words"
              error={errors.address}
              onBlur={() => validateField('address', address)}
            />
            <GHInput
              label="POSTAL CODE"
              value={postalCode}
              onChangeText={(v) => {
                const cleaned = v.replace(/[^0-9]/g, '').slice(0, 5);
                setPostalCode(cleaned);
                if (errors.postalCode) validateField('postalCode', cleaned);
              }}
              placeholder="e.g. 10100"
              keyboardType="number-pad"
              error={errors.postalCode}
              onBlur={() => validateField('postalCode', postalCode)}
            />
          </View>

          {/* Payment Method */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionEyebrow}>PAYMENT</Text>
            <Text style={styles.sectionTitle}>Select Method</Text>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentMethod === 'card' && styles.paymentCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setPaymentMethod('card')}
              >
                <View style={[styles.paymentIconBox, { backgroundColor: '#E8EAF6' }]}>
                  <Ionicons name="card-outline" size={26} color="#3F51B5" />
                </View>
                <Text style={[
                  styles.paymentLabel,
                  paymentMethod === 'card' && styles.paymentLabelActive,
                ]}>Card{'\n'}Payment</Text>
                {paymentMethod === 'card' && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentMethod === 'cod' && styles.paymentCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setPaymentMethod('cod')}
              >
                <View style={[styles.paymentIconBox, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="cube-outline" size={26} color="#E65100" />
                </View>
                <Text style={[
                  styles.paymentLabel,
                  paymentMethod === 'cod' && styles.paymentLabelActive,
                ]}>Cash on{'\n'}Delivery</Text>
                {paymentMethod === 'cod' && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionEyebrow}>TOTAL</Text>
            <Text style={styles.sectionTitle}>Price Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>${SHIPPING_FEE.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <GHButton
          title={
            paymentMethod === 'card'
              ? `PAY $${totalAmount.toFixed(2)}`
              : `PLACE ORDER — $${totalAmount.toFixed(2)}`
          }
          onPress={handleProceed}
          loading={loading}
          disabled={loading}
        />
      </View>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handleCardPaymentSuccess}
        totalAmount={totalAmount}
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
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.base },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
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
    fontSize: Typography.xl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutralDark,
  },
  orderItemImageBox: {
    width: 48,
    height: 48,
    backgroundColor: Colors.neutral,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orderItemImage: {
    width: '100%',
    height: '100%',
  },
  orderItemInfo: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  orderItemTitle: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.black,
  },
  orderItemMeta: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.primary,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  paymentCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.neutral,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  paymentCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  paymentIconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  paymentLabel: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  paymentLabelActive: {
    color: Colors.black,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  bottomBar: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    ...Shadow.lg,
  },
});

export default CheckoutScreen;
