import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import GHButton from '../components/GHButton';
import { AuthContext } from '../contexts/AuthContext';
import skinLogService from '../services/skinLogService';
import { BASE_SERVER_URL } from '../services/api';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

const HYDRATION_LEVELS = ['Dry', 'Normal', 'Oily'];
const ACNE_LEVELS = ['None', 'Mild', 'Moderate', 'Severe'];

const AddSkinLogScreen = ({ navigation, route }) => {
  const { user, hasSessionImagePermission, setHasSessionImagePermission } = useContext(AuthContext);
  
  // Optional logId for edit mode
  const logId = route.params?.logId;

  const [hydration, setHydration] = useState('Normal');
  const [acne, setAcne] = useState('None');
  const [productsUsed, setProductsUsed] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!logId);

  useEffect(() => {
    if (logId) {
      loadExistingLog();
    }
  }, [logId]);

  const loadExistingLog = async () => {
    try {
      const data = await skinLogService.getSkinLogById(logId, user.token);
      setHydration(data.hydration);
      setAcne(data.acne);
      setProductsUsed(data.productsUsed ? data.productsUsed.join(', ') : '');
      setNotes(data.notes || '');
      setExistingImageUrl(data.imageUrl);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load existing entry');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (!hasSessionImagePermission) {
      Alert.alert(
        'Media Access Request',
        'GlowHive needs to access your photo library to save your skin selfie. Do you allow?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Allow',
            onPress: async () => {
              setHasSessionImagePermission(true);
              launchNativePicker();
            },
          },
        ]
      );
    } else {
      launchNativePicker();
    }
  };

  const launchNativePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Denied',
        'Device access permission is required to upload a skin selfie. Please enable it in your device settings.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!imageUri && !existingImageUrl) {
      Alert.alert('Missing Image', 'Please upload a skin selfie for this log.');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = existingImageUrl;

      if (imageUri) {
        finalImageUrl = await skinLogService.uploadSkinImage(imageUri);
      }

      const logData = {
        hydration,
        acne,
        productsUsed,
        notes,
        imageUrl: finalImageUrl,
      };

      if (logId) {
        await skinLogService.updateSkinLog(logId, logData, user.token);
      } else {
        await skinLogService.createSkinLog(logData, user.token);
      }

      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save the skin log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{logId ? 'Edit Skin Log' : 'New Skin Log'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>TODAY'S SELFIE (REQUIRED)</Text>
          <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8} onPress={pickImage}>
            {imageUri || existingImageUrl ? (
              <Image
                source={{ uri: imageUri || `${BASE_SERVER_URL}${existingImageUrl}` }}
                style={styles.previewImage}
              />
            ) : (
              <>
                <Ionicons name="camera-outline" size={40} color={Colors.secondary} />
                <Text style={styles.uploadTitle}>Upload Skin Selfie</Text>
                <Text style={styles.uploadHint}>For best tracking, use consistent lighting.</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>HYDRATION LEVEL</Text>
          <View style={styles.chipRow}>
            {HYDRATION_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.chip, hydration === level && styles.chipActive]}
                onPress={() => setHydration(level)}
              >
                <Text style={[styles.chipText, hydration === level && styles.chipTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ACNE CONDITION</Text>
          <View style={styles.chipRow}>
            {ACNE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.chip, acne === level && styles.chipActive]}
                onPress={() => setAcne(level)}
              >
                <Text style={[styles.chipText, acne === level && styles.chipTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PRODUCTS USED</Text>
          <TextInput
            style={styles.input}
            value={productsUsed}
            onChangeText={setProductsUsed}
            placeholder="e.g., Ceramide Serum, Squalane Oil (comma separated)"
            placeholderTextColor={Colors.border}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>NOTES</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How does your skin feel today? Any breakouts, irritation, or glow?"
            placeholderTextColor={Colors.border}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actionRow}>
          <GHButton
            title={logId ? 'Update Entry' : 'Save Entry'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40 },
  placeholder: { width: 40 },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.black,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  fieldLabel: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  uploadTitle: {
    fontSize: Typography.md,
    fontWeight: '600',
    color: Colors.black,
    marginTop: Spacing.sm,
  },
  uploadHint: {
    fontSize: Typography.xs,
    color: Colors.secondary,
    marginTop: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.white,
  },
  input: {
    backgroundColor: Colors.neutral,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.black,
  },
  textArea: {
    minHeight: 100,
  },
  actionRow: {
    marginTop: Spacing.md,
  },
  saveBtn: {
    width: '100%',
  },
});

export default AddSkinLogScreen;
