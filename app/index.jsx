import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getToken } from '../lib/auth';

export default function IndexScreen() {
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getToken();
        if (token) {
          router.replace('/(app)/home');
        } else {
          router.replace('/(auth)/welcome');
        }
      } finally {
        SplashScreen.hideAsync();
      }
    }
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 120,
    height: 120,
  },
});
