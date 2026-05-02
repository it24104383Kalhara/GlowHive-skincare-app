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
import SkinDiaryScreen from '../screens/SkinDiaryScreen';
import AddSkinLogScreen from '../screens/AddSkinLogScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import AdminOrdersScreen from '../screens/AdminOrdersScreen';
import { Colors, Typography } from '../utils/theme';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { cartCount } = useContext(CartContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.06)',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 1.5,
          fontWeight: '600',
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Catalogue: focused ? 'grid' : 'grid-outline',
            Diary: focused ? 'book' : 'book-outline',
            Profile: focused ? 'person' : 'person-outline',
          };

          return (
            <View>
              <Ionicons name={icons[route.name] || 'ellipse-outline'} size={22} color={color} />
              {route.name === 'Catalogue' && cartCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'HOME' }} />
      <Tab.Screen name="Catalogue" component={ProductListScreen} options={{ tabBarLabel: 'ARCHIVE' }} />
      <Tab.Screen name="Diary" component={SkinDiaryScreen} options={{ tabBarLabel: 'DIARY' }} />
      <Tab.Screen name="Profile" component={ProfilePlaceholder} options={{ tabBarLabel: 'PROFILE' }} />
    </Tab.Navigator>
  );
};


const ProfilePlaceholder = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.placeholder}>
      <Ionicons name="person-circle-outline" size={72} color={Colors.primary} />
      <Text style={styles.placeholderTitle}>{user?.name || 'Your Profile'}</Text>
      <Text style={styles.placeholderSub}>Email: {user?.email}</Text>
      <TouchableOpacity
        style={styles.ordersBtn}
        onPress={() => navigation.navigate('MyOrders')}
      >
        <Ionicons name="receipt-outline" size={20} color={Colors.white} style={{ marginRight: 8 }} />
        <Text style={styles.ordersBtnText}>MY ORDERS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={logout}
      >
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>
    </View>
  );
};


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
          <Stack.Screen name="AddSkinLog" component={AddSkinLogScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
          <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
          <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
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
  ordersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginBottom: 16,
  },
  ordersBtnText: {
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '700',
    color: Colors.white,
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
    fontWeight: '800',
  },
});

export default AppNavigator;
