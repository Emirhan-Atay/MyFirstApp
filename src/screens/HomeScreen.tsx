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
  TextInput
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

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
      setFilteredProducts(mappedProducts);
      
      const uniqueCategories: string[] = [...new Set(mappedProducts.map((product: Product) => product.CategoryName))].filter((category): category is string => category != null);
      setCategories(uniqueCategories);
    } catch (error) {
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = useCallback(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.CategoryName === selectedCategory);
    }

    if (searchText) {
      filtered = filtered.filter(product => 
        product.ProductName.toLowerCase().includes(searchText.toLowerCase()) ||
        product.CategoryName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchText]);

  React.useEffect(() => {
    filterProducts();
  }, [filterProducts]);

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

  const clearSearch = () => {
    setSearchText('');
    setSelectedCategory('all');
  };

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

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ name: 'All', value: 'all' }, ...categories.map(cat => ({ name: cat, value: cat }))]}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item.value && styles.filterChipActive
              ]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === item.value && styles.filterChipTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
        {(searchText || selectedCategory !== 'all') && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>
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
                  <Text style={styles.categoryName}>Category: {item.CategoryName}</Text>
                </View>
                {item.ProductPrice ? (
                  <View style={styles.iconRow}>
                    <IconComponent iconName="attach-money" size={16} color="#4CAF50" />
                    <Text style={styles.productPrice}>${item.ProductPrice}</Text>
                  </View>
                ) : (
                  <View style={styles.iconRow}>
                    <IconComponent iconName="money-off" size={16} color="#888" />
                    <Text style={styles.productPrice}>No Price</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconComponent iconName="search-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
            </View>
          }
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterList: {
    paddingVertical: 5,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 5,
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
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
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

