import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';
import ScreenWrapper from '../components/ScreenWrapper';

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const [username, setUsername] = useState('Emir');
  const [password, setPassword] = useState('1234');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setLoading(true);
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/Auth/login', {
        username,
        password,
      });

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }], // 'Main' yerine 'Home' olmalı
        });
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (error: any) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        Alert.alert('Login Failed', 'Invalid credentials');
      } else {
        Alert.alert('Login Failed', 'An error occurred. Please try again.');
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View>
        <Image 
          source={require('../../assets/worksoft-logo-01-1.png')} 
          style={styles.logo}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  logo: {
    position: 'absolute',
    width: 230,
    height: 230,
    alignSelf: 'center',
    top: 50,
  },
});
