 
import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, StatusBar } from 'react-native';
import FooterNav from '@/components/FooterNav';

export default function DashboardLayout() {
  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8f9fa" 
        translucent={false}
      />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: '#f8f9fa'
          }
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{
            title: 'Home',
            animation: 'fade',
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="home" 
          options={{
            title: 'Home',
            animation: 'fade',
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="timer" 
          options={{
            title: 'Meditation Timer',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            gestureDirection: 'vertical'
          }}
        />
        <Stack.Screen 
          name="history" 
          options={{
            title: 'Session History',
            animation: 'slide_from_right',
            gestureEnabled: true
          }}
        />
        <Stack.Screen 
          name="profile" 
          options={{
            title: 'Profile',
            animation: 'slide_from_right',
            gestureEnabled: true
          }}
        />
      </Stack>
      <FooterNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  }
});