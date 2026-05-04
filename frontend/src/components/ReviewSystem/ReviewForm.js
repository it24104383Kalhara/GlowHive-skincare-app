import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../utils/theme';
import GHButton from '../GHButton';
import api, { BASE_SERVER_URL } from '../../services/api';

const ReviewForm = ({ productId, onSubmit, initialData, onCancel, token }) => {
  const [rating, setRating] = useState(initialData ? initialData.rating : 5);
  const [comment, setComment] = useState(initialData ? initialData.comment : '');
  
  // Support legacy 'image' field for old reviews being edited
  const [beforeImage, setBeforeImage] = useState(
    initialData ? (initialData.beforeImage || initialData.image) : null
  );
  const [afterImage, setAfterImage] = useState(initialData ? initialData.afterImage : null);
  
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const MAX_COMMENT_LENGTH = 500;
  const MIN_COMMENT_LENGTH = 3;

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'GlowHive needs camera roll permissions to document your results.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0], type);
    }
  };

  const handleImageUpload = async (asset, type) => {
    const formData = new FormData();
    
    if (asset.uri.startsWith('data:') || asset.uri.startsWith('blob:')) {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      formData.append('file', blob, `${type}_result.jpg`);
    } else {
      formData.append('file', {
        uri: asset.uri,
        name: `${type}_result.jpg`,
        type: 'image/jpeg',
      });
    }

    if (type === 'before') setUploadingBefore(true);
    else setUploadingAfter(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await api.post('/upload', formData, config);
      if (type === 'before') setBeforeImage(data.url || data);
      else setAfterImage(data.url || data);
    } catch (error) {
      console.error(error);
      Alert.alert('Upload Failed', 'The image could not be archived. Please check your connection.');
    } finally {
      if (type === 'before') setUploadingBefore(false);
      else setUploadingAfter(false);
    }
  };

  const validate = () => {
    let newErrors = {};
    
    if (!comment || comment.trim().length === 0) {
      newErrors.comment = 'Please fill the comment section.';
    } else if (comment.trim().length < MIN_COMMENT_LENGTH) {
      newErrors.comment = `Archive entry must be at least ${MIN_COMMENT_LENGTH} characters.`;
    } else if (comment.length > MAX_COMMENT_LENGTH) {
      newErrors.comment = `Archive entry must not exceed ${MAX_COMMENT_LENGTH} characters.`;
    }

    if (!beforeImage) {
      newErrors.beforeImage = 'Upload photo before.';
    }
    if (!afterImage) {
      newErrors.afterImage = 'Upload photo after.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      const firstError = Object.values(errors)[0] || 'Please complete all required fields.';
      // We can still use Alert for high-priority blocking, but inline errors are better
      if (!comment || comment.trim().length === 0) {
        Alert.alert('Incomplete Entry', 'Please fill the comment section.');
      } else if (comment.trim().length < MIN_COMMENT_LENGTH) {
        Alert.alert('Incomplete Entry', `Archive entry must be at least ${MIN_COMMENT_LENGTH} characters.`);
      } else if (!beforeImage || !afterImage) {
        Alert.alert('Documentation Required', 'upload photoes after and before');
      }
      return;
    }

    setSubmitting(true);
    try {
      // Send both images. If it's legacy data, beforeImage will hold the original 'image' URL.
      await onSubmit({ rating, comment, beforeImage, afterImage, productId });
      
      if (!initialData) {
        setRating(5);
        setComment('');
        setBeforeImage(null);
        setAfterImage(null);
      }
    } catch (error) {
      console.error('Submit error:', error);
      // Error is usually handled by the parent component alert
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{initialData ? 'Edit Your Review' : 'Share Your Results'}</Text>
      <Text style={styles.subtitle}>Help the community by showing the Botanical Archive in action.</Text>

      {/* Rating Stars */}
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? Colors.rating : Colors.tertiaryLight}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, errors.comment && styles.inputError]}
        placeholder="How has this product refined your skin? (e.g. texture, glow, sensitivity...)"
        placeholderTextColor={Colors.secondary}
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={(text) => {
          setComment(text);
          if (errors.comment) setErrors(prev => ({ ...prev, comment: null }));
        }}
        maxLength={MAX_COMMENT_LENGTH}
      />
      <View style={styles.inputFooter}>
        {errors.comment ? (
          <Text style={styles.errorText}>{errors.comment}</Text>
        ) : (
          <View />
        )}
        <Text style={[styles.charCount, comment.length >= MAX_COMMENT_LENGTH && styles.charCountMax]}>
          {comment.length}/{MAX_COMMENT_LENGTH}
        </Text>
      </View>

      {/* Image Upload Area */}
      <View style={styles.dualImageRow}>
        <TouchableOpacity 
          style={[styles.imagePicker, errors.beforeImage && styles.imagePickerError]} 
          onPress={() => {
            pickImage('before');
            if (errors.beforeImage) setErrors(prev => ({ ...prev, beforeImage: null }));
          }} 
          disabled={uploadingBefore}
        >
          {uploadingBefore ? (
            <ActivityIndicator color={Colors.primary} />
          ) : beforeImage ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ 
                  uri: (() => {
                    if (beforeImage.startsWith('http')) return beforeImage;
                    const cleanPath = beforeImage.startsWith('/') ? beforeImage.substring(1) : beforeImage;
                    return `${BASE_SERVER_URL}/${cleanPath}?t=${Date.now()}`;
                  })()
                }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.changeBadge}>
                <Text style={styles.changeText}>BEFORE</Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={32} color={Colors.secondary} />
              <Text style={styles.placeholderText}>BEFORE</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.imagePicker, errors.afterImage && styles.imagePickerError]} 
          onPress={() => {
            pickImage('after');
            if (errors.afterImage) setErrors(prev => ({ ...prev, afterImage: null }));
          }} 
          disabled={uploadingAfter}
        >
          {uploadingAfter ? (
            <ActivityIndicator color={Colors.primary} />
          ) : afterImage ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ 
                  uri: (() => {
                    if (afterImage.startsWith('http')) return afterImage;
                    const cleanPath = afterImage.startsWith('/') ? afterImage.substring(1) : afterImage;
                    return `${BASE_SERVER_URL}/${cleanPath}?t=${Date.now()}`;
                  })()
                }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.changeBadge}>
                <Text style={styles.changeText}>AFTER</Text>
              </View>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={32} color={Colors.secondary} />
              <Text style={styles.placeholderText}>AFTER</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.btnRow}>
        <GHButton
          title={initialData ? 'UPDATE REVIEW' : 'SUBMIT ARCHIVE'}
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
        />
        {onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.neutral,
    borderRadius: Radius.md,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.lg,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    fontSize: Typography.sm,
    color: Colors.black,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  charCount: {
    fontSize: 10,
    color: Colors.secondary,
    fontFamily: 'monospace',
  },
  charCountMax: {
    color: '#e74c3c',
    fontWeight: '700',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 10,
    fontWeight: '600',
  },
  uploadArea: {
    height: 180,
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  dualImageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  imagePicker: {
    flex: 1,
    height: 150,
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerError: {
    borderColor: '#e74c3c',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: Spacing.sm,
  },
  placeholderSub: {
    fontSize: 10,
    color: Colors.tertiary,
    marginTop: 2,
  },
  previewContainer: {
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(45, 75, 67, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  changeText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '700',
  },
  btnRow: {
    marginTop: Spacing.sm,
  },
  submitBtn: {
    width: '100%',
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  cancelText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 1,
  },
});

export default ReviewForm;
