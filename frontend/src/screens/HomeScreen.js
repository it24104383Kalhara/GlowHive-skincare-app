import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SideMenu from '../components/SideMenu';
import CartBadgeIcon from '../components/CartBadgeIcon';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { BASE_SERVER_URL } from '../services/api';

import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import productService from '../services/productService';
import GHModal from '../components/GHModal';

const HomeScreen = ({ navigation }) => {
  const [greeting, setGreeting] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [essentials, setEssentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'OK',
    onConfirm: () => {},
    variant: 'primary'
  });

  const showModal = (config) => {
    setModalConfig({ ...config, visible: true });
  };

  const hideModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      // For demo, just slice them
      setTrendingProducts(data.slice(0, 3));
      setEssentials(data.slice(3, 7));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showModal({
      title: 'Archive Added',
      message: `${product.title} has been added to your shopping bag.`,
      confirmText: 'VIEW BAG',
      onConfirm: () => {
        hideModal();
        navigation.navigate('Cart');
      },
      cancelText: 'CONTINUE',
      onCancel: hideModal,
      variant: 'primary'
    });
  };


  const renderTrendingCard = ({ item }) => (
    <TouchableOpacity
      style={styles.trendingCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id, product: item })}
    >
      <View style={styles.trendingImageBox}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_SERVER_URL}${item.imageUrl}` }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.trendingImagePlaceholder}>
            <Ionicons name="leaf-outline" size={32} color={Colors.white} />
          </View>
        )}
      </View>
      <View style={styles.trendingInfo}>
        <Text style={styles.trendingCategory}>{item.category}</Text>
        <Text style={styles.trendingTitle}>{item.title}</Text>
        <Text style={styles.trendingPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.trendingAddBtn} onPress={() => handleAddToCart(item)}>
        <Ionicons name="add" size={18} color={Colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral} />

      {/* Header */}
      <View style={styles.header}>
        {(user?.isAdmin || user?.role === 'seller') ? (
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={26} color={Colors.black} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
        <Text style={styles.headerLogo}>Glow Hive Skincare</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CartBadgeIcon />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginLeft: Spacing.sm }}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero Banner — "The Botanical Sanctuary" */}
        <View style={styles.heroBanner}>
          <ImageBackground 
            source={require('../assets/hero_botanical.png')} 
            style={styles.heroBannerBg}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <View style={styles.heroBannerContent}>
                <Text style={styles.heroBannerEyebrow}>LIMITED ARCHIVE SERIES</Text>
                <Text style={styles.heroBannerTitle}>The Botanical{'\n'}Sanctuary</Text>
                <Text style={styles.heroBannerBody}>
                  Experience the equilibrium of advanced clinical science and raw botanical potency.
                </Text>
                <TouchableOpacity 
                  style={styles.heroCTA} 
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Catalogue')}
                >
                  <Text style={styles.heroCTAText}>DISCOVER NOW</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Trending Now */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <View style={styles.sectionDivider} />
        </View>

        <FlatList
          data={trendingProducts}
          renderItem={renderTrendingCard}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingList}
        />

        {/* Skin Diary Quick Access */}
        <TouchableOpacity 
          style={styles.diaryBanner} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Diary')}
        >
          <View style={styles.diaryBannerContent}>
            <View>
              <Text style={styles.diaryBannerEyebrow}>PERSONAL PROGRESS</Text>
              <Text style={styles.diaryBannerTitle}>Your Skin Diary</Text>
              <Text style={styles.diaryBannerSub}>Track your clinical results daily.</Text>
            </View>
            <View style={styles.diaryBannerIcon}>
              <Ionicons name="journal-outline" size={24} color={Colors.white} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Summer Essentials Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>SUMMER SELECTION</Text>
          <Text style={styles.sectionTitleLarge}>Summer Essentials</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Catalogue')}>
            <Text style={styles.seeAll}>SEE ALL →</Text>
          </TouchableOpacity>
        </View>

        {/* Essentials List */}
        {essentials.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.essentialCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id, product: item })}
            activeOpacity={0.9}
          >
            <View style={styles.essentialImageBox}>
              {item.imageUrl ? (
                <Image 
                  source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_SERVER_URL}${item.imageUrl}` }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.essentialImagePlaceholder}>
                  <Ionicons name="flower-outline" size={28} color={Colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.essentialInfo}>
              <Text style={styles.essentialTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.essentialDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <Text style={styles.essentialPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.essentialCartBtn} onPress={() => handleAddToCart(item)}>
              <Ionicons name="bag-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Inspirational Quote */}
        <View style={styles.quoteBlock}>
          <Text style={styles.quoteText}>
            "The skin is the physical boundary of our soul; treat it with the reverence of a botanical sanctuary."
          </Text>
          <Text style={styles.quoteAttrib}>— GLOW HIVE CLINICAL PHILOSOPHY</Text>
        </View>

      </ScrollView>

      <SideMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
        navigation={navigation} 
      />
      <GHModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        cancelText={modalConfig.cancelText}
        onCancel={modalConfig.onCancel}
        variant={modalConfig.variant}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  scrollContent: { paddingBottom: 140 }, // Adjusted for floating tab bar
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral,
  },
  headerLogo: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: 0.5,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutralDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Banner
  heroBanner: { marginHorizontal: Spacing.base, marginBottom: Spacing.xl, borderRadius: Radius.xl, overflow: 'hidden' },
  heroBannerBg: { minHeight: 400, justifyContent: 'flex-end' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 75, 67, 0.45)', // Botanical green tint with transparency
    justifyContent: 'flex-end',
  },
  heroBannerContent: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
  heroBannerEyebrow: {
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
    color: Colors.tertiaryLight,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  heroBannerTitle: {
    fontSize: Typography.xxxl,
    fontFamily: 'Georgia',
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 42,
    marginBottom: Spacing.sm,
  },
  heroBannerBody: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  heroCTA: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  heroCTAText: {
    fontSize: Typography.xs,
    color: Colors.white,
    letterSpacing: Typography.wider,
    fontWeight: '700',
  },

  // Section headers
  sectionHeader: { paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  sectionTitle: { fontSize: Typography.xl, fontWeight: '700', color: Colors.black, fontFamily: 'Georgia' },
  sectionDivider: { width: 32, height: 2, backgroundColor: Colors.primary, marginTop: Spacing.xs },
  sectionEyebrow: { fontSize: Typography.xs, letterSpacing: Typography.widest, color: Colors.secondary, fontWeight: '600', marginBottom: Spacing.xs },
  sectionTitleLarge: { fontSize: Typography.xxl, fontFamily: 'Georgia', fontWeight: '700', color: Colors.black },
  seeAll: { fontSize: Typography.xs, letterSpacing: Typography.wider, color: Colors.secondary, fontWeight: '600', marginTop: Spacing.xs },

  // Trending cards
  trendingList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl, gap: Spacing.base },
  trendingCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  trendingImageBox: { height: 140, backgroundColor: Colors.neutralDark },
  trendingImagePlaceholder: { flex: 1, backgroundColor: Colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  trendingInfo: { padding: Spacing.sm },
  trendingCategory: { fontSize: Typography.xs, letterSpacing: Typography.wide, color: Colors.secondary, fontWeight: '600' },
  trendingTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.black, marginVertical: 2 },
  trendingPrice: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  trendingAddBtn: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.round,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Essentials
  essentialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  essentialImageBox: { width: 72, height: 72, borderRadius: Radius.md, overflow: 'hidden', marginRight: Spacing.base },
  essentialImagePlaceholder: { flex: 1, backgroundColor: Colors.neutralDark, alignItems: 'center', justifyContent: 'center' },
  essentialInfo: { flex: 1 },
  essentialTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.black, marginBottom: 2 },
  essentialDesc: { fontSize: Typography.xs, color: Colors.secondary, lineHeight: 16 },
  essentialPrice: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600', marginTop: Spacing.xs },
  essentialCartBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quote
  quoteBlock: {
    margin: Spacing.xl,
    padding: Spacing.xxl,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    alignItems: 'center',
    ...Shadow.sm,
  },
  quoteText: {
    fontSize: Typography.md,
    fontFamily: 'Georgia',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: Spacing.base,
  },
  quoteAttrib: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    color: Colors.secondary,
    fontWeight: '600',
  },
  diaryBanner: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.md,
  },
  diaryBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diaryBannerEyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    marginBottom: 4,
  },
  diaryBannerTitle: {
    fontSize: Typography.lg,
    fontFamily: 'Georgia',
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 2,
  },
  diaryBannerSub: {
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  diaryBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default HomeScreen;
