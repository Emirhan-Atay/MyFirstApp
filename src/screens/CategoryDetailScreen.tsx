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
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../components/ScreenWrapper';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

type CategoryDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryDetail'>;
type CategoryDetailRouteProp = RouteProp<RootStackParamList, 'CategoryDetail'>;

type Category = {
  CategoryID: number;
  CategoryName: string;
  CategoryIcon?: string;
};

type Product = {
  ProductID: number;
  ProductName: string;
  ProductIcon?: string;
  CategoryName: string;
  CategoryID: number;
};

export default function CategoryDetailScreen() {
  const navigation = useNavigation<CategoryDetailNavigationProp>();
  const route = useRoute<CategoryDetailRouteProp>();
  const { categoryId } = route.params;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [editedCategory, setEditedCategory] = useState<Category | null>(null);

  const fetchCategoryDetail = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const categoryResponse = await api.get(`/Categories/${categoryId}`);

      const categoryData = {
        CategoryID: categoryResponse.data.categoryID,
        CategoryName: categoryResponse.data.categoryName,
        CategoryIcon: categoryResponse.data.categoryIcon,
      };

      setCategory(categoryData);
      setEditedCategory(categoryData);

      const productsResponse = await api.get('/Products');
      const filteredProducts = productsResponse.data
        .filter((item: any) => item.categoryID === categoryId)
        .map((item: any) => ({
          ProductID: item.productID,
          ProductName: item.productName,
          ProductIcon: item.productIcon,
          CategoryName: item.categoryName,
          CategoryID: item.categoryID,
        }));

      setProducts(filteredProducts);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch category details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetail();
  }, [categoryId]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editedCategory) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const updateData = {
        categoryID: categoryId,
        categoryName: editedCategory.CategoryName,
        categoryIcon: editedCategory.CategoryIcon,
      };

      const response = await api.put(`/Categories/${categoryId}`, updateData);
      
      setCategory(editedCategory);
      setEditing(false);
      Alert.alert('Success', 'Category updated successfully');
    } catch (error: any) {
      let message = 'Failed to update category';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message || message;
      }
      
      Alert.alert('Error', message);
    }
  };

  const handleCancel = () => {
    setEditedCategory(category);
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This will also affect related products.',
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

      await api.delete(`/Categories/${categoryId}`);
      Alert.alert('Success', 'Category deleted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
    }
  };

  const handleProductDetail = (productId: number) => {
    navigation.navigate('ProductDetail', { productId });
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

  if (!category) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text>Category not found</Text>
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
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Category Details</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Information</Text>
            
            {editing ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category Name:</Text>
                  <TextInput
                    style={styles.input}
                    value={editedCategory?.CategoryName || ''}
                    onChangeText={(text) =>
                      setEditedCategory(prev => prev ? { ...prev, CategoryName: text } : null)
                    }
                    placeholder="Enter category name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category Icon:</Text>
                  <TextInput
                    style={styles.input}
                    value={editedCategory?.CategoryIcon || ''}
                    onChangeText={(text) =>
                      setEditedCategory(prev => prev ? { ...prev, CategoryIcon: text } : null)
                    }
                    placeholder="Enter category icon"
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
                  <Text style={styles.label}>Category ID:</Text>
                  <Text style={styles.value}>{category.CategoryID}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Category Name:</Text>
                  <Text style={styles.value}>{category.CategoryName}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.label}>Category Icon:</Text>
                  <Text style={styles.value}>{category.CategoryIcon || 'No Icon'}</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Products in this Category ({products.length})
            </Text>
            
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No products found in this category</Text>
              </View>
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => item.ProductID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.productItem} 
                    onPress={() => handleProductDetail(item.ProductID)}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.ProductName}</Text>
                      {item.ProductIcon && (
                        <Text style={styles.productIcon}>{item.ProductIcon}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            )}
          </View>
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
    fontSize: 14,
    marginLeft: 4,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
    paddingBottom: 5,
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
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productIcon: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  productDetailButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  productDetailButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
