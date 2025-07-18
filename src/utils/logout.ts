import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

export const logout = async (navigation: NativeStackNavigationProp<RootStackParamList, any>) => {
  try {
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } catch (e) {
    console.error('Error during logout:', e);
  }
};
