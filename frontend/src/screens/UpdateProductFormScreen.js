import React, { useState, useContext, useEffect } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../contexts/AuthContext';
import productService from '../services/productService';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { BASE_SERVER_URL } from '../services/api';

const SKIN_TYPES = ['Oily', 'Dry', 'Sensitive', 'Combination', 'Mature'];
const CATEGORIES = ['SERUMS', 'OILS', 'CLEANSERS', 'BALMS', 'MISTS'];

const UpdateProductFormScreen = ({ route, navigation }) => {
  const { product } = route.params;

  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock.toString());
  const [ingredients, setIngredients] = useState(product.ingredients.join(', '));
  const [selectedSkinTypes, setSelectedSkinTypes] = useState(product.skinTypeTags || []);
  const [selectedCategory, setSelectedCategory] = useState(product.category || 'SERUMS');
  const [visible, setVisible] = useState(true);
  const [imageUri, setImageUri] = useState(
    product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_SERVER_URL}${product.imageUrl}`) : null
  );
  const [saving, setSaving] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  
  const { user, hasSessionImagePermission, setHasSessionImagePermission } = useContext(AuthContext);

  const pickImage = async () => {
    if (!hasSessionImagePermission) {
      Alert.alert(
        'Media Access Request',
        'GlowHive needs to access your photo library for this session to upload product imagery. Do you allow?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Allow', onPress: async () => {
              setHasSessionImagePermission(true);
              launchNativePicker();
            }
          }
        ]
      );
    } else {
      launchNativePicker();
    }
  };

  const launchNativePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Device access permission is required to upload product imagery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setImageChanged(true);
    }
  };

  const toggleSkinType = (tag) => {
    setSelectedSkinTypes(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleUpdate = async () => {
    if (!title || !price) {
      Alert.alert('Missing fields', 'Please enter product title and price.');
      return;
    }
    setSaving(true);
    
    try {
      let uploadedImageUrl = product.imageUrl;
      if (imageChanged && imageUri) {
        uploadedImageUrl = await productService.uploadImage(imageUri);
      }

      const productData = {
        title,
        price: Number(price),
        stock: Number(stock),
        ingredients,
        skinTypeTags: selectedSkinTypes.length > 0 ? selectedSkinTypes : ['All'],
        category: selectedCategory,
        imageUrl: uploadedImageUrl,
      };

      await productService.updateProduct(product._id, productData, user.token);

      Alert.alert('Product Updated', `"${title}" has been modified successfully.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not update the product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Update Mode</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>CATALOGUE › MODIFY ARCHIVE ENTRY</Text>
          <Text style={styles.pageTitle}>Update Product</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PRODUCT TITLE</Text>
            <TextInput style={styles.inputField} value={title} onChangeText={setTitle} />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.sm }]}>
              <Text style={styles.fieldLabel}>PRICE ($)</Text>
              <TextInput style={styles.inputField} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>STOCK QUANTITY</Text>
              <TextInput style={styles.inputField} value={stock} onChangeText={setStock} keyboardType="number-pad" />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>TECHNICAL INGREDIENTS LIST</Text>
            <TextInput
              style={[styles.inputField, styles.textArea]}
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

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

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PRODUCT IMAGERY</Text>
          <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, borderRadius: Radius.lg }} resizeMode="cover" />
            ) : (
              <Ionicons name="image-outline" size={40} color={Colors.secondary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <GHButton title="Update Product" onPress={handleUpdate} loading={saving} style={styles.saveBtn} />
          <GHButton title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.cancelBtn} />
        </View>
        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  scroll: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  headerLogo: { fontSize: Typography.md, fontWeight: '700', color: Colors.black },
  titleBlock: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  eyebrow: { fontSize: Typography.xs, letterSpacing: Typography.wider, color: Colors.secondary, fontWeight: '600', marginBottom: Spacing.xs },
  pageTitle: { fontSize: Typography.xxxl, fontFamily: 'Georgia', fontWeight: '700', color: Colors.black, lineHeight: 42, marginBottom: Spacing.sm },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, marginHorizontal: Spacing.base, marginBottom: Spacing.base, ...Shadow.sm },
  fieldGroup: { marginBottom: Spacing.base },
  fieldLabel: { fontSize: Typography.xs, letterSpacing: Typography.wider, color: Colors.secondary, fontWeight: '600', marginBottom: Spacing.sm },
  inputField: { backgroundColor: Colors.neutral, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, fontSize: Typography.md, color: Colors.black },
  textArea: { minHeight: 100, paddingTop: Spacing.md },
  row: { flexDirection: 'row', marginBottom: Spacing.base },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  uploadBox: { borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: Radius.lg, padding: Spacing.xxl, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm, marginBottom: Spacing.base },
  actionRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, marginBottom: Spacing.base, gap: Spacing.sm },
  saveBtn: { flex: 2 },
  cancelBtn: { flex: 1 },
});

export default UpdateProductFormScreen;
