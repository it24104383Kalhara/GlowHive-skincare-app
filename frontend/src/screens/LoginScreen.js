import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
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
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <Ionicons name="close" size={20} color={Colors.black} />
            <Text style={styles.topBarTitle}>THE CLINICAL EDITORIAL</Text>
            <View style={{ width: 20 }} />
          </View>

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
              rightAction={() => navigation.navigate('ForgotPassword')}
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
                <Text style={styles.socialBtnText}>G</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Text style={styles.socialBtnText}>iOS</Text>
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

          {/* Bottom hero image strip */}
          <View style={styles.heroImageStrip}>
            <View style={styles.heroImagePlaceholder}>
              <Text style={styles.heroImageLabel}>✦ GLOW HIVE</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  topBarTitle: {
    fontSize: Typography.xs,
    letterSpacing: Typography.wider,
    fontWeight: '700',
    color: Colors.black,
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  brandLabel: {
    fontSize: Typography.xs,
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
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
  socialBtnText: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.black,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  registerText: {
    fontSize: Typography.base,
    color: Colors.secondary,
  },
  registerLink: {
    fontSize: Typography.base,
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
  heroImageStrip: {
    height: 180,
    marginTop: Spacing.lg,
  },
  heroImagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageLabel: {
    color: Colors.white,
    fontSize: Typography.xl,
    letterSpacing: Typography.wider,
    fontWeight: '300',
  },
});

export default LoginScreen;
