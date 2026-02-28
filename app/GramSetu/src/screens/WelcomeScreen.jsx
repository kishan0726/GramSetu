// WelcomeScreen.js
import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const WelcomeScreen = ({ navigation }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const checkSessionAndNavigate = async () => {
      try {
        const session = await AsyncStorage.getItem('shopSession');

        if (!session) return;

        const parsed = JSON.parse(session);
        const shopId = parsed.shopId;

        if (!shopId) {
          await AsyncStorage.removeItem('shopSession');
          return;
        }

        const snapshot = await db.ref(`shops_list/${shopId}`).once('value');

        if (!snapshot.exists()) {
          await AsyncStorage.removeItem('shopSession');
          return;
        }

        const shopData = snapshot.val();

        switch (shopData.status) {
          case 'approved':
            navigation.replace('ShopkeeperDashboard');
            break;

          case 'pending':
            navigation.replace('ShopkeeperApprovalWait');
            break;

          case 'rejected':
            navigation.replace('ShopkeeperApprovalWait');
            break;

          default:
            navigation.replace('Welcome');
        }

      } catch (error) {
        console.log('Navigation error:', error);
      }
    };

    const checkUserSessionAndNavigate = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');

        if (!session) return;

        const parsed = JSON.parse(session);
        const userId = parsed.userId;

        if (!userId) {
          alert("done")
          await AsyncStorage.removeItem('userSession');
          return;
        }
        
        const snapshot = await db.ref(`user_data/${userId}`).once('value');
        
        if (!snapshot.exists()) {
          await AsyncStorage.removeItem('userSession');
          return;
        }
        navigation.replace('Dashboard');

      } catch (error) {
        console.log('Navigation error:', error);
      }
    };

    checkSessionAndNavigate();
    checkUserSessionAndNavigate();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

      {/* Header with Background */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
          />
        </View>
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>{t('welcome')}</Text>
        <Text style={styles.description}>{t('selectLoginType')}</Text>

        {/* Login Options */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.userButton]}
            onPress={() => navigation.navigate('UserLogin')}
          >
            <Text style={styles.buttonIcon}>👤</Text>
            <Text style={styles.buttonText}>{t('loginAsCitizen')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.shopButton]}
            onPress={() => navigation.navigate('ShopkeeperLogin')}
          >
            <Text style={styles.buttonIcon}>🏪</Text>
            <Text style={styles.buttonText}>{t('loginAsShopkeeper')}</Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{t('newCitizenInfo')}</Text>
          <Text style={styles.infoText}>{t('newShopkeeperInfo')}</Text>
        </View>

        {/* Language Switcher */}
        <View>
          <LanguageSwitcher />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 {t('appName')}. {t('allRightsReserved')}.</Text>
      </View>
    </View>
  );
};

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#38bdf8',
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  userButton: {
    backgroundColor: '#38bdf8',
    borderColor: '#0ea5e9',
  },
  shopButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default WelcomeScreen;