import React, { useEffect, useRef, useState, useContext } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadow, Radius } from '../utils/theme';
import { AuthContext } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

const SideMenu = ({ visible, onClose, navigation }) => {
  const { user } = useContext(AuthContext);
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

  const renderItem = (icon, color, bg, title, screen) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8} 
      onPress={() => { onClose(); navigation.navigate(screen); }}
    >
      <View style={[styles.imageBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
    </TouchableOpacity>
  );


  return (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={Colors.black} />
          </TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>THE CLINICAL PANEL</Text>
              <Text style={styles.pageTitle}>Dashboard</Text>
            </View>

            {/* Product Management Section */}
            <Text style={styles.sectionLabel}>INVENTORY</Text>
            {renderItem('add-outline', '#3F51B5', '#E8EAF6', 'Add Product', 'AddProduct')}
            {renderItem('list-outline', '#4CAF50', '#E8F5E9', 'Update Product', 'UpdateProductList')}
            {renderItem('trash-outline', '#F44336', '#FFEBEE', 'Delete Product', 'DeleteProductList')}

            <View style={styles.sectionDivider} />

            {/* Orders Management Section */}
            <Text style={styles.sectionLabel}>LOGISTICS</Text>
            {renderItem('cart-outline', '#FF9800', '#FFF3E0', 'Admin Orders', 'AdminOrders')}
            {renderItem('receipt-outline', '#607D8B', '#ECEFF1', 'My Orders', 'MyOrders')}

            <View style={styles.sectionDivider} />

            {/* Reviews Management Section */}
            <Text style={styles.sectionLabel}>FEEDBACK</Text>
            {renderItem('star-outline', '#E91E63', '#FCE4EC', 'Manage Reviews', 'AdminReviews')}
          </ScrollView>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    ...Shadow.lg,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
    width: 36,
    height: 36,
    borderRadius: Radius.round,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
    zIndex: 10,   
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
    fontSize: Typography.xxl, 
    fontFamily: 'Georgia', 
    fontWeight: '700', 
    color: Colors.black, 
    lineHeight: 38,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
    opacity: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    ...Shadow.sm,
  },
  imageBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  info: { 
    flex: 1 
  },
  title: { 
    fontSize: Typography.base, 

    fontWeight: '700', 
    color: Colors.black, 
  },
});

export default SideMenu;
