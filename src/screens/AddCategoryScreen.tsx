import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axiosInstance';
import axios from 'axios';

export default function AddCategoryScreen() {
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const navigation = useNavigation();

  const handleAdd = async () => {
    if (!categoryName) {
      Alert.alert('Error', 'Please fill in category name field.');
      return;
    }

    try {
      await api.post('/Categories', {
        categoryName,
        categoryIcon,
      });

      Alert.alert('Category added successfully.');
      setCategoryName('');
      setCategoryIcon('');
      navigation.goBack();

    } catch (error) {
      let message = 'An unknown error occurred.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Category could not be added.', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
      />
      <TextInput
        style={styles.input}
        placeholder="Category Icon"
        value={categoryIcon}
        onChangeText={setCategoryIcon}
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
});
