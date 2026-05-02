import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';

/**
 * Skin Type Tag Chip
 * Matches the "Oily | Dry | Sensitive | Combination | Mature" chips in Add Product sketch
 */
const SkinTypeTag = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  labelSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
});

export default SkinTypeTag;
