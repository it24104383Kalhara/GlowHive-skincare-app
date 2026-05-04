import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GHButton from '../components/GHButton';
import { AuthContext } from '../contexts/AuthContext';
import couponService from '../services/couponService';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

const AddCouponScreen = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountAmount, setDiscountAmount] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { user } = useContext(AuthContext);

  const handleSave = async () => {
    if (!code || !discountAmount) {
      Alert.alert('Missing fields', 'Please enter a coupon code and discount amount.');
      return;
    }

    const numCount = (code.match(/\d/g) || []).length;
    if (numCount < 2) {
      Alert.alert('Invalid Code', 'Coupon code must contain at least 2 numbers.');
      return;
    }

    const amount = Number(discountAmount);
    if (discountType === 'fixed' && amount > 100) {
      Alert.alert('Invalid Amount', 'Fixed discount amount cannot exceed $100.');
      return;
    }

    if (discountType === 'percentage' && amount > 50) {
      Alert.alert('Invalid Amount', 'Percentage discount cannot exceed 50%.');
      return;
    }

    setSaving(true);
    
    try {
      const couponData = {
        code,
        discountType,
        discountAmount: Number(discountAmount),
        minOrderAmount: Number(minOrderAmount),
        isActive,
      };

      await couponService.createCoupon(couponData, user.token);

      Alert.alert('Coupon Saved', `"${code}" has been created.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Could not save the coupon.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Add Coupon</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>PROMOTIONS</Text>
          <Text style={styles.pageTitle}>Create New{'\n'}Coupon</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>COUPON CODE</Text>
            <TextInput
              style={styles.inputField}
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              placeholder="e.g. SUMMER20"
              placeholderTextColor={Colors.border}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>DISCOUNT TYPE</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, discountType === 'percentage' && styles.typeBtnActive]}
                onPress={() => setDiscountType('percentage')}
              >
                <Text style={[styles.typeBtnText, discountType === 'percentage' && styles.typeTextActive]}>Percentage</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, discountType === 'fixed' && styles.typeBtnActive]}
                onPress={() => setDiscountType('fixed')}
              >
                <Text style={[styles.typeBtnText, discountType === 'fixed' && styles.typeTextActive]}>Fixed Amount</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.sm }]}>
              <Text style={styles.fieldLabel}>AMOUNT</Text>
              <TextInput
                style={styles.inputField}
                value={discountAmount}
                onChangeText={setDiscountAmount}
                placeholder={discountType === 'percentage' ? "20" : "15.00"}
                placeholderTextColor={Colors.border}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>MIN ORDER ($)</Text>
              <TextInput
                style={styles.inputField}
                value={minOrderAmount}
                onChangeText={setMinOrderAmount}
                placeholder="0"
                placeholderTextColor={Colors.border}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>{isActive ? 'Active' : 'Inactive'}</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.actionRow}>
          <GHButton
            title="Create Coupon"
            onPress={handleSave}
            loading={saving}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  headerLogo: { fontSize: Typography.md, fontWeight: '700', color: Colors.black, fontFamily: 'Georgia' },
  titleBlock: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  eyebrow: { fontSize: Typography.xs, letterSpacing: Typography.wider, color: Colors.secondary, fontWeight: '600', marginBottom: Spacing.xs },
  pageTitle: { fontSize: Typography.xxxl, fontFamily: 'Georgia', fontWeight: '700', color: Colors.black, lineHeight: 42, marginBottom: Spacing.sm },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  fieldGroup: { marginBottom: Spacing.base },
  fieldLabel: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  inputField: {
    backgroundColor: Colors.neutral,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: Typography.md,
    color: Colors.black,
  },
  row: { flexDirection: 'row', marginBottom: Spacing.base },
  actionRow: {
    paddingHorizontal: Spacing.base,
  },
  saveBtn: { width: '100%' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  statusLabel: { fontSize: Typography.base, color: Colors.black, fontWeight: '500' },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeBtnText: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontWeight: '600',
  },
  typeTextActive: {
    color: Colors.white,
  },
});

export default AddCouponScreen;
