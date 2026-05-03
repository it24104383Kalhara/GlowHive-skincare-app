import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../utils/theme';
import { BASE_SERVER_URL } from '../../services/api';

const ReviewList = ({ reviews, onEdit, onDelete, currentUser }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reviews yet. Be the first to share your result!</Text>
      </View>
    );
  }

  const renderStars = (rating) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? Colors.rating : Colors.tertiaryLight}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {reviews.map((item) => (
        <View key={item._id} style={styles.reviewCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.userName}>{item.name}</Text>
              <View style={styles.ratingRow}>{renderStars(item.rating)}</View>
            </View>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>

          <Text style={styles.comment}>{item.comment}</Text>

          {(item.beforeImage || item.afterImage || item.image) && (
            <View>
              <Text style={styles.imageLabel}>BEFORE & AFTER RESULTS</Text>
              <View style={styles.dualImageRow}>
                 {(item.beforeImage || item.image) && (
                  <View style={styles.imageBox}>
                    <Image
                      source={{ 
                        uri: (() => {
                          const img = item.beforeImage || item.image;
                          if (!img || typeof img !== 'string') return null;
                          if (img.startsWith('http')) return img;
                          const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                          return `${BASE_SERVER_URL}/${cleanPath}?t=${item.updatedAt || Date.now()}`;
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
                        uri: (() => {
                          if (!item.afterImage || typeof item.afterImage !== 'string') return null;
                          if (item.afterImage.startsWith('http')) return item.afterImage;
                          const cleanPath = item.afterImage.startsWith('/') ? item.afterImage.substring(1) : item.afterImage;
                          return `${BASE_SERVER_URL}/${cleanPath}?t=${item.updatedAt || Date.now()}`;
                        })()
                      }}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                    <View style={[styles.imageBadgeOverlay, { backgroundColor: 'rgba(45,75,67,0.85)' }]}>
                      <Text style={styles.imageLabelBadgeText}>AFTER</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {currentUser && (String(currentUser._id) === String(item.user) || currentUser.isAdmin) && (
            <View style={styles.actionRow}>
              {String(currentUser._id) === String(item.user) && (
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={16} color={Colors.secondary} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => onDelete(item._id)} style={[styles.actionBtn, { marginLeft: 15 }]}>
                <Ionicons name="trash-outline" size={16} color="#d9534f" />
                <Text style={[styles.actionText, { color: '#d9534f' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  userName: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.black,
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  date: {
    fontSize: Typography.xs,
    color: Colors.secondary,
  },
  comment: {
    fontSize: Typography.sm,
    color: Colors.black,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  resultImage: {
    width: '100%',
    height: 150,
    borderRadius: Radius.sm,
  },
  dualImageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  imageBox: {
    flex: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  imageLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  imageLabelBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  imageBadgeOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  imageLabelBadgeText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral,
    paddingTop: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: Typography.xs,
    marginLeft: 4,
    color: Colors.secondary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ReviewList;
