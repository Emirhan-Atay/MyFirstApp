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
      <View>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homebuttonText}>Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.title}>
        <Text style={styles.titleText}>Category List</Text>
        <TouchableOpacity style={styles.button} onPress={handleAddCategory}>
          <Text style={styles.buttonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.CategoryID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryItem}onPress={() => handleCategoryDetail(item.CategoryID)}>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>Category: {item.CategoryName}</Text>
              </View>
              {item.CategoryIcon ? (
                <View style={styles.iconRow}>
                  <IconComponent iconName="emoji-emotions" size={16} color="#888" />
                  <Text style={styles.categoryIcon}>{item.CategoryIcon}</Text>
                </View>
              ) : (
                <View style={styles.iconRow}>
                  <Text style={styles.categoryIcon}>No Icon</Text>
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
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: { 
    fontSize: 18,
    marginLeft: 8,
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: { 
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
