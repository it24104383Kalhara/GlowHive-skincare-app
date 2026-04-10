import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

/**
 * GlowHive Input Component
 * Matches the soft rounded input style from the Login sketch
 */
const GHInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  rightAction,
  rightActionLabel,
  keyboardType,
  autoCapitalize = 'none',
  style,
  error,
  onBlur,
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {rightAction && (
            <TouchableOpacity onPress={rightAction}>
              <Text style={styles.rightAction}>{rightActionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondary}
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onBlur={onBlur}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.base,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.xs,
    letterSpacing: Typography.widest,
    fontWeight: '600',
    color: Colors.black,
    textTransform: 'uppercase',
  },
  rightAction: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wide,
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  inputContainer: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    height: 54,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Shadow.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.md,
    color: Colors.black,
  },
  eyeIcon: {
    padding: Spacing.sm,
  },
  inputError: {
    borderColor: '#C0392B',
  },
  errorText: {
    color: '#C0392B',
    fontSize: Typography.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default GHInput;
