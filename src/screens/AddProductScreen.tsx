import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../api/axiosInstance';
import axios from 'axios';
import ScreenWrapper from '../components/ScreenWrapper';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

type AddProductNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;

export default function AddProductScreen() {
  const [productName, setProductName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const navigation = useNavigation<AddProductNavigationProp>();

  const handleAdd = async () => {
    if (!productName.trim() || !categoryName.trim() || !productPrice.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const categoryResponse = await api.get(
        `/Categories/GetByName?categoryName=${encodeURIComponent(categoryName.trim())}`
      );

      const categoryData = categoryResponse.data;
      const categoryID = categoryData.categoryID;

      await api.post('/Products', {
        productName: productName.trim(),
        productPrice: parseFloat(productPrice.trim()),
        categoryID,
      });

      Alert.alert('Success', 'Product added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setProductName('');
      setProductPrice('');
      setCategoryName('');

    } catch (error) {
      let message = 'An unknown error occurred.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Error', 'Product could not be added. ' + message);
    }
  };

  const handleCancel = () => {
    setProductName('');
    setProductPrice('');
    setCategoryName('');
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.logoSpace}>
          <Image source={require('../../assets/worksoft-logomark-01-1.png')} style={styles.logo} />
        </View>
        <Text style={styles.titleText}>Add Product</Text>
        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              value={categoryName}
              onChangeText={setCategoryName}
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>Must match an existing category</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Price *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product price"
              value={productPrice}
              onChangeText={setProductPrice}
              placeholderTextColor="#999"
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.buttonText}>Add Product</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
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
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
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
});
