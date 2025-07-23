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
import api from '../api/axiosInstance';
import ScreenWrapper from '../components/ScreenWrapper';

type RegisterNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    setLoading(true);
    
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending data:', { username, password }); // Debug
      
      const response = await api.post('/Users', {
        UserName: username,
        FirstName: username,
        LastName: '',
        UserPassword: password,
      });

      console.log('Response:', response); // Debug
      
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error: any) {
      console.log('Full error:', error); // Tam hatayı görmek için
      console.log('Error response:', error.response); // API'nin döndüğü hata
      console.log('Error status:', error.response?.status); // Status code
      console.log('Error data:', error.response?.data); // Hata mesajı
      
      if (error.response && error.response.status === 400) {
        Alert.alert('Registration Failed', error.response?.data?.message || 'Username already exists');
      } else if (error.response && error.response.status === 401) {
        Alert.alert('Registration Failed', 'Authorization required');
      } else {
        Alert.alert('Registration Failed', `Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Image 
          source={require('../../assets/worksoft-logo-01-1.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>Register</Text>
        
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
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>
            Already have an account? Login
          </Text>
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
  logo: {
    position: 'absolute',
    width: 230,
    height: 230,
    alignSelf: 'center',
    top: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
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
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: '#007BFF',
    fontSize: 16,
    textAlign: 'center',
  },
});