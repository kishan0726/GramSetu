// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageProvider } from './src/context/LanguageContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import UserLogin from './src/screens/UserLogin';
import ShopkeeperLogin from './src/screens/ShopkeeperLogin';
import ShopkeeperSignup from './src/screens/ShopkeeperSignup';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="UserLogin" component={UserLogin} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="ShopkeeperLogin" component={ShopkeeperLogin} />
          <Stack.Screen name="ShopkeeperSignup" component={ShopkeeperSignup} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
};

export default App;