import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,

  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GHButton from '../components/GHButton';
import GHInput from '../components/GHInput';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';
import { AuthContext } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Navigation is handled dynamically by AppNavigator
    } else {
      Alert.alert('Login Failed', result.message);
    }
  };


  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { justifyContent: 'center' }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Header */}
          <View style={styles.header}>
            <Text style={styles.brandLabel}>GLOW HIVE SKINCARE</Text>
            <Text style={styles.heroTitle}>Welcome Back</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <GHInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@clinicaleditorial.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <GHInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              rightAction={() => Alert.alert('Feature Coming Soon', 'Password recovery is being archived.')}
              rightActionLabel="FORGOT?"
            />

            <View style={styles.ctaRow}>
              <GHButton
                title="LOGIN TO ARCHIVE"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginBtn}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social login */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Ionicons name="logo-google" size={20} color={Colors.black} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={20} color={Colors.black} />
              </TouchableOpacity>
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>New to the edit? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Create an account</Text>
              </TouchableOpacity>
            </View>

            {/* Legal */}
            <Text style={styles.legal}>
              By logging in, you agree to our{' '}
              <Text style={styles.legalLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.legalLink}>Privacy Archive</Text>.{'\n'}
              Glow Hive clinical data is protected by industry standard encryption.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Brand Footer Pinned to Bottom */}
      <View style={styles.footerBrand}>
        <View style={styles.footerCurve} />
        <View style={styles.footerContent}>
          <Text style={styles.footerLogo}>✦ GLOW HIVE ✦</Text>
          <Text style={styles.footerTagline}>EST. MMXXIV | THE BOTANICAL ARCHIVE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.neutral,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  brandLabel: {
    fontSize: Typography.base,
    letterSpacing: Typography.widest,
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: Typography.xxxl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: Typography.tight,
  },
  form: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  ctaRow: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  loginBtn: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.base,
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontWeight: '500',
    letterSpacing: Typography.wider,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.base,
    marginBottom: Spacing.xxl,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.round,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  registerText: {
    fontSize: Typography.md,
    color: Colors.secondary,
  },
  registerLink: {
    fontSize: Typography.md,
    color: Colors.black,
    fontWeight: '700',
  },
  legal: {
    textAlign: 'center',
    fontSize: Typography.xs,
    color: Colors.textLight,
    lineHeight: 18,
  },
  legalLink: {
    textDecorationLine: 'underline',
    color: Colors.secondary,
  },
  footerBrand: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  footerCurve: {
    height: 24,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  footerContent: {
    backgroundColor: Colors.primary,
    height: 80,
    alignItems: 'center',
    paddingTop: 0,
  },
  footerLogo: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: Typography.lg,
    letterSpacing: 6,
    fontWeight: '300',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  footerTagline: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: '800',
  },
});

export default LoginScreen;
