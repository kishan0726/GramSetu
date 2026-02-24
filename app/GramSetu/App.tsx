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
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import ComplaintsScreen from './src/screens/ComplaintsScreen';
import PublicServicesScreen from './src/screens/PublicServicesScreen'

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
          <Stack.Screen name="AnnouncementsScreen" component={AnnouncementsScreen} />
          <Stack.Screen name="ComplaintsScreen" component={ComplaintsScreen} />
          <Stack.Screen name="PublicServicesScreen" component={PublicServicesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
};

export default App;