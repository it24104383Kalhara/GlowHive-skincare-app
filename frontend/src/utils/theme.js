// GlowHive Design System — Theme Constants

export const Colors = {
  primary: '#2D4B43',
  primaryLight: '#3D6358',
  primaryDark: '#1E3330',
  secondary: '#6F7975',
  tertiary: '#A79D8B',
  tertiaryLight: '#C4BAA8',
  neutral: '#F2F0ED',
  neutralDark: '#E8E4DF',
  white: '#FFFFFF',
  black: '#1A1A1A',
  text: '#1A1A1A',
  textMuted: '#6F7975',
  textLight: '#A79D8B',
  border: '#E0DDD8',
  success: '#4CAF50',
  error: '#C0392B',
  warning: '#E8A838',
  rating: '#FFB800',
  cardBg: '#FFFFFF',
  inputBg: '#F2F0ED',
  overlay: 'rgba(45, 75, 67, 0.85)',
};

export const Typography = {
  // Font families (loaded via expo-font or system fallback)
  serif: 'Georgia', // Replace with Playfair Display if loaded
  sans: 'System',   // Replace with Inter if loaded

  // Font sizes
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 44,

  // Letter spacing
  tight: -0.5,
  normal: 0,
  wide: 1.5,
  wider: 2.5,
  widest: 4,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  section: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 50,
  round: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
};
