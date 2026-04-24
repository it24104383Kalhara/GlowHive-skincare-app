import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import GHButton from './GHButton';

const { width } = Dimensions.get('window');

/**
 * GlowHive Premium Confirmation Modal
 * A themed alternative to the native Alert.alert
 */
const GHModal = ({
  visible,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  onConfirm,
  onCancel,
  variant = 'danger', // 'primary', 'danger', 'info'
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Animated.View style={styles.container}>
          {/* Status bar spanning full width */}
          <View style={styles.topLineContainer}>
            <View style={[
              styles.topLine, 
              { 
                backgroundColor: variant === 'danger' ? Colors.error : Colors.primary,
                width: '100%' 
              }
            ]} />
          </View>
          
          <View style={styles.content}>
            {title && (
              <Text style={styles.title}>{title}</Text>
            )}
            
            <Text style={styles.message}>{message}</Text>
            
            <View style={styles.buttonRow}>
              {onCancel && (
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text 
                    numberOfLines={1} 
                    adjustsFontSizeToFit 
                    style={styles.cancelText}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}
              
              <GHButton
                title={confirmText}
                onPress={onConfirm}
                style={[styles.confirmBtn, !onCancel && { flex: 1 }]}
                textStyle={styles.confirmText}
                variant={variant === 'danger' ? 'ghost' : 'primary'} 
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.6)', // Botanical black with transparency
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    width: width * 0.9,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  topLineContainer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  topLine: {
    height: 4,
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.xl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: 'transparent',
  },
  cancelText: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: Typography.wide,
  },
  confirmBtn: {
    flex: 1.5,
    paddingHorizontal: Spacing.sm, // Reduced padding for modal context
  },
  confirmText: {
    fontSize: Typography.md,
  },
});

export default GHModal;
