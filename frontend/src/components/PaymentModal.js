import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import GHButton from './GHButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 64;
const CARD_HEIGHT = CARD_WIDTH * 0.58;

const PaymentModal = ({ visible, onClose, onPaymentSuccess, totalAmount }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentState, setPaymentState] = useState('idle');
  const flipAnim = useRef(new Animated.Value(0)).current;
  const isFlipped = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (paymentState === 'processing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [paymentState]);

  useEffect(() => {
    if (paymentState === 'success') {
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      successScale.setValue(0);
    }
  }, [paymentState]);

  const flipToBack = () => {
    if (!isFlipped.current) {
      isFlipped.current = true;
      Animated.spring(flipAnim, {
        toValue: 180,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  };

  const flipToFront = () => {
    if (isFlipped.current) {
      isFlipped.current = false;
      Animated.spring(flipAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: ['0deg', '90deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: ['180deg', '270deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const displayCardNumber = () => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.length === 0) return '•••• •••• •••• ••••';
    let display = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) display += '  ';
      display += raw[i] || '•';
    }
    return display;
  };

  const validate = () => {
    const newErrors = {};
    const rawNumber = cardNumber.replace(/\s/g, '');
    if (rawNumber.length !== 16) newErrors.cardNumber = 'Must be 16 digits';
    if (!cardName.trim()) newErrors.cardName = 'Cardholder name required';
    const rawExpiry = expiry.replace('/', '');
    if (rawExpiry.length !== 4) newErrors.expiry = 'Must be MM/YY';
    else {
      const month = parseInt(rawExpiry.slice(0, 2));
      if (month < 1 || month > 12) newErrors.expiry = 'Invalid month';
    }
    if (cvv.length !== 3) newErrors.cvv = 'Must be 3 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async () => {
    if (!validate()) return;

    setPaymentState('processing');
    setProcessing(true);

    const rawNumber = cardNumber.replace(/\s/g, '');

    // Simulated payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate failure for testing 
    if (rawNumber.startsWith('0000')) {
      setPaymentState('failure');
      setProcessing(false);
      return;
    }

    setPaymentState('success');
    setProcessing(false);

    // Auto-navigate after success animation
    setTimeout(() => {
      const lastFour = rawNumber.slice(-4);
      resetState();
      onPaymentSuccess(lastFour);
    }, 1500);
  };

  const handleRetry = () => {
    setPaymentState('idle');
    setErrors({});
  };

  const resetState = () => {
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
    setErrors({});
    setPaymentState('idle');
    setProcessing(false);
    flipAnim.setValue(0);
    isFlipped.current = false;
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const renderOverlay = () => {
    if (paymentState === 'processing') {
      return (
        <View style={styles.overlayState}>
          <Animated.View style={[styles.stateIconBox, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="card" size={48} color={Colors.primary} />
          </Animated.View>
          <Text style={styles.stateTitle}>Processing Payment...</Text>
          <Text style={styles.stateSub}>Please wait while we verify your card</Text>
        </View>
      );
    }
    if (paymentState === 'success') {
      return (
        <View style={styles.overlayState}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
            <Ionicons name="checkmark" size={48} color={Colors.white} />
          </Animated.View>
          <Text style={styles.stateTitle}>Payment Successful!</Text>
          <Text style={styles.stateSub}>Redirecting to confirmation...</Text>
        </View>
      );
    }
    if (paymentState === 'failure') {
      return (
        <View style={styles.overlayState}>
          <View style={styles.failCircle}>
            <Ionicons name="close" size={48} color={Colors.white} />
          </View>
          <Text style={styles.stateTitle}>Payment Failed</Text>
          <Text style={styles.stateSub}>Please check your card details and try again</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryBtnText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Card Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        {paymentState !== 'idle' ? renderOverlay() : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.scrollPad}
              showsVerticalScrollIndicator={false}
            >
              {/* Card Visual */}
              <View style={styles.cardContainer}>
                {/* Front Face */}
                <Animated.View
                  style={[
                    styles.cardFace,
                    styles.cardFront,
                    {
                      transform: [{ perspective: 1000 }, { rotateY: frontInterpolate }],
                      opacity: frontOpacity,
                    },
                  ]}
                >
                  <View style={styles.cardChipRow}>
                    <View style={styles.chip}>
                      <View style={styles.chipLine} />
                      <View style={[styles.chipLine, { width: 20 }]} />
                    </View>
                    <Ionicons name="wifi-outline" size={22} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: '90deg' }] }} />
                  </View>
                  <Text style={styles.cardNumberDisplay}>{displayCardNumber()}</Text>
                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.cardSmallLabel}>CARDHOLDER</Text>
                      <Text style={styles.cardInfoText}>{cardName || 'YOUR NAME'}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardSmallLabel}>EXPIRES</Text>
                      <Text style={styles.cardInfoText}>{expiry || 'MM/YY'}</Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Back Face */}
                <Animated.View
                  style={[
                    styles.cardFace,
                    styles.cardBack,
                    {
                      transform: [{ perspective: 1000 }, { rotateY: backInterpolate }],
                      opacity: backOpacity,
                    },
                  ]}
                >
                  <View style={styles.magneticStripe} />
                  <View style={styles.cvvStrip}>
                    <Text style={styles.cvvLabel}>CVV</Text>
                    <View style={styles.cvvBox}>
                      <Text style={styles.cvvDisplay}>{cvv || '•••'}</Text>
                    </View>
                  </View>
                  <Text style={styles.backDisclaimer}>
                    This is a simulated card payment
                  </Text>
                </Animated.View>
              </View>

              {/* Input Fields */}
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>CARD NUMBER</Text>
                <View style={[styles.inputBox, errors.cardNumber && styles.inputBoxError]}>
                  <Ionicons name="card-outline" size={20} color={Colors.secondary} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.inputText}
                    value={cardNumber}
                    onChangeText={(t) => {
                      setCardNumber(formatCardNumber(t));
                      flipToFront();
                    }}
                    onFocus={flipToFront}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={Colors.secondary}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>
                {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}

                <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
                <View style={[styles.inputBox, errors.cardName && styles.inputBoxError]}>
                  <Ionicons name="person-outline" size={20} color={Colors.secondary} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.inputText}
                    value={cardName}
                    onChangeText={(t) => {
                      setCardName(t);
                      flipToFront();
                    }}
                    onFocus={flipToFront}
                    placeholder="Full name on card"
                    placeholderTextColor={Colors.secondary}
                    autoCapitalize="characters"
                  />
                </View>
                {errors.cardName && <Text style={styles.errorText}>{errors.cardName}</Text>}

                <View style={styles.rowFields}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.inputLabel}>EXPIRY DATE</Text>
                    <View style={[styles.inputBox, errors.expiry && styles.inputBoxError]}>
                      <TextInput
                        style={styles.inputText}
                        value={expiry}
                        onChangeText={(t) => {
                          setExpiry(formatExpiry(t));
                          flipToFront();
                        }}
                        onFocus={flipToFront}
                        placeholder="MM/YY"
                        placeholderTextColor={Colors.secondary}
                        keyboardType="number-pad"
                        maxLength={5}
                      />
                    </View>
                    {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <View style={[styles.inputBox, errors.cvv && styles.inputBoxError]}>
                      <TextInput
                        style={styles.inputText}
                        value={cvv}
                        onChangeText={(t) => {
                          const cleaned = t.replace(/[^0-9]/g, '').slice(0, 3);
                          setCvv(cleaned);
                        }}
                        onFocus={flipToBack}
                        onBlur={flipToFront}
                        placeholder="•••"
                        placeholderTextColor={Colors.secondary}
                        keyboardType="number-pad"
                        maxLength={3}
                        secureTextEntry
                      />
                    </View>
                    {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
                  </View>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>AMOUNT TO PAY</Text>
                <Text style={styles.amountValue}>${totalAmount.toFixed(2)}</Text>
              </View>

              <GHButton
                title="PAY NOW"
                onPress={handlePayNow}
                loading={processing}
                disabled={processing}
                style={{ marginTop: Spacing.base }}
              />

              <TouchableOpacity onPress={handleClose} style={styles.cancelLink}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: 54,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.neutral,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: Typography.md,
    fontWeight: '700',
    fontFamily: 'Georgia',
    color: Colors.black,
  },
  scrollPad: {
    padding: Spacing.xl,
  },

  // ── Card Visual ──
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
    marginBottom: Spacing.xxl,
  },
  cardFace: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Radius.lg,
    backfaceVisibility: 'hidden',
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  cardFront: {
    backgroundColor: Colors.primary,
    ...Shadow.lg,
  },
  cardBack: {
    backgroundColor: Colors.primaryDark,
    ...Shadow.lg,
    padding: 0,
  },
  cardChipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    width: 40,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    padding: 6,
    justifyContent: 'space-around',
  },
  chipLine: {
    width: 28,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
  },
  cardNumberDisplay: {
    fontSize: 20,
    letterSpacing: 3,
    color: Colors.white,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardSmallLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginBottom: 3,
  },
  cardInfoText: {
    fontSize: Typography.sm,
    color: Colors.white,
    fontWeight: '600',
    letterSpacing: 1,
  },
  magneticStripe: {
    width: '100%',
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginTop: 30,
  },
  cvvStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  cvvLabel: {
    fontSize: Typography.xs,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  cvvBox: {
    backgroundColor: Colors.white,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cvvDisplay: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  backDisclaimer: {
    textAlign: 'center',
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 'auto',
    marginBottom: Spacing.lg,
  },

  // ── Form ──
  formSection: {},
  inputLabel: {
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  inputBox: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    height: 54,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Shadow.sm,
  },
  inputBoxError: {
    borderColor: Colors.error,
  },
  inputText: {
    flex: 1,
    fontSize: Typography.md,
    color: Colors.black,
    letterSpacing: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  rowFields: {
    flexDirection: 'row',
  },

  // ── Amount & Actions ──
  amountBox: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginTop: Spacing.xxl,
    ...Shadow.sm,
  },
  amountLabel: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: Spacing.xs,
  },
  amountValue: {
    fontSize: Typography.xxxl,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'Georgia',
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.base,
  },
  cancelText: {
    fontSize: Typography.sm,
    letterSpacing: Typography.widest,
    fontWeight: '700',
    color: Colors.secondary,
  },

  // ── State Overlays ──
  overlayState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  stateIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutralDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  stateTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
    fontFamily: 'Georgia',
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  stateSub: {
    fontSize: Typography.base,
    color: Colors.secondary,
    textAlign: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  failCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  retryBtn: {
    marginTop: Spacing.xxl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
  },
  retryBtnText: {
    fontSize: Typography.sm,
    letterSpacing: Typography.widest,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default PaymentModal;
