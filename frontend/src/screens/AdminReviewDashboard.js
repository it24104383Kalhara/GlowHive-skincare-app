import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import reviewService from '../services/reviewService';
import { BASE_SERVER_URL } from '../services/api';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const StarDisplay = ({ rating }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Ionicons key={s} name={s <= rating ? 'star' : 'star-outline'} size={11} color={s <= rating ? '#FFB800' : '#ccc'} style={{ marginRight: 1 }} />
    ))}
  </View>
);

const AdminReviewDashboard = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getAllReviews();
      setReviews(data);
    } catch (e) {
      console.error('Admin fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchReviews(); }, []));

  const handleReviewDelete = async (reviewId, reviewerName) => {
    const executeDelete = async () => {
      try {
        await reviewService.deleteReview(reviewId, user.token);
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('Failed to remove review.');
        } else {
          Alert.alert('Error', 'Failed to remove review.');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Remove ${reviewerName}'s review? This action cannot be undone.`);
      if (confirmed) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Delete Review',
        `Remove ${reviewerName}'s review? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'DELETE', 
            style: 'destructive',
            onPress: executeDelete
          }
        ]
      );
    }
  };

  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed-outline" size={64} color={Colors.secondary} />
          <Text style={styles.accessDeniedText}>Admin Access Only</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Review Dashboard</Text>
          <Text style={styles.headerSubtitle}>Admin · {reviews.length} total reviews</Text>
        </View>
        <TouchableOpacity onPress={() => { setRefreshing(true); fetchReviews(); }} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{reviews.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>
            {reviews.length > 0
              ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
              : '—'}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>
            {reviews.filter((r) => r.rating >= 4).length}
          </Text>
          <Text style={styles.statLabel}>4-5 Stars</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>
            {reviews.filter((r) => r.rating <= 2).length}
          </Text>
          <Text style={styles.statLabel}>Low Rated</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReviews(); }} color={Colors.primary} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={56} color={Colors.secondaryLight} />
            <Text style={styles.emptyText}>No reviews yet.</Text>
          </View>
        ) : (
          reviews.map((item) => (
            <View key={item._id} style={styles.reviewCard}>
              {/* Card Header */}
              <View style={styles.cardTop}>
                <View style={styles.cardUser}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.productName}>
                      on {item.product?.title || 'Unknown Product'}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardMeta}>
                  <StarDisplay rating={item.rating} />
                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              </View>

              {/* Comment */}
              <Text style={styles.comment}>"{item.comment}"</Text>

              {/* Before/After Images */}
              {(item.beforeImage || item.afterImage || item.image) && (
                <View style={styles.imageRow}>
                  {(item.beforeImage || item.image) && (
                    <View style={styles.imageBox}>
                      <Image
                        source={{ 
                          uri: (() => { 
                            const img = item.beforeImage || item.image; 
                            if (!img) return null;
                            if (img.startsWith('http')) return img; 
                            const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                            return `${BASE_SERVER_URL}/${cleanPath}?t=${item.updatedAt || Date.now()}`; 
                          })() 
                        }}
                        style={styles.thumb}
                        resizeMode="cover"
                      />
                      <View style={styles.imageBadge}><Text style={styles.imageBadgeText}>BEFORE</Text></View>
                    </View>
                  )}
                  {item.afterImage && (
                    <View style={styles.imageBox}>
                      <Image
                        source={{ 
                          uri: (() => {
                            if (!item.afterImage) return null;
                            if (item.afterImage.startsWith('http')) return item.afterImage;
                            const cleanPath = item.afterImage.startsWith('/') ? item.afterImage.substring(1) : item.afterImage;
                            return `${BASE_SERVER_URL}/${cleanPath}?t=${item.updatedAt || Date.now()}`;
                          })()
                        }}
                        style={styles.thumb}
                        resizeMode="cover"
                      />
                      <View style={[styles.imageBadge, { backgroundColor: 'rgba(45,75,67,0.85)' }]}><Text style={styles.imageBadgeText}>AFTER</Text></View>
                    </View>
                  )}
                </View>
              )}

              {/* Admin Delete Button */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleReviewDelete(item._id, item.name)}
              >
                <Ionicons name="trash-outline" size={14} color="#d9534f" />
                <Text style={styles.deleteBtnText}>REMOVE REVIEW</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7F5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: 14, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#EAEAE6' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F7F7F5', alignItems: 'center', justifyContent: 'center' },
  refreshBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F4F2', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.black },
  headerSubtitle: { fontSize: Typography.xs, color: Colors.secondary, marginTop: 2 },
  statsBar: { flexDirection: 'row', backgroundColor: Colors.white, paddingVertical: 14, paddingHorizontal: Spacing.base, borderBottomWidth: 1, borderBottomColor: '#EAEAE6', marginBottom: 4 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: Typography.lg, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 9, color: Colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#EAEAE6', marginVertical: 4 },
  listContent: { padding: Spacing.base, paddingBottom: 120 },
  reviewCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  cardUser: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: Typography.sm },
  userName: { fontSize: Typography.sm, fontWeight: '700', color: Colors.black },
  productName: { fontSize: Typography.xs, color: Colors.secondary, marginTop: 1 },
  cardMeta: { alignItems: 'flex-end' },
  starRow: { flexDirection: 'row', marginBottom: 2 },
  dateText: { fontSize: 10, color: Colors.secondaryLight },
  comment: { fontSize: Typography.sm, color: Colors.black, fontStyle: 'italic', lineHeight: 20, marginBottom: Spacing.sm },
  imageRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  imageBox: { flex: 1, borderRadius: Radius.sm, overflow: 'hidden' },
  thumb: { width: '100%', height: 110 },
  imageBadge: { position: 'absolute', bottom: 5, left: 5, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  imageBadgeText: { color: Colors.white, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d9534f', borderRadius: Radius.pill, paddingVertical: 8, marginTop: 4 },
  deleteBtnText: { color: '#d9534f', fontSize: Typography.xs, fontWeight: '700', letterSpacing: 1, marginLeft: 6 },
  emptyState: { marginTop: 80, alignItems: 'center', opacity: 0.5 },
  emptyText: { marginTop: Spacing.md, color: Colors.secondary, fontSize: Typography.sm },
  accessDenied: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  accessDeniedText: { fontSize: Typography.lg, fontWeight: '700', color: Colors.secondary, marginTop: Spacing.md },
});

export default AdminReviewDashboard;
