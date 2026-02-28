import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const ShopkeeperSignup = ({ navigation }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    db.ref('shops_list').once('value').then(snapshot => {
      let total = 0;

      if (snapshot.exists()) {
        total = snapshot.numChildren();
      }

      const newShopId = 'SHOP' + String(total + 1).padStart(3, '0');
      setShopId(newShopId);
    });
  }, []);

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    // Shop Name validation
    if (!formData.shopName.trim()) {
      newErrors.shopName = t('shopNameRequired');
    }

    // Owner Name validation
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = t('ownerNameRequired');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('validEmail');
    }

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = t('mobileRequired');
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = t('validMobile');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordMinLength');
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Register
  const handleRegister = async () => {
    if (!validateForm()) return;

      const snapshot = await db.ref('shops_list').once('value');

      let total = snapshot.exists() ? snapshot.numChildren() : 0;

      const newShopId = 'shop' + String(total + 1).padStart(3, '0');

      await db.ref(`shops_list/${newShopId}`).set({
        id: newShopId,
        ...formData, // 🔥 this saves all fields
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      alert('Shop Registered Successfully');

  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('shopRegistration')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.iconCircle}>
              <Icon name="store" size={50} color="#38bdf8" />
            </View>
            <Text style={styles.illustrationTitle}>{t('registerYourShop')}</Text>
            <Text style={styles.illustrationSubtitle}>{t('basicDetails')}</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Shop Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('shopName')} *</Text>
              <View style={[styles.inputContainer, errors.shopName && styles.inputError]}>
                <Icon name="store" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('enterShopName')}
                  placeholderTextColor="#94a3b8"
                  value={formData.shopName}
                  onChangeText={(text) => setFormData({ ...formData, shopName: text })}
                />
              </View>
              {errors.shopName && <Text style={styles.errorText}>{errors.shopName}</Text>}
            </View>

            {/* Owner Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('ownerName')} *</Text>
              <View style={[styles.inputContainer, errors.ownerName && styles.inputError]}>
                <Icon name="person" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('enterOwnerName')}
                  placeholderTextColor="#94a3b8"
                  value={formData.ownerName}
                  onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
                />
              </View>
              {errors.ownerName && <Text style={styles.errorText}>{errors.ownerName}</Text>}
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('email')} *</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Icon name="email" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('enterEmail')}
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Mobile Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('mobileNumber')} *</Text>
              <View style={[styles.inputContainer, errors.mobile && styles.inputError]}>
                <Icon name="phone" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('enterMobileNumber')}
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.mobile}
                  onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                />
              </View>
              {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
            </View>

            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('password')} *</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Icon name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('enterPassword')}
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('confirmPassword')} *</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Icon name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('confirmPassword')}
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Info Note */}
            <View style={styles.noteContainer}>
              <Icon name="info" size={16} color="#38bdf8" />
              <Text style={styles.noteText}>
                {t('registrationNote')}
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Icon name="how-to-reg" size={20} color="#ffffff" />
                  <Text style={styles.registerButtonText}>{t('register')}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>{t('alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ShopkeeperLogin')}>
                <Text style={styles.loginLink}>{t('loginHere')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#38bdf8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#38bdf8',
  },
  illustrationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  illustrationSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#1e293b',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#1e293b',
    lineHeight: 18,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38bdf8',
  },
});

export default ShopkeeperSignup;