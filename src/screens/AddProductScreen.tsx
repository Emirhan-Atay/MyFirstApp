import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert,
  Image, 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axiosInstance';

import axios from 'axios';

export default function AddProductScreen() {
  const [productName, setProductName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const navigation = useNavigation();

  const handleAdd = async () => {
    if (!productName || !categoryName || !productPrice) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const categoryResponse = await api.get(
        `/Categories/GetByName?categoryName=${encodeURIComponent(categoryName)}`
      );

      const categoryData = categoryResponse.data;
      const categoryID = categoryData.categoryID;

      await api.post('/Products', {
        productName,
        productPrice,
        categoryID,
      });

      Alert.alert('Product added successfully.');
      setProductName('');
      setProductPrice('');
      setCategoryName('');
      navigation.goBack();

    } catch (error) {
      let message = 'An unknown error occurred.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Product could not added.', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Product</Text>
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
      />
      <TextInput
        style={styles.input}
        placeholder="Product Price"
        value={productPrice}
        onChangeText={setProductPrice}
        multiline={false}
        maxLength={10}
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType="default"
        returnKeyType="done"
      />
      <Button title="Add" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  logo: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 70,
    height: 70,
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
});
