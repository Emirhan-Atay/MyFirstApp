import React, {useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  BackHandler,
  Image, 
  FlatList,
  Modal,
  Animated
} from 'react-native';
import api from '../api/axiosInstance';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Product = {
  ProductID: number;
  ProductName: string;
  ProductPrice?: number;
  CategoryName: string;
  CategoryID: number;
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerAnimation] = useState(new Animated.Value(-250));

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await api.get('/Products');
      
      const mappedProducts = response.data.map((item: any) => ({
        ProductID: item.productID,
        ProductName: item.productName,
        ProductPrice: item.productPrice,
        CategoryName: item.categoryName,
        CategoryID: item.categoryID,
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      Animated.timing(drawerAnimation, {
        toValue: -250,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsDrawerOpen(false));
    } else {
      setIsDrawerOpen(true);
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const navigateAndCloseDrawer = (screen: keyof RootStackParamList) => {
    toggleDrawer();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 300);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    
      const onBackPress = () => {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  function handleProductDetail(productId: number) {
    navigation.navigate('ProductDetail', { productId });
  }

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => await logout() }
      ]
    );
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
          <Icon name="menu" size={20} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Manager</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={isDrawerOpen}
        animationType="none"
        onRequestClose={toggleDrawer}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={toggleDrawer}
        >
          <Animated.View style={[styles.drawer, { left: drawerAnimation }]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.drawerHeader}>
                <View style={styles.logoContainer}>
                  <Image source={require('../../assets/worksoft-logomark-01-1.png')} style={styles.drawerLogo} />
                </View>
                <Text style={styles.drawerTitle}>Worksoft</Text>
                <Text style={styles.drawerSubtitle}>Manage your inventory</Text>
              </View>

              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => navigateAndCloseDrawer('CategoryList')}
                >
                  <View style={styles.menuIconContainer}>
                    <Icon name="list" size={18} color="#666" />
                  </View>
                  <Text style={styles.menuItemText}>Category List</Text>
                  <Icon name="chevron-right" size={16} color="#ccc" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => navigateAndCloseDrawer('AddCategory')}
                >
                  <View style={styles.menuIconContainer}>
                    <Icon name="add-circle-outline" size={18} color="#666" />
                  </View>
                  <Text style={styles.menuItemText}>Add Category</Text>
                  <Icon name="chevron-right" size={16} color="#ccc" />
                </TouchableOpacity>
              </View>

              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>Products</Text>
                <View style={styles.divider} />
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => navigateAndCloseDrawer('ProductList')}
                >
                  <View style={styles.menuIconContainer}>
                    <Icon name="list" size={18} color="#666" />
                  </View>
                  <Text style={styles.menuItemText}>Product List</Text>
                  <Icon name="chevron-right" size={16} color="#ccc" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => navigateAndCloseDrawer('AddProduct')}
                >
                  <View style={styles.menuIconContainer}>
                    <Icon name="add-circle-outline" size={18} color="#666" />
                  </View>
                  <Text style={styles.menuItemText}>Add Product</Text>
                  <Icon name="chevron-right" size={16} color="#ccc" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Products</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={products.slice(0, 5)}
            keyExtractor={(item) => item.ProductID.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.productCard} onPress={() => handleProductDetail(item.ProductID)}>
                <View style={styles.productIconContainer}>
                  <Icon name="inventory" size={20} color="#007BFF" />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.ProductName}</Text>
                  <Text style={styles.categoryName}>{item.CategoryName}</Text>
                  {item.ProductPrice ? (
                    <Text style={styles.productPrice}>${formatPrice(item.ProductPrice)}</Text>
                  ) : (
                    <Text style={styles.noPriceText}>No price set</Text>
                  )}
                </View>
                <Icon name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="inventory-2" size={48} color="#ddd" />
                <Text style={styles.emptyText}>No products yet</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProduct')}>
                  <Text style={styles.addButtonText}>Add First Product</Text>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}
            style={styles.productList}
          />
        )}
      </View>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[styles.navButton, styles.productsButton]} 
          onPress={() => navigation.navigate('ProductList')}
        >
          <Icon name="inventory" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, styles.categoriesButton]} 
          onPress={() => navigation.navigate('CategoryList')}
        >
          <Icon name="category" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Categories</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  logoutButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  drawerHeader: {
    backgroundColor: '#f8f9fa',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  drawerLogo: {
    width: 40,
    height: 40,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
    marginLeft: 12,
  },
  recentSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  productList: {
    marginBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  noPriceText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 15,
  },
  navButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productsButton: {
    backgroundColor: '#007BFF',
  },
  categoriesButton: {
    backgroundColor: '#28a745',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
});

