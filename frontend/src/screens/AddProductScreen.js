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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GHButton from '../components/GHButton';
import SkinTypeTag from '../components/SkinTypeTag';
import SideMenu from '../components/SideMenu';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../contexts/AuthContext';
import productService from '../services/productService';
import GHModal from '../components/GHModal';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

const SKIN_TYPES = ['Oily', 'Dry', 'Sensitive', 'Combination', 'Mature'];
const CATEGORIES = ['SERUMS', 'OILS', 'CLEANSERS', 'BALMS', 'MISTS'];

const AddProductScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('SERUMS');
  const [visible, setVisible] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { user, hasSessionImagePermission, setHasSessionImagePermission } = useContext(AuthContext);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: () => {},
    onCancel: null,
    variant: 'primary'
  });

  const showModal = (config) => {
    setModalConfig({ ...config, visible: true });
  };

  const hideModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  const pickImage = async () => {
    if (!hasSessionImagePermission) {
      showModal({
        title: 'Media Access',
        message: 'GlowHive needs to access your photo library to upload product imagery. Do you allow?',
        confirmText: 'ALLOW',
        onConfirm: () => {
          setHasSessionImagePermission(true);
          hideModal();
          launchNativePicker();
        },
        onCancel: hideModal,
        variant: 'primary'
      });
    } else {
      launchNativePicker();
    }
  };

  const launchNativePicker = async () => {
    // Request permission first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Denied',
        'Device access permission is required to upload product imagery. Please enable it in your device settings to continue.'
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleSkinType = (tag) => {
    setSelectedSkinTypes(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!title || !price || !imageUri) {
      showModal({
        title: 'Incomplete Archive',
        message: 'Please provide a title, price, and an editorial image to save this formulation.',
        confirmText: 'OK',
        onConfirm: hideModal,
        variant: 'primary'
      });
      return;
    }
    setSaving(true);
    
    try {
      const uploadedImageUrl = await productService.uploadImage(imageUri, title);

      const productData = {
        title,
        price: Number(price),
        stock: Number(stock),
        ingredients,
        skinTypeTags: selectedSkinTypes.length > 0 ? selectedSkinTypes : ['All'],
        category: selectedCategory,
        imageUrl: uploadedImageUrl,
      };

      await productService.createProduct(productData, user.token);

      setTitle("");
      setPrice("");
      setStock("");
      setIngredients("");
      setSelectedSkinTypes([]);
      setSelectedCategory("SERUMS");
      setImageUri(null);

      showModal({
        title: 'Formulation Saved',
        message: `"${title}" has been successfully added to the digital archive.`,
        confirmText: 'OK',
        onConfirm: () => {
          hideModal();
          navigation.goBack();
        },
        variant: 'primary'
      });
    } catch (error) {
      console.error(error);
      showModal({
        title: 'Save Error',
        message: 'Could not synchronize this entry with the database. Please check your connection.',
        confirmText: 'RETRY',
        onConfirm: hideModal,
        variant: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Glow Hive Skincare</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Page heading */}
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>CATALOGUE › NEW ARCHIVE ENTRY</Text>
          <Text style={styles.pageTitle}>Add New{'\n'}Product</Text>
          <Text style={styles.subtitle}>
            Curate your next botanical masterpiece. Fill in the technical specifications for the new clinical formulation.
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>

          {/* Product Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PRODUCT TITLE</Text>
            <TextInput
              style={styles.inputField}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Ceramide Cloud Nectar"
              placeholderTextColor={Colors.border}
            />
          </View>

          {/* Price + Stock row */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.sm }]}>
              <Text style={styles.fieldLabel}>PRICE ($)</Text>
              <TextInput
                style={styles.inputField}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={Colors.border}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>STOCK QUANTITY</Text>
              <TextInput
                style={styles.inputField}
                value={stock}
                onChangeText={setStock}
                placeholder="100"
                placeholderTextColor={Colors.border}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>TECHNICAL INGREDIENTS LIST</Text>
            <TextInput
              style={[styles.inputField, styles.textArea]}
              value={ingredients}
              onChangeText={setIngredients}
              placeholder="List active botanicals and clinical compounds..."
              placeholderTextColor={Colors.border}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Skin type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>TARGET SKIN TYPE</Text>
            <View style={styles.tagRow}>
              {SKIN_TYPES.map(tag => (
                <SkinTypeTag
                  key={tag}
                  label={tag}
                  selected={selectedSkinTypes.includes(tag)}
                  onPress={() => toggleSkinType(tag)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Upload image card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PRODUCT IMAGERY</Text>
          <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8} onPress={pickImage}>
            {imageUri ? (
              <Image 
                source={{ uri: imageUri }} 
                style={{ width: '100%', height: 200, borderRadius: Radius.lg }} 
                resizeMode="cover" 
              />
            ) : (
              <>
                <Ionicons name="image-outline" size={40} color={Colors.secondary} />
                <Text style={styles.uploadTitle}>Upload Editorial Shot</Text>
                <Text style={styles.uploadHint}>
                  TAP TO BROWSE HIGH-RESOLUTION JPG OR PNG{'\n'}RECOMMENDED 1080×1080PX
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Tip */}
          <View style={styles.tipRow}>
            <Ionicons name="sparkles-outline" size={14} color={Colors.tertiary} />
            <Text style={styles.tipText}>
              For the best editorial aesthetic, use natural ambient lighting and soft shadows. Minimal styling preferred.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <GHButton
            title="Save Product"
            onPress={handleSave}
            loading={saving}
            style={styles.saveBtn}
          />
          <GHButton
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelBtn}
          />
        </View>


        {/* Archive Status */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ARCHIVE STATUS</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: visible ? Colors.success : Colors.secondary }]} />
            <Text style={styles.statusLabel}>{visible ? 'Visible in Shop' : 'Hidden'}</Text>
            <Switch
              value={visible}
              onValueChange={setVisible}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          {/* Category */}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                  >
                    <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>LAST EDITED</Text>
            <Text style={styles.metaValue}>JUST NOW</Text>
          </View>
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      <GHModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
        variant={modalConfig.variant}
      />
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
    headerBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.round,
    backgroundColor: Colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
    zIndex: 10, 
  },
  headerLogo: { fontSize: Typography.md, fontWeight: '700', color: Colors.black },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.neutralDark, alignItems: 'center', justifyContent: 'center',
  },

  titleBlock: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  eyebrow: { fontSize: Typography.xs, letterSpacing: Typography.wider, color: Colors.secondary, fontWeight: '600', marginBottom: Spacing.xs },
  pageTitle: { fontSize: Typography.xxxl, fontFamily: 'Georgia', fontWeight: '700', color: Colors.black, lineHeight: 42, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.sm, color: Colors.secondary, lineHeight: 20 },

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
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  row: { flexDirection: 'row', marginBottom: Spacing.base },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },

  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  saveBtn: { flex: 2 },
  cancelBtn: { flex: 1 },

  // Upload
  uploadBox: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  uploadTitle: {
    fontSize: Typography.lg,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  uploadHint: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  tipText: { fontSize: Typography.xs, color: Colors.secondary, flex: 1, lineHeight: 18 },

  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { flex: 1, fontSize: Typography.base, color: Colors.black, fontWeight: '500' },

  metaRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaLabel: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    color: Colors.secondary,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    color: Colors.textLight,
    fontWeight: '500',
  },
  catChip: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.white,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: Typography.xs, color: Colors.secondary, fontWeight: '600' },
  catTextActive: { color: Colors.white },
});

export default AddProductScreen;
