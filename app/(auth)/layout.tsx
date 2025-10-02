import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, StatusBar } from 'react-native';

export default function AuthLayout() {
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
          name="login" 
          options={{
            title: 'Login',
            animationTypeForReplace: 'pop',
            gestureDirection: 'horizontal'
          }}
        />
        <Stack.Screen 
          name="register" 
          options={{
            title: 'Register',
            animation: 'slide_from_right',
            gestureDirection: 'horizontal'
          }}
        />
      </Stack>
    </View>
  );
}

