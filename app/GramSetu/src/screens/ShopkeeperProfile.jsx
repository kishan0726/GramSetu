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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const ShopkeeperProfile = ({ navigation, route }) => {
  const { t, language } = useLanguage();
  const { shopData: initialData, shopId: routeShopId } = route.params || {};

  const [shopData, setShopData] = useState(initialData || null);
  const [shopId, setShopId] = useState(routeShopId || null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!initialData);
  const [editModal, setEditModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    ownerName: '',
    email: '',
    mobileNumber: '',
    phone: '',
    address: '',
    description: '',
    category: '',
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
    if (!initialData && shopId) {
      fetchShopData();
    } else if (shopData) {
      initializeForm();
    }
  }, []);

  useEffect(() => {
    if (shopData) {
      initializeForm();
    }
  }, [shopData]);

  const fetchShopData = async () => {
    setFetching(true);
    try {
      const shopRef = db.ref(`shops_list/${shopId}`);
      const snapshot = await shopRef.once('value');

      if (snapshot.exists()) {
        const data = snapshot.val();
        setShopData(data);
      } else {
        Alert.alert(t('error'), t('shopNotFound'));
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      Alert.alert(t('error'), t('failedToLoad'));
    } finally {
      setFetching(false);
    }
  };

  const handleEditShop = () => {
    if (shopData) {
      navigation.navigate('EditShopDetails', { shopData, shopId });
    }
  };

  const initializeForm = () => {
    setEditForm({
      ownerName: shopData.ownerName || '',
      email: shopData.email || '',
      mobileNumber: shopData.mobileNumber || '',
      phone: shopData.phone || '',
      address: shopData.address || '',
      description: shopData.description || '',
      category: shopData.category || '',
    });
  };

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

    const phoneNumber = editForm.mobileNumber || editForm.phone;
    if (!phoneNumber.trim()) {
      errors.mobileNumber = t('mobileRequired');
    } else if (!/^[0-9]{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      errors.mobileNumber = t('validMobile');
    }

    if (!editForm.address.trim()) {
      errors.address = t('addressRequired');
    }
    if (!editForm.description.trim()) {
      errors.description = t('descriptionRequired');
    }
    if (!editForm.category.trim()) {
      errors.category = t('categoryRequired');
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

  const handleSaveProfile = async () => {
    if (!validateEditForm()) {
      Alert.alert(t('error'), t('pleaseFixErrors'));
      return;
    }

    setLoading(true);
    try {
      const shopRef = db.ref(`shops_list/${shopId}`);

      // Prepare update data (only include fields that have changed)
      const updates = {};

      if (editForm.ownerName !== shopData.ownerName) {
        updates.ownerName = editForm.ownerName;
      }
      if (editForm.email !== shopData.email) {
        updates.email = editForm.email;
      }
      if (editForm.mobileNumber !== shopData.mobileNumber) {
        updates.mobileNumber = editForm.mobileNumber;
      }
      if (editForm.address !== shopData.address) {
        updates.address = editForm.address;
      }
      if (editForm.description !== shopData.description) {
        updates.description = editForm.description;
      }
      if (editForm.category !== shopData.category) {
        updates.category = editForm.category;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        updates.lastUpdated = new Date().toISOString().split('T')[0];
        await shopRef.update(updates);

        // Update local state
        setShopData({
          ...shopData,
          ...updates
        });

        Alert.alert(t('success'), t('profileUpdated'));
      } else {
        Alert.alert(t('info'), t('noChangesDetected'));
      }

      setEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('error'), t('updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get the current shop data to verify current password
      const shopRef = db.ref(`shops_list/${shopId}`);
      const snapshot = await shopRef.once('value');

      if (!snapshot.exists()) {
        Alert.alert(t('error'), t('shopNotFound'));
        setLoading(false);
        return;
      }

      const shopData = snapshot.val();

      // Check if current password matches (considering both password and confirmPassword fields)
      const storedPassword = shopData.password || shopData.confirmPassword;

      if (!storedPassword) {
        Alert.alert(t('error'), t('noPasswordSet'));
        setLoading(false);
        return;
      }

      // Verify current password
      if (passwords.current !== storedPassword) {
        setPasswordErrors({ ...passwordErrors, current: t('incorrectCurrentPassword') });
        setLoading(false);
        return;
      }

      // Update password in Firebase
      // Update both password and confirmPassword fields to keep them in sync
      await shopRef.update({
        password: passwords.new,
        confirmPassword: passwords.new,
        lastUpdated: new Date().toISOString().split('T')[0]
      });

      // Clear the form and close modal
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordModal(false);

      Alert.alert(t('success'), t('passwordChanged'));

    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert(t('error'), error.message || t('passwordChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
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
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('shopSession');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Get profile image URL from shop_image
  const getProfileImage = () => {
    return shopData?.shop_image?.profile?.url || null;
  };

  // Get first letter for avatar fallback
  const getInitial = () => {
    return shopData?.shopName?.charAt(0) || shopData?.name?.charAt(0) || 'S';
  };

  if (fetching) {
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
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#ef4444" />
          <Text style={styles.errorText}>{t('shopNotFound')}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchShopData}
          >
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const profileImage = getProfileImage();

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
          onPress={handleEditShop}
        >
          <Icon name="edit" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header Card with Image */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                onError={() => console.log('Failed to load image')}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitial()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.shopName}>{shopData.shopName || shopData.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shopData.status) + '15' }]}>
            <Icon name="circle" size={8} color={getStatusColor(shopData.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(shopData.status) }]}>
              {getStatusText(shopData.status)}
            </Text>
          </View>
          <Text style={styles.shopId}>{t('shopId')}: {shopId}</Text>
        </View>

        {/* Owner Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('ownerInformation')}</Text>

          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('ownerName')}</Text>
              <Text style={styles.infoValue}>{shopData.ownerName || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('email')}</Text>
              <Text style={styles.infoValue}>{shopData.email || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('phone')}</Text>
              <Text style={styles.infoValue}>{shopData.mobileNumber || shopData.phone || 'N/A'}</Text>
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
              <Text style={styles.infoValue}>{shopData.shopName || shopData.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="category" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('category')}</Text>
              <Text style={styles.infoValue}>
                {shopData.category ? t(shopData.category) : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="description" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('description')}</Text>
              <Text style={styles.infoValue}>{shopData.description || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location-on" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('address')}</Text>
              <Text style={styles.infoValue}>{shopData.address || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="business" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('businessProof')}</Text>
              <Text style={styles.infoValue}>{shopData.businessProof || 'N/A'}</Text>
            </View>
          </View>

          {shopData.coordinates && (
            <View style={styles.infoRow}>
              <Icon name="map" size={20} color="#64748b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('location')}</Text>
                <Text style={styles.infoValue}>
                  Lat: {shopData.coordinates.lat}, Lng: {shopData.coordinates.lng}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Document Status Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('documentStatus')}</Text>

          <View style={styles.documentRow}>
            <Text style={styles.documentName}>{t('aadhaarCard')}</Text>
            <View style={[styles.documentBadge, { backgroundColor: getStatusColor(shopData.documents?.aadhaar || 'pending') + '15' }]}>
              <Text style={[styles.documentStatus, { color: getStatusColor(shopData.documents?.aadhaar || 'pending') }]}>
                {getStatusText(shopData.documents?.aadhaar || 'pending')}
              </Text>
            </View>
          </View>

          <View style={styles.documentRow}>
            <Text style={styles.documentName}>{t('panCard')}</Text>
            <View style={[styles.documentBadge, { backgroundColor: getStatusColor(shopData.documents?.pan || 'pending') + '15' }]}>
              <Text style={[styles.documentStatus, { color: getStatusColor(shopData.documents?.pan || 'pending') }]}>
                {getStatusText(shopData.documents?.pan || 'pending')}
              </Text>
            </View>
          </View>

          <View style={styles.documentRow}>
            <Text style={styles.documentName}>{t('shopLicense')}</Text>
            <View style={[styles.documentBadge, { backgroundColor: getStatusColor(shopData.documents?.license || 'pending') + '15' }]}>
              <Text style={[styles.documentStatus, { color: getStatusColor(shopData.documents?.license || 'pending') }]}>
                {getStatusText(shopData.documents?.license || 'pending')}
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
              <Text style={styles.infoValue}>{formatDate(shopData.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="update" size={20} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('lastUpdated')}</Text>
              <Text style={styles.infoValue}>{formatDate(shopData.lastUpdated)}</Text>
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
                  placeholderTextColor="#94a3b8"
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
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
              </View>

              {/* Mobile Number */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('mobileNumber')} *</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.mobileNumber && styles.inputError]}
                  value={editForm.mobileNumber || editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, mobileNumber: text })}
                  placeholder={t('enterMobileNumber')}
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {formErrors.mobileNumber && <Text style={styles.errorText}>{formErrors.mobileNumber}</Text>}
              </View>

              {/* Category */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('category')} *</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.category && styles.inputError]}
                  value={editForm.category}
                  onChangeText={(text) => setEditForm({ ...editForm, category: text })}
                  placeholder={t('enterShopType')}
                  placeholderTextColor="#94a3b8"
                />
                {formErrors.category && <Text style={styles.errorText}>{formErrors.category}</Text>}
              </View>

              {/* Description */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('description')} *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, formErrors.description && styles.inputError]}
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                  placeholder={t('enterDescription')}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
                {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
              </View>

              {/* Address */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('address')} *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, formErrors.address && styles.inputError]}
                  value={editForm.address}
                  onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                  placeholder={t('enterAddress')}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
                {formErrors.address && <Text style={styles.errorText}>{formErrors.address}</Text>}
              </View>

              {/* Note about partial updates */}
              <Text style={styles.noteText}>{t('partialUpdateNote')}</Text>

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#38bdf8',
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
    color: '#1e293b',
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
  noteText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ShopkeeperProfile;