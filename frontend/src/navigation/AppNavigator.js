import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import AddProductScreen from '../screens/AddProductScreen';
import UpdateProductListScreen from '../screens/UpdateProductListScreen';
import UpdateProductFormScreen from '../screens/UpdateProductFormScreen';
import DeleteProductListScreen from '../screens/DeleteProductListScreen';
import CartScreen from '../screens/CartScreen';
import { Colors, Typography, Shadow, Spacing, Radius } from '../utils/theme';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─────────────────────────────────────────────
// Bottom Tab Navigator (Main App Shell)
// ─────────────────────────────────────────────
const MainTabs = () => {
  const { cartCount } = useContext(CartContext);

  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          borderRadius: Radius.xl,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
          borderTopWidth: 0,
          ...Shadow.md,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: Typography.wide,
          fontWeight: '700',
          textTransform: 'uppercase',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Catalogue: focused ? 'grid' : 'grid-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={[
                styles.iconContainer,
                focused && styles.activeIconContainer
              ]}>
                <Ionicons 
                  name={icons[route.name] || 'ellipse-outline'} 
                  size={focused ? 26 : 24} 
                  color={color} 
                />
              </View>
              
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'HOME' }} />
      <Tab.Screen name="Catalogue" component={ProductListScreen} options={{ tabBarLabel: 'ARCHIVE' }} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} options={{ tabBarLabel: 'PROFILE' }} />
    </Tab.Navigator>
  );
};

// ─────────────────────────────────────────────
// Placeholder screen for Profile
// ─────────────────────────────────────────────
const ProfilePlaceholder = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <View style={styles.placeholder}>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.placeholderGoBackButton}>
        <Ionicons name="chevron-back" size={26} color={Colors.black} />
      </TouchableOpacity>

      <Ionicons name="person-circle-outline" size={72} color={Colors.primary} />
      <Text style={styles.placeholderTitle}>{user?.name || 'Your Profile'}</Text>
      <Text style={styles.placeholderSub}>Email: {user?.email}</Text>
      <Text style={styles.placeholderSub}>Order history, skin diary & support will live here.</Text>
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={logout}
      >
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─────────────────────────────────────────────
// Root Stack Navigator
// ─────────────────────────────────────────────
const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true 
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ animation: 'fade' }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} />
          <Stack.Screen name="UpdateProductList" component={UpdateProductListScreen} />
          <Stack.Screen name="UpdateProductForm" component={UpdateProductFormScreen} />
          <Stack.Screen name="DeleteProductList" component={DeleteProductListScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};


const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: Colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  placeholderGoBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: Radius.round,
    backgroundColor: Colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
    zIndex: 10,
  },
  placeholderTitle: {
    fontSize: Typography.xxl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSub: {
    fontSize: Typography.base,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  tabBadgeText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '700',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: Colors.white,
    ...Shadow.sm,
    transform: [{ translateY: -4 }], // Subtle lift
  },
});

export default AppNavigator;
