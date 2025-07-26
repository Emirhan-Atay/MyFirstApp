import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  Alert,
  TextInput
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

type SortOption = {
  key: string;
  label: string;
  field: keyof Category;
  order: 'asc' | 'desc';
};

export default function CategoryListScreen() {
  const navigation = useNavigation<CategoryListNavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('name-asc');

  const sortOptions: SortOption[] = [
    { key: 'name-asc', label: 'Name (A-Z)', field: 'CategoryName', order: 'asc' },
    { key: 'name-desc', label: 'Name (Z-A)', field: 'CategoryName', order: 'desc' },
  ];

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
      setFilteredCategories(mappedCategories);
    } catch (error) {
      console.log('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const sortCategories = useCallback((categoriesToSort: Category[]) => {
    const sortOption = sortOptions.find(option => option.key === selectedSort);
    if (!sortOption) return categoriesToSort;

    return [...categoriesToSort].sort((a, b) => {
      const aValue = a[sortOption.field];
      const bValue = b[sortOption.field];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      }

      return sortOption.order === 'desc' ? -comparison : comparison;
    });
  }, [selectedSort]);

  const filterAndSortCategories = useCallback(() => {
    let filtered = categories;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(category => 
        category.CategoryName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Sort categories
    const sorted = sortCategories(filtered);
    setFilteredCategories(sorted);
  }, [categories, searchText, sortCategories]);

  React.useEffect(() => {
    filterAndSortCategories();
  }, [filterAndSortCategories]);

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

  const clearSearch = () => {
    setSearchText('');
    setSelectedSort('name-asc');
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

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={18} color="#dc3545" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category List</Text>
        <View style={styles.logoSpace}>
          <Image source={require('../../assets/worksoft-logomark-01-1.png')} style={styles.logo} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconComponent iconName="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <IconComponent iconName="clear" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.filterSortContainer}>
        <View style={styles.sortContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={sortOptions}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  selectedSort === item.key && styles.sortChipActive
                ]}
                onPress={() => setSelectedSort(item.key)}
              >
                <Text style={[
                  styles.sortChipText,
                  selectedSort === item.key && styles.sortChipTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.sortList}
          />
        </View>

        {(searchText || selectedSort !== 'name-asc') && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} found
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.CategoryID.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.categoryItem} onPress={() => handleCategoryDetail(item.CategoryID)}>
              <View style={styles.categoryInfo}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{item.CategoryName}</Text>
                </View>
                {item.CategoryIcon ? (
                  <View style={styles.iconRow}>
                    <Icon name="palette" size={16} color="#666" />
                    <Text style={styles.categoryIconText}>{item.CategoryIcon}</Text>
                  </View>
                ) : (
                  <View style={styles.iconRow}>
                    <Icon name="palette" size={16} color="#888" />
                    <Text style={styles.noCategoryIcon}>No Icon Set</Text>
                  </View>
                )}
              </View>
              <View style={styles.arrowContainer}>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="category" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or add your first category</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Category</Text>
      </TouchableOpacity>
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
  homeButton: {
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
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  logoSpace: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filterSortContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  sortContainer: {
    marginBottom: 10,
  },
  sortList: {
    paddingVertical: 5,
  },
  sortChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortChipActive: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  sortChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clearButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 15,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 100,
  },
  categoryItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  noCategoryIcon: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 6,
  },
  arrowContainer: {
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
