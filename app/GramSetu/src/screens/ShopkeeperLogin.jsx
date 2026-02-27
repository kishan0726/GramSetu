// ShopkeeperLogin.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShopkeeperLogin = ({ navigation }) => {
  const { t } = useLanguage();
  const [shopId, setShopId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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

        // 🔥 ALWAYS fetch fresh data from DB
        const snapshot = await db.ref(`shops_list/${shopId}`).once('value');

        if (!snapshot.exists()) {
          await AsyncStorage.removeItem('shopSession');
          return;
        }

        const shopData = snapshot.val();

        // 🚀 Navigate ONLY using DB status
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

    checkSessionAndNavigate();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!shopId.trim()) {
      newErrors.shopId = t('shopIdRequired');
    }

    if (!password.trim()) {
      newErrors.password = t('passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    navigation.replace('ForgotPassword');
  }

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const snapshot = await db.ref(`shops_list/${shopId}`).once('value');

      if (!snapshot.exists()) {
        setLoading(false);
        Alert.alert(t('error'), 'Invalid Shop ID');
        return;
      }

      const shopData = snapshot.val();

      if (shopData.password !== password) {
        setLoading(false);
        Alert.alert(t('error'), 'Invalid Password');
        return;
      }

      // ✅ Store session locally
      await AsyncStorage.setItem(
        'shopSession',
        JSON.stringify({
          shopId: shopData.id,
          shopName: shopData.shopName,
          status: shopData.status,
        })
      );

      setLoading(false);

      Alert.alert(t('success'), t('loginSuccess'));

      if (shopData.status === 'approved') {
        navigation.replace('ShopkeeperDashboard');
      } else {
        navigation.replace('ShopkeeperApprovalWait');
      }

    } catch (error) {
      setLoading(false);
      console.log('Login Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleBackToWelcome = () => {
    navigation.navigate('Welcome');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBackToWelcome}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← {t('backToWelcome')}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🏪</Text>
          </View>
          <Text style={styles.title}>{t('shopkeeperLogin')}</Text>
          <Text style={styles.subtitle}>
            {t('loginToManageShop')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>{t('shopId')}</Text>
          <TextInput
            style={[styles.input, errors.shopId && styles.inputError]}
            placeholder={t('enterShopId')}
            value={shopId}
            onChangeText={setShopId}
            autoCapitalize="none"
          />
          {errors.shopId && (
            <Text style={styles.errorText}>{errors.shopId}</Text>
          )}

          <Text style={[styles.label, styles.passwordLabel]}>{t('password')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.password && styles.inputError]}
              placeholder={t('enterPassword')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>{t('login')}</Text>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>{t('newShopkeeper')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShopkeeperSignup')}>
              <Text style={styles.signupLink}>{t('registerHere')}</Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>{t('needHelp')}</Text>
            <Text style={styles.helpText}>
              {t('shopRegistration')}
            </Text>
            <Text style={styles.helpPhone}>{t('contactNumber')}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#38bdf8',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeButton: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signupText: {
    fontSize: 14,
    color: '#64748b',
  },
  signupLink: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '600',
  },
  helpContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  helpPhone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38bdf8',
    marginTop: 12,
  },
});

export default ShopkeeperLogin;