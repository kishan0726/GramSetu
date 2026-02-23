// ShopkeeperSignup.js
import React, { useState } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ShopkeeperSignup = ({ navigation }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    shopType: '',
    mobileNumber: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shopName.trim()) {
      newErrors.shopName = t('shopNameRequired');
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = t('ownerNameRequired');
    }

    if (!formData.shopType.trim()) {
      newErrors.shopType = t('shopTypeRequired');
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = t('mobileRequired');
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = t('validMobile');
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t('validEmail');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('addressRequired');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordMinLength');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate API call - Replace with actual API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        t('success'),
        t('registrationSuccess'),
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('ShopkeeperLogin'),
          },
        ]
      );
    }, 1500);
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← {t('backToLogin')}</Text>
        </TouchableOpacity>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🏪</Text>
          </View>
          <Text style={styles.title}>{t('shopRegistration_title')}</Text>
          <Text style={styles.subtitle}>
            {t('registerYourShop')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Shop Name */}
          <Text style={styles.label}>{t('shopName')} *</Text>
          <TextInput
            style={[styles.input, errors.shopName && styles.inputError]}
            placeholder={t('enterShopName')}
            value={formData.shopName}
            onChangeText={(value) => handleChange('shopName', value)}
          />
          {errors.shopName && (
            <Text style={styles.errorText}>{errors.shopName}</Text>
          )}

          {/* Owner Name */}
          <Text style={[styles.label, styles.fieldSpacing]}>{t('ownerName')} *</Text>
          <TextInput
            style={[styles.input, errors.ownerName && styles.inputError]}
            placeholder={t('enterOwnerName')}
            value={formData.ownerName}
            onChangeText={(value) => handleChange('ownerName', value)}
          />
          {errors.ownerName && (
            <Text style={styles.errorText}>{errors.ownerName}</Text>
          )}

          {/* Shop Type */}
          <Text style={[styles.label, styles.fieldSpacing]}>{t('shopType')} *</Text>
          <TextInput
            style={[styles.input, errors.shopType && styles.inputError]}
            placeholder={t('enterShopType')}
            value={formData.shopType}
            onChangeText={(value) => handleChange('shopType', value)}
          />
          {errors.shopType && (
            <Text style={styles.errorText}>{errors.shopType}</Text>
          )}

          {/* Mobile Number */}
          <Text style={[styles.label, styles.fieldSpacing]}>{t('mobileNumber')} *</Text>
          <TextInput
            style={[styles.input, errors.mobileNumber && styles.inputError]}
            placeholder={t('enterMobileNumber')}
            value={formData.mobileNumber}
            onChangeText={(value) => handleChange('mobileNumber', value)}
            keyboardType="numeric"
            maxLength={10}
          />
          {errors.mobileNumber && (
            <Text style={styles.errorText}>{errors.mobileNumber}</Text>
          )}

          {/* Email */}
          <Text style={[styles.label, styles.fieldSpacing]}>{t('email')}</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder={t('enterEmail')}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          {/* Address */}
          <Text style={[styles.label, styles.fieldSpacing]}>{t('address')} *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.address && styles.inputError]}
            placeholder={t('enterAddress')}
            value={formData.address}
            onChangeText={(value) => handleChange('address', value)}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}

          {/* Password */}
          <Text style={[styles.label, styles.fieldSpacing]}>{t('password')} *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.password && styles.inputError]}
              placeholder={t('createPassword')}
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
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

          {/* Confirm Password */}
          <Text style={[styles.label, styles.fieldSpacing]}>{t('confirmPassword')} *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
              placeholder={t('reenterPassword')}
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t('agreeToTerms')}{' '}
              <Text style={styles.termsLink}>{t('termsAndConditions')}</Text>
            </Text>
          </View>

          {/* Signup Button */}
          <TouchableOpacity 
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.signupButtonText}>{t('registerShop')}</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>{t('alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShopkeeperLogin')}>
              <Text style={styles.loginLink}>{t('loginHere')}</Text>
            </TouchableOpacity>
          </View>

          {/* Back to Welcome */}
          <TouchableOpacity 
            onPress={handleBackToWelcome}
            style={styles.backToWelcomeButton}
          >
            <Text style={styles.backToWelcomeText}>← {t('backToWelcome')}</Text>
          </TouchableOpacity>
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
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#38bdf8',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  fieldSpacing: {
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
  textArea: {
    minHeight: 80,
    paddingTop: 16,
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
  termsContainer: {
    marginTop: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  termsLink: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  signupButtonDisabled: {
    opacity: 0.5,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '600',
  },
  backToWelcomeButton: {
    alignSelf: 'center',
    marginBottom: 30,
    padding: 10,
  },
  backToWelcomeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default ShopkeeperSignup;