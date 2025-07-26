import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  FlatList,
  TextInput
} from 'react-native';
import api from '../api/axiosInstance';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import IconComponent from '../components/IconComponent';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ProductListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

type Product = {
  ProductID: number;
  ProductName: string;
  ProductPrice?: number;
  CategoryName: string;
  CategoryID: number;
  CreatedDate?: string;
};

type SortOption = {
  key: string;
  label: string;
  field: keyof Product;
  order: 'asc' | 'desc';
};

export default function ProductListScreen() {
  const navigation = useNavigation<ProductListNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('name-asc');

  const sortOptions: SortOption[] = [
    { key: 'name-asc', label: 'Name (A-Z)', field: 'ProductName', order: 'asc' },
    { key: 'name-desc', label: 'Name (Z-A)', field: 'ProductName', order: 'desc' },
    { key: 'price-asc', label: 'Price (Low-High)', field: 'ProductPrice', order: 'asc' },
    { key: 'price-desc', label: 'Price (High-Low)', field: 'ProductPrice', order: 'desc' },
    { key: 'category-asc', label: 'Category (A-Z)', field: 'CategoryName', order: 'asc' },
  ];

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
        CreatedDate: item.createdDate,
      }));
      
      setProducts(mappedProducts);
      setFilteredProducts(mappedProducts);
      
      const uniqueCategories: string[] = [...new Set(mappedProducts.map((product: Product) => product.CategoryName))].filter((category): category is string => category != null);
      setCategories(uniqueCategories);
    } catch (error) {
      console.log('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = useCallback((productsToSort: Product[]) => {
    const sortOption = sortOptions.find(option => option.key === selectedSort);
    if (!sortOption) return productsToSort;

    return [...productsToSort].sort((a, b) => {
      const aValue = a[sortOption.field];
      const bValue = b[sortOption.field];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }

      return sortOption.order === 'desc' ? -comparison : comparison;
    });
  }, [selectedSort]);

  const filterAndSortProducts = useCallback(() => {
    let filtered = products;

    if (!selectedCategories.includes('all') && selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.CategoryName)
      );
    }

    if (searchText) {
      filtered = filtered.filter(product => 
        product.ProductName.toLowerCase().includes(searchText.toLowerCase()) ||
        product.CategoryName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    const sorted = sortProducts(filtered);
    setFilteredProducts(sorted);
  }, [products, selectedCategories, searchText, sortProducts]);

  React.useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleProductDetail = (productId: number) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const clearSearch = () => {
    setSearchText('');
    setSelectedCategories(['all']);
    setSelectedSort('name-asc');
  };

  const handleCategorySelection = (categoryValue: string) => {
    if (categoryValue === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const withoutAll = prev.filter(cat => cat !== 'all');
        
        if (withoutAll.includes(categoryValue)) {
          const newSelection = withoutAll.filter(cat => cat !== categoryValue);
          return newSelection.length === 0 ? ['all'] : newSelection;
        } else {
          return [...withoutAll, categoryValue];
        }
      });
    }
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
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={18} color="#dc3545" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product List</Text>
        <View style={styles.logoSpace}>
          <Image source={require('../../assets/worksoft-logomark-01-1.png')} style={styles.logo} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconComponent iconName="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products or categories..."
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
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Categories ({selectedCategories.includes('all') ? 'All' : selectedCategories.length} selected)</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ name: 'All', value: 'all' }, ...categories.map(cat => ({ name: cat, value: cat }))]}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCategories.includes(item.value) && styles.filterChipActive
                ]}
                onPress={() => handleCategorySelection(item.value)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategories.includes(item.value) && styles.filterChipTextActive
                ]}>
                  {item.name}
                  {selectedCategories.includes(item.value) && item.value !== 'all' && ' ✓'}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>

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

        {(searchText || !selectedCategories.includes('all') || selectedSort !== 'name-asc') && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.ProductID.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productItem} onPress={() => handleProductDetail(item.ProductID)}>
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{item.ProductName}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Icon name="category" size={16} color="#666" />
                  <Text style={styles.categoryName}>{item.CategoryName}</Text>
                </View>
                {item.ProductPrice ? (
                  <Text style={styles.productPrice}>${formatPrice(item.ProductPrice)}</Text>
                ) : (
                  <Text style={styles.noPriceText}>No price set</Text>
                )}
              </View>
              <View style={styles.arrowContainer}>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="inventory-2" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Product</Text>
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
    width: 60,
    height: 60,
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
  filterContainer: {
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  filterList: {
    paddingVertical: 5,
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 60,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
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
  productItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 4,
  },
  noPriceText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 4,
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
});