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
  ProductIcon?: string;
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
        ProductIcon: response.data.productIcon,
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

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const updateData = {
        productName: editedProduct.ProductName,
        productIcon: editedProduct.ProductIcon,
        categoryID: editedProduct.CategoryID,
      };

      await api.put(`/Products/${productId}`, updateData);
      setProduct(editedProduct);
      setEditing(false);
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      console.log('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper> 
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Product Details</Text>
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
                <Text style={styles.label}>Product Icon:</Text>
                <TextInput
                  style={styles.input}
                  value={editedProduct?.ProductIcon || ''}
                  onChangeText={(text) =>
                    setEditedProduct(prev => prev ? { ...prev, ProductIcon: text } : null)
                  }
                  placeholder="Enter product icon"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Icon name="save" size={16} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Icon name="cancel" size={16} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.label}>Product ID:</Text>
                <Text style={styles.value}>{product.ProductID}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.label}>Product Name:</Text>
                <Text style={styles.value}>{product.ProductName}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{product.CategoryName}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.label}>Product Icon:</Text>
                <Text style={styles.value}>{product.ProductIcon || 'No Icon'}</Text>
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
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f005',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  backIcon: {
    marginRight: 2,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 60,
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
});
