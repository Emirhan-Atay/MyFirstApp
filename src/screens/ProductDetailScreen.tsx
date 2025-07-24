import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../components/ScreenWrapper';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ProductDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

type Product = {
  ProductID: number;
  ProductName: string;
  ProductPrice?: number;
  CategoryName: string;
  CategoryID: number;
};

export default function ProductDetailScreen() {
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await api.get(`/Products/${productId}`);
      console.log('Product detail response:', response.data);
      console.log('All response keys:', Object.keys(response.data));

      let categoryName = response.data.categoryName;
      let categoryID = response.data.categoryID;

      if (!categoryName || !categoryID) {
        console.log('Category info missing, fetching from products list...');
        try {
          const productsResponse = await api.get('/Products');
          const currentProduct = productsResponse.data.find((item: any) => item.productID === productId);
          if (currentProduct) {
            categoryName = currentProduct.categoryName;
            categoryID = currentProduct.categoryID;
            console.log('Found category from products list:', categoryName, categoryID);
          }
        } catch (listError) {
          console.log('Error fetching products list for category:', listError);
        }
      }

      const productData = {
        ProductID: response.data.productID,
        ProductName: response.data.productName,
        ProductPrice: response.data.productPrice,
        CategoryName: categoryName || 'Unknown Category',
        CategoryID: categoryID || 0,
      };

      console.log('Final product data:', productData);
      setProduct(productData);
      setEditedProduct(productData);
    } catch (error) {
      console.log('Error fetching product detail:', error);
      Alert.alert('Error', 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editedProduct) return;

    if (!editedProduct.ProductName.trim()) {
      Alert.alert('Error', 'Product name cannot be empty');
      return;
    }

    if ((editedProduct.ProductPrice || 0) < 0) {
      Alert.alert('Error', 'Product price cannot be negative');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const updateData = {
        productID: productId,
        productName: editedProduct.ProductName,
        productPrice: editedProduct.ProductPrice || 0,
        categoryID: editedProduct.CategoryID,
      };

      console.log('Sending update data:', updateData);
      console.log('API endpoint:', `/Products/${productId}`);

      const response = await api.put(`/Products/${productId}`, updateData);
      
      console.log('Update response:', response.data);
      console.log('Update status:', response.status);

      setProduct(editedProduct);
      setEditing(false);
      Alert.alert('Success', 'Product updated successfully');
    } catch (error: any) {
      console.log('Full update error:', error);
      console.log('Error response:', error.response);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Failed to update product';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      await api.delete(`/Products/${productId}`);
      Alert.alert('Success', 'Product deleted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!product) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text>Product not found</Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.homeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper> 
      <View style={styles.header}>
        <View style={styles.logoSpace}>
          <Image source={require('../../assets/worksoft-logomark-01-1.png')} style={styles.logo} />
        </View>
        <Text style={styles.titleText}>Product Details</Text>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {editing ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Name:</Text>
                <TextInput
                  style={styles.input}
                  value={editedProduct?.ProductName || ''}
                  onChangeText={(text) =>
                    setEditedProduct(prev => prev ? { ...prev, ProductName: text } : null)
                  }
                  placeholder="Enter product name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Price:</Text>
                <TextInput
                  style={styles.input}
                  value={editedProduct?.ProductPrice?.toString() || ''}
                  onChangeText={(text) => {
                    if (text === '') {
                      setEditedProduct(prev => prev ? { ...prev, ProductPrice: 0 } : null);
                      return;
                    }
                    
                    const numericValue = parseFloat(text);
                    if (!isNaN(numericValue)) {
                      setEditedProduct(prev => prev ? { ...prev, ProductPrice: numericValue } : null);
                    }
                  }}
                  placeholder="Enter product price"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>

              <View style={styles.detailItem}>
                <Text style={styles.label}>Product Name:</Text>
                <Text style={styles.value}>{product.ProductName}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{product.CategoryName}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.label}>Product Price:</Text>
                <Text style={styles.value}>{product.ProductPrice || 'No Price'}</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoSpace: {
    width: 50,
    height: 40,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#dc3545',
    width: 60,
    height: 40,
    borderRadius: 20,
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
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  backIcon: {
    marginRight: 2,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  detailItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  buttonIcon: {
    marginRight: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    top: -15,
    left: -15,
    width: 70,
    height: 70,
  },
});
