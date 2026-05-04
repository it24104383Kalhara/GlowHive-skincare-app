import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadow, Radius } from '../utils/theme';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

const SideMenu = ({ visible, onClose, navigation }) => {
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  return (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={Colors.black} />
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>ADMIN CONTROLS</Text>
            <Text style={styles.pageTitle}>Manage{'\n'}Products</Text>
          </View>
          
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => { onClose(); navigation.navigate('AddProduct'); }}>
            <View style={[styles.imageBox, { backgroundColor: '#E8EAF6' }]}>
              <Ionicons name="add-outline" size={32} color="#3F51B5" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>Add Product</Text>
            </View>
             <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => { onClose(); navigation.navigate('UpdateProductList'); }}>
            <View style={[styles.imageBox, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="cart-outline" size={28} color="#4CAF50" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>Update Product</Text>
            </View>
             <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => { onClose(); navigation.navigate('DeleteProductList'); }}>
             <View style={[styles.imageBox, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="trash-outline" size={28} color="#F44336" />
            </View>
            <View style={styles.info}>
              <Text style={[styles.title, { color: '#000000ff' }]} numberOfLines={1}>Delete Product</Text>
            </View>
             <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => { onClose(); navigation.navigate('AdminOrders'); }}>
            <View style={[styles.imageBox, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="receipt-outline" size={28} color="#00838F" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>All Orders</Text>
            </View>
             <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => { onClose(); navigation.navigate('AdminCoupons'); }}>
            <View style={[styles.imageBox, { backgroundColor: '#FFF8E1' }]}>
              <Ionicons name="pricetag-outline" size={28} color="#FF8F00" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>Coupons</Text>
            </View>
             <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  sidebar: {
    width: '75%',
    backgroundColor: Colors.neutral,
    height: '100%',
    padding: Spacing.xl,
    paddingTop: 60,
    ...Shadow.lg,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  titleBlock: { 
    marginBottom: Spacing.xl,
  },
  eyebrow: { 
    fontSize: Typography.xs, 
    letterSpacing: Typography.wider, 
    color: Colors.secondary, 
    fontWeight: '600', 
    marginBottom: Spacing.xs 
  },
  pageTitle: { 
    fontSize: Typography.xxxl, 
    fontFamily: 'Georgia', 
    fontWeight: '700', 
    color: Colors.black, 
    lineHeight: 42,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  imageBox: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  info: { 
    flex: 1 
  },
  title: { 
    fontSize: Typography.md, 
    fontWeight: '700', 
    color: Colors.black, 
  },
});

export default SideMenu;
