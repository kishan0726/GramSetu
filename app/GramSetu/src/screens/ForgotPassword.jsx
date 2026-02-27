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
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API_BASE_URL = 'http://10.0.2.2:5000';

const ForgotPassword = ({ navigation }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [shopInfo, setShopInfo] = useState(null);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({});

  // Start countdown timer for OTP
  const startTimer = () => {
    setTimer(300); // 5 minutes in seconds
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validateEmail = () => {
    if (!email) {
      setErrors({ email: t('emailRequired') });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: t('validEmail') });
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: t('validOtpRequired') });
      return false;
    }
    return true;
  };

  const validatePasswords = () => {
    const errors = {};
    if (!newPassword) {
      errors.newPassword = t('newPasswordRequired');
    } else if (newPassword.length < 6) {
      errors.newPassword = t('passwordMinLength');
    }
    if (!confirmPassword) {
      errors.confirmPassword = t('confirmPasswordRequired');
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t('passwordMismatch');
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/shopkeeper-forgot-password`, { email });
      
      if (response.data.success) {
        setStep(2);
        startTimer();
        Alert.alert(t('success'), t('otpSent'));
        
        // Fetch shop info
        const shopResponse = await axios.post(`${API_BASE_URL}/get-shop-by-email`, { email });
        if (shopResponse.data.success) {
          setShopInfo(shopResponse.data.data);
        }
      } else {
        Alert.alert(t('error'), response.data.message || t('emailNotFound'));
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert(t('error'), t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-reset-otp`, { email, otp });
      
      if (response.data.success) {
        setResetToken(response.data.resetToken);
        setStep(3);
      } else {
        Alert.alert(t('error'), response.data.message || t('invalidOtp'));
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert(t('error'), t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/resend-reset-otp`, { email });
      
      if (response.data.success) {
        startTimer();
        Alert.alert(t('success'), t('otpResent'));
      } else {
        Alert.alert(t('error'), response.data.message || t('failedToResend'));
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert(t('error'), t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, {
        email,
        resetToken,
        newPassword,
        confirmPassword
      });
      
      if (response.data.success) {
        Alert.alert(
          t('success'),
          t('passwordResetSuccess'),
          [
            {
              text: t('ok'),
              onPress: () => navigation.navigate('ShopkeeperLogin')
            }
          ]
        );
      } else {
        Alert.alert(t('error'), response.data.message || t('resetFailed'));
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert(t('error'), t('networkError'));
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.headerTitle}>{t('forgotPassword')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.step, step >= 1 && styles.activeStep]}>
              <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>1</Text>
              <Text style={styles.stepLabel}>{t('email')}</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.activeStepLine]} />
            <View style={[styles.step, step >= 2 && styles.activeStep]}>
              <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>2</Text>
              <Text style={styles.stepLabel}>{t('verify')}</Text>
            </View>
            <View style={[styles.stepLine, step >= 3 && styles.activeStepLine]} />
            <View style={[styles.step, step >= 3 && styles.activeStep]}>
              <Text style={[styles.stepNumber, step >= 3 && styles.activeStepNumber]}>3</Text>
              <Text style={styles.stepLabel}>{t('reset')}</Text>
            </View>
          </View>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <View style={styles.formContainer}>
              <View style={styles.iconContainer}>
                <Icon name="lock-reset" size={50} color="#38bdf8" />
              </View>
              
              <Text style={styles.title}>{t('forgotPassword')}</Text>
              <Text style={styles.subtitle}>
                {t('enterEmailForReset')}
              </Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('email')}</Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Icon name="email" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('enterEmail')}
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>{t('sendOtp')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <View style={styles.formContainer}>
              <View style={styles.iconContainer}>
                <Icon name="security" size={50} color="#38bdf8" />
              </View>
              
              <Text style={styles.title}>{t('verifyOtp')}</Text>
              <Text style={styles.subtitle}>
                {t('otpSentTo')} {email}
              </Text>

              {shopInfo && (
                <View style={styles.shopInfoCard}>
                  <Text style={styles.shopInfoText}>{shopInfo.shopName}</Text>
                  <Text style={styles.shopInfoOwner}>{shopInfo.ownerName}</Text>
                </View>
              )}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('enterOtp')}</Text>
                <View style={[styles.inputContainer, errors.otp && styles.inputError]}>
                  <Icon name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor="#94a3b8"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
                {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
              </View>

              {timer > 0 ? (
                <Text style={styles.timerText}>
                  {t('otpExpiresIn')} {formatTime(timer)}
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                  <Text style={styles.resendText}>{t('resendOtp')}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>{t('verify')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <View style={styles.formContainer}>
              <View style={styles.iconContainer}>
                <Icon name="lock" size={50} color="#38bdf8" />
              </View>
              
              <Text style={styles.title}>{t('resetPassword')}</Text>
              <Text style={styles.subtitle}>
                {t('enterNewPassword')}
              </Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('newPassword')}</Text>
                <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
                  <Icon name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('enterNewPassword')}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('confirmPassword')}</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Icon name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('confirmNewPassword')}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>{t('resetPassword')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  step: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  activeStep: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
  },
  activeStepNumber: {
    color: '#ffffff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  activeStepLine: {
    backgroundColor: '#38bdf8',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shopInfoCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shopInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  shopInfoOwner: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
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
  button: {
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  timerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#38bdf8',
    marginBottom: 16,
    fontWeight: '500',
  },
  resendText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#38bdf8',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
});

export default ForgotPassword;