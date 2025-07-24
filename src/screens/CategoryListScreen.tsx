import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../components/ScreenWrapper';
import { RootStackParamList } from '../types';
import IconComponent from '../components/IconComponent';
import Icon from 'react-native-vector-icons/MaterialIcons';

type CategoryListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryList'>;

type Category = {
  CategoryID: number;
  CategoryName: string;
  CategoryIcon?: string;
};

export default function CategoryListScreen() {
  const navigation = useNavigation<CategoryListNavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      const response = await api.get('/Categories');
      const mappedCategories = response.data.map((item: any) => ({
        CategoryID: item.categoryID,
        CategoryName: item.categoryName,
        CategoryIcon: item.categoryIcon,
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.log('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const handleAddCategory = () => {
    navigation.navigate('AddCategory');
  };

  function handleCategoryDetail(categoryId: number) {
    navigation.navigate('CategoryDetail', { categoryId });
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
      <View style={styles.header}>
        <View style={styles.logoSpace}>
          <Image source={require('../../assets/worksoft-logomark-01-1.png')} style={styles.logo} />
        </View>
        <Text style={styles.titleText}>Categories</Text>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.goBack()}>
          <Icon name="home" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Text style={styles.buttonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.CategoryID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryItem} onPress={() => handleCategoryDetail(item.CategoryID)}>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{item.CategoryName}</Text>
              </View>
              {item.CategoryIcon ? (
                <View style={styles.iconRow}>
                  <Text style={styles.categoryIconText}>Icon: {item.CategoryIcon}</Text>
                </View>
              ) : (
                <View style={styles.iconRow}>
                  <Text style={styles.noCategoryIcon}>No Icon</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconComponent iconName="category" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No categories found</Text>
            <Text style={styles.emptySubText}>Add your first category to get started</Text>
          </View>
        }
      />
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
    width: 35,
    height: 40,
  },
  logo: {
    position: 'absolute',
    top: -15,
    left: -15,
    width: 70,
    height: 70,
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
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryItem: {
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
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconText: { 
    fontSize: 14, 
    color: '#666',
  },
  noCategoryIcon: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
