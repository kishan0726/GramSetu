import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const ShopkeeperProfile = ({ navigation, route }) => {
  const { t, language } = useLanguage();
  const { shopData: initialData } = route.params || {};
  
  const [shopData, setShopData] = useState(initialData || null);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    ownerName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (shopData) {
      setEditForm({
        ownerName: shopData.ownerName || '',
        email: shopData.email || '',
        phone: shopData.phone || '',
        address: shopData.address || '',
      });
    }
  }, [shopData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return t('approved');
      case 'pending':
        return t('pending');
      case 'rejected':
        return t('rejected');
      default:
        return status;
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editForm.ownerName.trim()) {
      errors.ownerName = t('ownerNameRequired');
    }
    if (!editForm.email.trim()) {
      errors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = t('validEmail');
    }
    if (!editForm.phone.trim()) {
      errors.phone = t('mobileRequired');
    } else if (!/^[0-9]{10}$/.test(editForm.phone.replace(/\D/g, ''))) {
      errors.phone = t('validMobile');
    }
    if (!editForm.address.trim()) {
      errors.address = t('addressRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwords.current) {
      errors.current = t('currentPasswordRequired');
    }
    if (!passwords.new) {
      errors.new = t('newPasswordRequired');
    } else if (passwords.new.length < 6) {
      errors.new = t('passwordMinLength');
    }
    if (!passwords.confirm) {
      errors.confirm = t('confirmPasswordRequired');
    } else if (passwords.new !== passwords.confirm) {
      errors.confirm = t('passwordMismatch');
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validateEditForm()) {
      Alert.alert(t('error'), t('pleaseFixErrors'));
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEditModal(false);
      setShopData({
        ...shopData,
        ownerName: editForm.ownerName,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
      });
      Alert.alert(t('success'), t('profileUpdated'));
    }, 1500);
  };

  const handleChangePassword = () => {
    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setPasswordModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
      Alert.alert(t('success'), t('passwordChanged'));
    }, 1500);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          onPress: () => {
            // Clear any stored data and navigate to login
            navigation.reset({
              index: 0,
              routes: [{ name: 'ShopkeeperLogin' }],
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (!shopData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('loadingData')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditModal(true)}
        >
          <Icon name="edit" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {shopData.name?.charAt(0) || 'S'}
              </Text>
            </View>
          </View>
          <Text style={styles.shopName}>{shopData.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shopData.status) + '15' }]}>
            <Icon name="circle" size={8} color={getStatusColor(shopData.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(shopData.status) }]}>
              {getStatusText(shopData.status)}
            </Text>
          </View>
          <Text style={styles.shopId}>{t('shopId')}: {shopData.id}</Text>
        </View>

        {/* Owner Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('ownerInformation')}</Text>
          
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('ownerName')}</Text>
              <Text style={styles.infoValue}>{shopData.ownerName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('email')}</Text>
              <Text style={styles.infoValue}>{shopData.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('phone')}</Text>
              <Text style={styles.infoValue}>{shopData.phone}</Text>
            </View>
          </View>
        </View>

        {/* Shop Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('shopInformation')}</Text>
          
          <View style={styles.infoRow}>
            <Icon name="store" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('shopName')}</Text>
              <Text style={styles.infoValue}>{shopData.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="category" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('category')}</Text>
              <Text style={styles.infoValue}>{t(shopData.category)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="description" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('description')}</Text>
              <Text style={styles.infoValue}>{shopData.description}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location-on" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('address')}</Text>
              <Text style={styles.infoValue}>{shopData.address}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="business" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('businessProof')}</Text>
              <Text style={styles.infoValue}>{shopData.businessProof}</Text>
            </View>
          </View>
        </View>

        {/* Document Status Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('documentStatus')}</Text>
          
          <View style={styles.documentRow}>
            <Text style={styles.documentName}>{t('aadhaarCard')}</Text>
            <View style={[styles.documentBadge, { backgroundColor: getStatusColor(shopData.documents?.aadhaar) + '15' }]}>
              <Text style={[styles.documentStatus, { color: getStatusColor(shopData.documents?.aadhaar) }]}>
                {getStatusText(shopData.documents?.aadhaar)}
              </Text>
            </View>
          </View>

          <View style={styles.documentRow}>
            <Text style={styles.documentName}>{t('panCard')}</Text>
            <View style={[styles.documentBadge, { backgroundColor: getStatusColor(shopData.documents?.pan) + '15' }]}>
              <Text style={[styles.documentStatus, { color: getStatusColor(shopData.documents?.pan) }]}>
                {getStatusText(shopData.documents?.pan)}
              </Text>
            </View>
          </View>

          <View style={styles.documentRow}>
            <Text style={styles.documentName}>{t('shopLicense')}</Text>
            <View style={[styles.documentBadge, { backgroundColor: getStatusColor(shopData.documents?.license) + '15' }]}>
              <Text style={[styles.documentStatus, { color: getStatusColor(shopData.documents?.license) }]}>
                {getStatusText(shopData.documents?.license)}
              </Text>
            </View>
          </View>
        </View>

        {/* Registration Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('registrationInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Icon name="event" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('registrationDate')}</Text>
              <Text style={styles.infoValue}>{shopData.registrationDate}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="update" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('lastUpdated')}</Text>
              <Text style={styles.infoValue}>{shopData.lastUpdated}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.passwordButton}
            onPress={() => setPasswordModal(true)}
          >
            <Icon name="lock" size={20} color="#38bdf8" />
            <Text style={styles.passwordButtonText}>{t('changePassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#ef4444" />
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModal}
        onRequestClose={() => setEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('editProfile')}</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Owner Name */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('ownerName')} *</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.ownerName && styles.inputError]}
                  value={editForm.ownerName}
                  onChangeText={(text) => setEditForm({ ...editForm, ownerName: text })}
                  placeholder={t('enterOwnerName')}
                />
                {formErrors.ownerName && <Text style={styles.errorText}>{formErrors.ownerName}</Text>}
              </View>

              {/* Email */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('email')} *</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.email && styles.inputError]}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  placeholder={t('enterEmail')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
              </View>

              {/* Phone */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('phone')} *</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.phone && styles.inputError]}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                  placeholder={t('enterMobileNumber')}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}
              </View>

              {/* Address */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('address')} *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, formErrors.address && styles.inputError]}
                  value={editForm.address}
                  onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                  placeholder={t('enterAddress')}
                  multiline
                  numberOfLines={3}
                />
                {formErrors.address && <Text style={styles.errorText}>{formErrors.address}</Text>}
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>{t('saveChanges')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModal}
        onRequestClose={() => setPasswordModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('changePassword')}</Text>
              <TouchableOpacity onPress={() => setPasswordModal(false)}>
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Current Password */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('currentPassword')} *</Text>
                <View style={[styles.passwordInput, passwordErrors.current && styles.inputError]}>
                  <Icon name="lock" size={20} color="#94a3b8" />
                  <TextInput
                    style={styles.passwordTextInput}
                    placeholder={t('enterCurrentPassword')}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showCurrentPassword}
                    value={passwords.current}
                    onChangeText={(text) => setPasswords({ ...passwords, current: text })}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <Icon name={showCurrentPassword ? 'visibility' : 'visibility-off'} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {passwordErrors.current && <Text style={styles.errorText}>{passwordErrors.current}</Text>}
              </View>

              {/* New Password */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('newPassword')} *</Text>
                <View style={[styles.passwordInput, passwordErrors.new && styles.inputError]}>
                  <Icon name="lock" size={20} color="#94a3b8" />
                  <TextInput
                    style={styles.passwordTextInput}
                    placeholder={t('enterNewPassword')}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNewPassword}
                    value={passwords.new}
                    onChangeText={(text) => setPasswords({ ...passwords, new: text })}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Icon name={showNewPassword ? 'visibility' : 'visibility-off'} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {passwordErrors.new && <Text style={styles.errorText}>{passwordErrors.new}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('confirmPassword')} *</Text>
                <View style={[styles.passwordInput, passwordErrors.confirm && styles.inputError]}>
                  <Icon name="lock" size={20} color="#94a3b8" />
                  <TextInput
                    style={styles.passwordTextInput}
                    placeholder={t('confirmNewPassword')}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    value={passwords.confirm}
                    onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {passwordErrors.confirm && <Text style={styles.errorText}>{passwordErrors.confirm}</Text>}
              </View>

              {/* Update Button */}
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>{t('updatePassword')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  editButton: {
    padding: 8,
    marginRight: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
  },
  shopName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  shopId: {
    fontSize: 12,
    color: '#64748b',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  documentName: {
    fontSize: 14,
    color: '#1e293b',
  },
  documentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  documentStatus: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  passwordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  passwordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38bdf8',
  },
  logoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  modalField: {
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  passwordTextInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
    marginRight: 8,
  },
  modalSaveButton: {
    backgroundColor: '#38bdf8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ShopkeeperProfile;