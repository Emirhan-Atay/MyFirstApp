import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  BackHandler,
  Image 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import { logout } from '../utils/logout';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
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

  return (
    <ScreenWrapper>
      <TouchableOpacity style={styles.logoutButton} onPress={() => logout(navigation)}>
        <Text style={styles.logoutText}>Log-out</Text>
      </TouchableOpacity>

      <View>
        <Image source={require('../../assets/worksoft-logomark-01-1.png')} style={styles.logo} />
      </View>

      <View style={{flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProductList')}>
          <Text style={styles.buttonText}>Product List</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CategoryList')}>
          <Text style={styles.buttonText}>Category List</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  logo: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 70,
    height: 70,
  },
    button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  logoutButton: {
    position: 'absolute',
    top: 56,
    right: 30,
    padding: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
    zIndex: 1,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
