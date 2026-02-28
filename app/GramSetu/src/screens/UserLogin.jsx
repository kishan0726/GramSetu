// UserLogin.js
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

const UserLogin = ({ navigation }) => {
  const { t } = useLanguage();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!userId.trim()) {
      newErrors.userId = t('userIdRequired');
    }

    if (!password.trim()) {
      newErrors.password = t('passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) return;

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Login successful!');
      navigation.navigate('Dashboard')
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
          onPress={handleBackToWelcome}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← {t('backToWelcome')}</Text>
        </TouchableOpacity>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>👤</Text>
          </View>
          <Text style={styles.title}>{t('citizenLogin')}</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>{t('userId')}</Text>
          <TextInput
            style={[styles.input, errors.userId && styles.inputError]}
            placeholder={t('enterUserId')}
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
          />
          {errors.userId && (
            <Text style={styles.errorText}>{errors.userId}</Text>
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

          {/* Info Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteIcon}>ℹ️</Text>
            <Text style={styles.noteText}>{t('newCitizenNote')}</Text>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
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
              <Text style={styles.loginButtonText}>{t('citizenLogin')}</Text>
            )}
          </TouchableOpacity>

          {/* Help Section */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>{t('needHelp')}</Text>
            <Text style={styles.helpText}>{t('contactOfficer')}</Text>
            <Text style={styles.helpPhone}>{t('contactNumberLogin')}</Text>
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
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
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
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
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

export default UserLogin;