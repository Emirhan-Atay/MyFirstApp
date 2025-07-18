import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../components/ScreenWrapper';
import { RootStackParamList } from '../types';
import IconComponent from '../components/IconComponent';

type ProductListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

type Product = {
  ProductID: number;
  ProductName: string;
  ProductIcon?: string;
  CategoryName: string;
  CategoryID: number;
};

export default function ProductListScreen() {
  const navigation = useNavigation<ProductListNavigationProp>();
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
      const mappedProducts = response.data.map((item: any) => ({
        ProductID: item.productID,
        ProductName: item.productName,
        ProductIcon: item.productIcon,
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
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  function handleProductDetail(productId: number) {
    navigation.navigate('ProductDetail', { productId });
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homebuttonText}>Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.title}>
        <Text style={styles.titleText}>Product List</Text>
        <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.ProductID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productItem}onPress={() => handleProductDetail(item.ProductID)}>
            <View style={styles.productInfo}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>Product: {item.ProductName}</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>Category: {item.CategoryName}</Text>
              </View>
              {item.ProductIcon ? (
                <View style={styles.iconRow}>
                  <IconComponent iconName="emoji-emotions" size={16} color="#888" />
                  <Text style={styles.productIcon}>{item.ProductIcon}</Text>
                </View>
              ) : (
                <View style={styles.iconRow}>
                  <Text style={styles.productIcon}>No Icon</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    flex: 1,
    alignItems: 'center',
    top: 35,
  },
  titleText: {
    fontSize: 24,
    textAlign: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  productName: { 
    fontSize: 18,
    marginLeft: 8,
    flex: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: { 
    fontSize: 16, 
    color: '#666', 
    marginLeft: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: { 
    fontSize: 16, 
    color: '#888', 
    marginTop: 4,
    marginLeft: 8,
  },
  detailButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  homeButton: {
    position: 'absolute',
    top: 30,
    right: 0,
    padding: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
    zIndex: 1,
  },
  homebuttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
