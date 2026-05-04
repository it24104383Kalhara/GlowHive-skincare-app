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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { AuthContext } from '../contexts/AuthContext';
import couponService from '../services/couponService';

const AdminCouponsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCoupons = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await couponService.getCoupons(user.token);
      setCoupons(data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCoupons();
    }, [])
  );

  const handleDelete = (id, code) => {
    Alert.alert(
      'Delete Coupon',
      `Are you sure you want to delete the coupon "${code}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await couponService.deleteCoupon(id, user.token);
              fetchCoupons();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete coupon.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderCouponCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.couponCode}>{item.code}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.statusText, { color: item.isActive ? '#2E7D32' : '#C62828' }]}>
              {item.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id, item.code)}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>DISCOUNT</Text>
          <Text style={styles.detailValue}>
            {item.discountType === 'percentage' ? `${item.discountAmount}%` : `$${item.discountAmount}`}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>MIN ORDER</Text>
          <Text style={styles.detailValue}>${item.minOrderAmount}</Text>
        </View>
      </View>

      {item.expiryDate && (
        <Text style={styles.expiryText}>
          Expires: {new Date(item.expiryDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  if (loading && !refreshing) {
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
        <Text style={styles.headerTitle}>Manage Coupons</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddCoupon')}>
          <Ionicons name="add-circle-outline" size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {coupons.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="pricetag-outline" size={72} color={Colors.neutralDark} />
          <Text style={styles.emptyTitle}>No Coupons</Text>
          <Text style={styles.emptySub}>Create your first promotion code.</Text>
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item._id}
          renderItem={renderCouponCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCoupons(true)}
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
  card: {
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
    marginBottom: Spacing.base,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  couponCode: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.black,
  },
  statusBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: Typography.base,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  expiryText: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
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
  },
});

export default AdminCouponsScreen;
