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
import { AuthContext } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'seller'
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);

  const handlePasswordBlur = () => {
    if (password.length > 0 && password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError && text.length >= 6) {
      setPasswordError('');
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);
    if (result.success) {
      // Navigated by AuthContext
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.brandLabel}>GLOW HIVE SKINCARE</Text>
            <Text style={styles.heroTitle}>Create Account</Text>
          </View>

          <View style={styles.form}>
            <GHInput label="Full Name" value={name} onChangeText={setName} placeholder="Full Name" autoCapitalize="words" />
            <GHInput label="Email Address" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
            <GHInput label="Password" value={password} onChangeText={handlePasswordChange} onBlur={handlePasswordBlur} placeholder="••••••••" secureTextEntry error={passwordError} />
            <GHInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" secureTextEntry />

            {/* Role Selection */}
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleOption, role === 'customer' && styles.roleSelected]}
                onPress={() => setRole('customer')}
              >
                <Text style={[styles.roleText, role === 'customer' && styles.roleTextSelected]}>Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, role === 'seller' && styles.roleSelected]}
                onPress={() => setRole('seller')}
              >
                <Text style={[styles.roleText, role === 'seller' && styles.roleTextSelected]}>Seller</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ctaRow}>
              <GHButton title="CREATE ACCOUNT" onPress={handleRegister} loading={loading} style={styles.registerBtn} />
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login here</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.heroImageStrip}>
              <View style={styles.heroImagePlaceholder}>
                <Text style={styles.heroImageLabel}>✦ JOIN THE HIVE</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  scroll: { flexGrow: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: Radius.round, backgroundColor: Colors.neutral, alignItems: 'center', justifyContent: 'center', ...Shadow.md, zIndex: 10 },
  header: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  brandLabel: { fontSize: Typography.sm, letterSpacing: Typography.widest, fontWeight: '600', color: Colors.secondary, textTransform: 'uppercase', marginBottom: Spacing.sm },
  heroTitle: { fontSize: Typography.xxxl, fontFamily: 'Georgia', fontWeight: '700', color: Colors.black, letterSpacing: Typography.tight },
  form: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxl },
  roleLabel: { fontSize: Typography.md, fontWeight: '600', color: Colors.black, marginBottom: Spacing.sm, marginTop: Spacing.md },
  roleRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  roleOption: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  roleSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleText: { fontSize: Typography.md, color: Colors.black },
  roleTextSelected: { color: Colors.white, fontWeight: '600' },
  ctaRow: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  registerBtn: { width: '100%' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.xl },
  loginText: { fontSize: Typography.md, color: Colors.secondary },
  loginLink: { fontSize: Typography.md, color: Colors.black, fontWeight: '700' },
  heroImageStrip: { height: 120, marginTop: Spacing.xxl },
  heroImagePlaceholder: { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  heroImageLabel: { color: Colors.white, fontSize: Typography.xl, letterSpacing: Typography.wider, fontWeight: '300' },
});

export default RegisterScreen;