import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import reviewService from '../services/reviewService';
import { BASE_SERVER_URL } from '../services/api';

const StarRating = ({ rating, size = 12 }) => {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= rating ? 'star' : 'star-outline'}
          size={size}
          color={s <= rating ? '#FFB800' : Colors.secondaryLight}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
};

const ReviewFeedScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching review feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerLogo}>GlowHive Feed</Text>
        <Text style={styles.headerSubtitle}>Community Experiences</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={Colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Skin Diary</Text>
          <Text style={styles.introDesc}>
            See how the community is achieving their botanical glow. Real results, real people.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={Colors.secondaryLight} />
            <Text style={styles.emptyText}>No testimonials shared yet.</Text>
          </View>
        ) : (
          reviews.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.reviewCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.product?._id })}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.productTag}>on {item.product?.title || 'a Botanical Archive Product'}</Text>
                </View>
                <StarRating rating={item.rating} />
              </View>

              <Text style={styles.comment} numberOfLines={3}>
                "{item.comment}"
              </Text>

              {(item.beforeImage || item.afterImage || item.image) && (
                <View style={styles.dualImageRow}>
                  {(item.beforeImage || item.image) && (
                    <View style={styles.imageBox}>
                      <Image
                        source={{ 
                          uri: (() => {
                            const img = item.beforeImage || item.image;
                            if (!img) return null;
                            if (img.startsWith('http')) return img;
                            const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                            return `${BASE_SERVER_URL}/${cleanPath}`;
                          })()
                        }}
                        style={styles.resultImage}
                        resizeMode="cover"
                      />
                      <View style={styles.imageLabelBadge}>
                        <Text style={styles.imageLabelBadgeText}>BEFORE</Text>
                      </View>
                    </View>
                  )}
                  {item.afterImage && (
                    <View style={styles.imageBox}>
                      <Image
                        source={{ 
                          uri: item.afterImage.startsWith('http') 
                            ? item.afterImage 
                            : `${BASE_SERVER_URL}/${item.afterImage.startsWith('/') ? item.afterImage.substring(1) : item.afterImage}`
                        }}
                        style={styles.resultImage}
                        resizeMode="cover"
                      />
                      <View style={[styles.imageLabelBadge, { backgroundColor: 'rgba(45,75,67,0.85)' }]}>
                        <Text style={styles.imageLabelBadgeText}>AFTER</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  {item.createdAt 
                    ? new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </Text>
                <Text style={styles.viewLink}>VIEW PRODUCT →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutralDark,
  },
  headerLogo: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    letterSpacing: Typography.wider,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  scrollContent: { paddingBottom: 120 },
  introSection: { padding: Spacing.xl, alignItems: 'center' },
  introTitle: { fontSize: Typography.xxl, fontFamily: 'Georgia', color: Colors.primary, marginBottom: Spacing.xs },
  introDesc: { fontSize: Typography.sm, color: Colors.secondary, textAlign: 'center', lineHeight: 20 },
  
  reviewCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  userName: { fontSize: Typography.base, fontWeight: '700', color: Colors.black },
  productTag: { fontSize: Typography.xs, color: Colors.secondary, marginTop: 2 },
  starRow: { flexDirection: 'row' },
  comment: { fontSize: Typography.sm, color: Colors.black, lineHeight: 22, fontStyle: 'italic', marginBottom: Spacing.md },
  
  dualImageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  imageBox: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  resultImage: { width: '100%', height: 150 },
  imageLabelBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  imageLabelBadgeText: { color: Colors.white, fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.neutralDark, paddingTop: Spacing.sm },
  dateText: { fontSize: Typography.xs, color: Colors.secondaryLight },
  viewLink: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '700', letterSpacing: 0.5 },
  
  emptyState: { marginTop: 100, alignItems: 'center', opacity: 0.5 },
  emptyText: { marginTop: Spacing.base, fontSize: Typography.sm, color: Colors.secondary },
});

export default ReviewFeedScreen;
