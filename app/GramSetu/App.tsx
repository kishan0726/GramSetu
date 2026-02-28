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
import PublicServicesScreen from './src/screens/PublicServicesScreen';
import ShopScreen from './src/screens/ShopsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ShopkeeperApprovalWait from './src/screens/ShopkeeperApprovalWait';
import ShopkeeperDashboard from './src/screens/ShopkeeperDashboard';
import EditShopDetails from './src/screens/EditShopDetails';
import AddShopItem from './src/screens/AddShopItem';
import ManageStock from './src/screens/ManageStock';
import ShopkeeperProfile from './src/screens/ShopkeeperProfile';
import ForgotPassword from './src/screens/ForgotPassword';
import ShopInventory from './src/screens/ShopInventory';

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
          <Stack.Screen name="ShopScreen" component={ShopScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="ShopkeeperDashboard" component={ShopkeeperDashboard} />
          <Stack.Screen name="EditShopDetails" component={EditShopDetails} />
          <Stack.Screen name="AddShopItem" component={AddShopItem} />
          <Stack.Screen name="ManageStock" component={ManageStock} />
          <Stack.Screen name="ShopkeeperApprovalWait" component={ShopkeeperApprovalWait} />
          <Stack.Screen name="ShopkeeperProfile" component={ShopkeeperProfile} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ShopInventory" component={ShopInventory} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
};

export default App;