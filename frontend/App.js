import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';

// Silence common deprecation warnings to keep the UI clean
LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  'props.pointerEvents is deprecated'
]);

const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && (args[0].includes('"shadow*"') || args[0].includes('pointerEvents'))) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && (args[0].includes('"shadow*"') || args[0].includes('pointerEvents'))) {
    return;
  }
  originalError(...args);
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="dark" backgroundColor="#F2F0ED" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </CartProvider>
    </AuthProvider>
  );
}
