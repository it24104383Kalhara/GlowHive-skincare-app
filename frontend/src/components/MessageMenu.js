import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../utils/theme';

const { width } = Dimensions.get('window');

const MessageMenu = ({
  visible,
  onClose,
  onDetails,
  onEdit,
  onDelete,
  onReply,
}) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.menuContainer}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={onDetails}>
              <Ionicons name="information-circle-outline" size={22} color={Colors.black} />
              <Text style={styles.menuText}>Message Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
              <Ionicons name="create-outline" size={22} color={Colors.black} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
              <Ionicons name="trash-outline" size={22} color={Colors.error} />
              <Text style={[styles.menuText, { color: Colors.error }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onReply}>
              <Ionicons name="arrow-undo-outline" size={22} color={Colors.black} />
              <Text style={styles.menuText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: width * 0.8,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    ...Shadow.lg,
    overflow: 'hidden',
  },
  menu: {
    paddingVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  menuText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
  },
});

export default MessageMenu;