// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { AuthProvider } from './context/AuthContext';
// import LoginScreen from './screens/LoginScreen';
// import RegisterScreen from './screens/RegisterScreen';
// import HomeScreen from './screens/HomeScreen';
// import TimerScreen from './screens/TimerScreen';
// import HistoryScreen from './screens/HistoryScreen';
// import ProfileScreen from './screens/ProfileScreen';

// const Stack = createStackNavigator();

// function App() {
//   return (
//     <AuthProvider>
//       <NavigationContainer>
//         <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="Login" component={LoginScreen} />
//           <Stack.Screen name="Register" component={RegisterScreen} />
//           <Stack.Screen name="Home" component={HomeScreen} />
//           <Stack.Screen name="Timer" component={TimerScreen} />
//           <Stack.Screen name="History" component={HistoryScreen} />
//           <Stack.Screen name="Profile" component={ProfileScreen} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </AuthProvider>
//   );
// }

// export default App;