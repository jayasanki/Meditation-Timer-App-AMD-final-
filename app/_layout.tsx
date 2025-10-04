// import React, { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { AuthProvider, useAuth } from '@/context/AuthContext';
// import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
// import { useFonts } from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';

// // Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();

// function RootLayoutNav() {
//   const { loading } = useAuth();
//   const [fontsLoaded, fontError] = useFonts({
//     'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
//     'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
//     'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
//   });

//   useEffect(() => {
//     if (fontsLoaded || fontError) {
//       // Hide splash screen once fonts are loaded or if there's an error
//       SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded, fontError]);

//   // Show loading screen while auth is loading or fonts are loading
//   if (loading || !fontsLoaded) {
//     if (fontError) {
//       console.warn('Font loading error:', fontError);
//     }

//     return (
//       <View style={styles.loadingContainer}>
//         <View style={styles.loadingContent}>
//           <View style={styles.logoContainer}>
//             <Text style={styles.logo}>🧘</Text>
//           </View>
//           <ActivityIndicator size="large" color="#4A6572" />
//           <Text style={styles.loadingText}>
//             {loading ? 'Loading your meditation journey...' : 'Loading app...'}
//           </Text>
//           <Text style={styles.loadingSubtext}>
//             Preparing your peaceful space
//           </Text>
//         </View>
//         <StatusBar style="auto" />
//       </View>
//     );
//   }

//   return (
//     <>
//       <Stack 
//         screenOptions={{ 
//           headerShown: false,
//           animation: 'fade',
//           gestureEnabled: true,
//           contentStyle: {
//             backgroundColor: '#f8f9fa'
//           }
//         }}
//       >
//         <Stack.Screen 
//           name="(auth)" 
//           options={{
//             animation: 'fade',
//             gestureEnabled: false
//           }}
//         />
//         <Stack.Screen 
//           name="(dashboard)" 
//           options={{
//             animation: 'fade',
//             gestureEnabled: false
//           }}
//         />
//         <Stack.Screen 
//           name="index" 
//           options={{
//             animation: 'fade',
//             gestureEnabled: false
//           }}
//         />
//       </Stack>
//       <StatusBar style="auto" />
//     </>
//   );
// }

// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <RootLayoutNav />
//     </AuthProvider>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa'
//   },
//   loadingContent: {
//     alignItems: 'center',
//     padding: 40
//   },
//   logoContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 30,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   logo: {
//     fontSize: 40,
//   },
//   loadingText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#4A6572',
//     marginTop: 20,
//     marginBottom: 8,
//     textAlign: 'center'
//   },
//   loadingSubtext: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center'
//   }
// });


import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { loading } = useAuth();
  
  // TEMPORARY FIX: Skip font loading for now
  const [fontsLoaded, fontError] = useFonts({
    // 'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
    // 'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
    // 'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
  });

  // TEMPORARY: Force fonts to be loaded
  const fontsLoadedFixed = true;
  const fontErrorFixed = null;

  useEffect(() => {
    // Hide splash screen immediately (temporary fix)
    SplashScreen.hideAsync();
  }, []);

  // Show loading screen only while auth is loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🧘</Text>
          </View>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={styles.loadingText}>
            Loading your meditation journey...
          </Text>
          <Text style={styles.loadingSubtext}>
            Preparing your peaceful space
          </Text>
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade',
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: '#f8f9fa'
          }
        }}
      >
        <Stack.Screen 
          name="(auth)" 
          options={{
            animation: 'fade',
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="(dashboard)" 
          options={{
            animation: 'fade',
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="index" 
          options={{
            animation: 'fade',
            gestureEnabled: false
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    fontSize: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6572',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center'
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});