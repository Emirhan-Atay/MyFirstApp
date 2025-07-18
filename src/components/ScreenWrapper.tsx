import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function ScreenWrapper({ children }: { children?: React.ReactNode }) {
  return <SafeAreaView style={styles.wrapper}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
});