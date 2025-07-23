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
  FlatList
} from 'react-native';
import api from '../api/axiosInstance';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import { logout } from '../utils/logout';
import IconComponent from '../components/IconComponent';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await api.get('/Products');
      console.log('API Response:', response.data);
      
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

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  function handleProductDetail(productId: number) {
    navigation.navigate('ProductDetail', { productId });
  }

  return (
    <ScreenWrapper>
      <TouchableOpacity style={styles.logoutButton} onPress={() => logout(navigation)}>
        <Text style={styles.logoutText}>Log-out</Text>
      </TouchableOpacity>

      <View>
        <Image source={require('../../assets/worksoft-logomark-01-1.png')} style={styles.logo} />
      </View>

      <View style={styles.title}>
        <View style={styles.headerRow}>
          <Text style={styles.titleText}>Products</Text>
          <TouchableOpacity style={styles.AddButton} onPress={handleAddProduct}>
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.ProductID.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productItem}onPress={() => handleProductDetail(item.ProductID)}>
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{item.ProductName}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>Category: {item.CategoryName}</Text>
                </View>
                {item.ProductPrice ? (
                  <View style={styles.iconRow}>
                    <IconComponent iconName="emoji-emotions" size={16} color="#888" />
                    <Text style={styles.productPrice}>{item.ProductPrice}</Text>
                  </View>
                ) : (
                  <View style={styles.iconRow}>
                    <Text style={styles.productPrice}>No Price</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}


      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CategoryList')}>
          <Text style={styles.buttonText}>Category List</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  logo: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 70,
    height: 70,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  AddButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButton: {
    position: 'absolute',
    top: 56,
    right: 30,
    padding: 12,
    backgroundColor: '#dc3545',
    borderRadius: 20,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  productItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: { 
    fontSize: 16, 
    color: '#666',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: { 
    fontSize: 14, 
    color: '#888', 
    marginLeft: 8,
  },
});

