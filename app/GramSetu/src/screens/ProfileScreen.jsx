import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';
import * as ImagePicker from 'react-native-image-picker';

import { db } from '../config/firebase';

const { width } = Dimensions.get('window');

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUDINARY_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'Documents';

const ProfileScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [passwordModal, setPasswordModal] = useState(false);
  const [imageOptionsVisible, setImageOptionsVisible] = useState(false);
  const [profileImage, setProfileImage] = useState({
    uri: null,
    fileName: null,
    public_id: null
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
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const session = await AsyncStorage.getItem('userSession');
      console.log("SESSION:", session);

      if (!session) {
        setLoading(false);
        return;
      }

      const parsedSession = JSON.parse(session);
      const userId = parsedSession.userId;

      console.log("User ID:", userId);

      const snapshot = await db
        .ref(`user_data/${userId}`)
        .once('value');

      console.log("Snapshot:", snapshot.val());

      if (snapshot.exists()) {
        const data = snapshot.val();

        const formattedData = {
          ...data,
          id: userId,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          nameGuj: `${data.firstNameGuj || ''} ${data.lastNameGuj || ''}`.trim(),
        };

        setUserData(formattedData);
        setEditedData(formattedData);

        // Load profile image if exists
        const imageSnapshot = await db
          .ref(`user_data/${userId}/profile_image`)
          .once('value');
        
        if (imageSnapshot.exists()) {
          setProfileImage(imageSnapshot.val());
        }
      }

      setLoading(false);

    } catch (error) {
      console.log("Profile Fetch Error:", error);
      setLoading(false);
    }
  };

  // Generate custom filename
  const generateFileName = (userId) => {
    const timestamp = Date.now();
    return `user_${userId}_profile_${timestamp}`;
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    const fileName = generateFileName(userData.id);
    
    const data = new FormData();
    const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = fileExtension === 'png' ? 'image/png' : 
                     fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg' : 
                     'image/jpeg';

    data.append("file", {
      uri: imageUri,
      type: mimeType,
      name: `${fileName}.${fileExtension}`,
    });

    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("public_id", fileName);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: data,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Upload failed");
      }

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        fileName: fileName
      };
    } catch (error) {
      console.log("Cloudinary upload error:", error);
      throw error;
    }
  };

  // Save image URL to Firebase
  const saveImageToFirebase = async (uploadResult) => {
    try {
      const imageData = {
        uri: uploadResult.secure_url,
        fileName: uploadResult.fileName,
        public_id: uploadResult.public_id,
        uploadedAt: new Date().toISOString(),
      };
      
      await db.ref(`user_data/${userData.id}/profile_image`).set(imageData);
      
      return imageData;
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      throw error;
    }
  };

  // Handle image selection
  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;

      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Image picker error');
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        Alert.alert('Error', 'No image selected');
        return;
      }

      const imageUri = response.assets[0].uri;

      try {
        setUploading(true);
        setImageOptionsVisible(false);

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(imageUri);

        // Save to Firebase
        const imageData = await saveImageToFirebase(uploadResult);

        // Update local state
        setProfileImage(imageData);

        Alert.alert(t('success'), 'Profile image uploaded successfully');

      } catch (error) {
        console.log(error);
        Alert.alert('Upload Failed', error.message || 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    });
  };

  // Handle camera capture
  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
      includeBase64: false,
    };

    ImagePicker.launchCamera(options, async (response) => {
      if (response.didCancel) return;

      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Camera error');
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        Alert.alert('Error', 'No image captured');
        return;
      }

      const imageUri = response.assets[0].uri;

      try {
        setUploading(true);
        setImageOptionsVisible(false);

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(imageUri);

        // Save to Firebase
        const imageData = await saveImageToFirebase(uploadResult);

        // Update local state
        setProfileImage(imageData);

        Alert.alert(t('success'), 'Profile image uploaded successfully');

      } catch (error) {
        console.log(error);
        Alert.alert('Upload Failed', error.message || 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    });
  };

  // Handle Edit
  const handleEdit = () => {
    setEditing(true);
    setEditedData({ ...userData });
  };

  // Handle Cancel
  const handleCancel = () => {
    setEditing(false);
    setEditedData({ ...userData });
  };

  // Handle Logout
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
              await AsyncStorage.removeItem('userSession');
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

  // Handle Save
  const handleSave = async () => {
    try {
      setSaving(true);

      if (!userData?.id) {
        Alert.alert("Error", "User ID missing");
        setSaving(false);
        return;
      }

      console.log("Updating user:", userData.id);
      console.log("Edited Data:", editedData);

      await db
        .ref(`user_data/${userData.id}`)
        .update({
          bloodGroup: editedData.bloodGroup || "",
          maritalStatus: editedData.maritalStatus || "",
          education: editedData.education || "",
          occupation: editedData.occupation || "",
          address: editedData.address || "",
          contactNumber: editedData.contactNumber || "",
          email: editedData.email || "",
          familyMembers: editedData.familyMembers || "",
        });

      await fetchUserData();

      setEditing(false);
      setSaving(false);

      Alert.alert("Success", "Profile updated successfully");

    } catch (error) {
      console.log("Update Error:", error);
      setSaving(false);
      Alert.alert("Error", "Update failed");
    }
  };

  // Handle Change Password
  const handleChangePassword = () => {
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

    if (Object.keys(errors).length === 0) {
      setTimeout(() => {
        Alert.alert(t('success'), t('passwordChanged'));
        setPasswordModal(false);
        setPasswords({ current: '', new: '', confirm: '' });
        setPasswordErrors({});
      }, 1500);
    }
  };

  // Render Field
  const renderField = (label, value, key, editable = true, multiline = false) => {
    if (!editing) {
      return (
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{value || '-'}</Text>
        </View>
      );
    }

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={[styles.fieldInput, multiline && styles.multilineInput]}
          value={editedData[key]?.toString() || ''}
          onChangeText={(text) => setEditedData({ ...editedData, [key]: text })}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
    );
  };

  // Render Section
  const renderSection = (title, content) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {content}
      </View>
    </View>
  );

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!userData) return 'U';
    const firstName = userData.firstName || '';
    const lastName = userData.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  // Loading
  if (loading) {
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
          <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
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
        {!editing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Icon name="edit" size={24} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleCancel}
          >
            <Icon name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Header with Image Upload */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => setImageOptionsVisible(true)}
            activeOpacity={0.7}
          >
            {profileImage.uri ? (
              <Image 
                source={{ uri: profileImage.uri }} 
                style={styles.profileImage}
                onError={() => console.log('Failed to load profile image')}
              />
            ) : (
              <Text style={styles.avatarText}>
                {getInitials()}
              </Text>
            )}
            <View style={styles.cameraIconContainer}>
              <Icon name="camera-alt" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          )}
        </View>
        <Text style={styles.profileName}>
          {language === 'gu' ? userData?.nameGuj || userData?.name : userData?.name}
        </Text>
        <Text style={styles.profileId}>ID: {userData?.id}</Text>
      </View>

      {/* Image Options Modal */}
      {imageOptionsVisible && (
        <View style={styles.imageOptionsOverlay}>
          <View style={styles.imageOptionsContainer}>
            <Text style={styles.imageOptionsTitle}>{t('uploadImage')}</Text>
            
            <TouchableOpacity 
              style={styles.imageOption}
              onPress={handleTakePhoto}
            >
              <Icon name="camera-alt" size={24} color="#38bdf8" />
              <Text style={styles.imageOptionText}>{t('takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageOption}
              onPress={handleSelectImage}
            >
              <Icon name="photo-library" size={24} color="#38bdf8" />
              <Text style={styles.imageOptionText}>{t('chooseFromGallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageOptionCancel}
              onPress={() => setImageOptionsVisible(false)}
            >
              <Text style={styles.imageOptionCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Section Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'personal' && styles.activeTab]}
          onPress={() => setActiveSection('personal')}
        >
          <Icon
            name="person"
            size={20}
            color={activeSection === 'personal' ? '#38bdf8' : '#64748b'}
          />
          <Text style={[styles.tabText, activeSection === 'personal' && styles.activeTabText]}>
            {t('personalInfo')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'contact' && styles.activeTab]}
          onPress={() => setActiveSection('contact')}
        >
          <Icon
            name="contact-phone"
            size={20}
            color={activeSection === 'contact' ? '#38bdf8' : '#64748b'}
          />
          <Text style={[styles.tabText, activeSection === 'contact' && styles.activeTabText]}>
            {t('contactInfo')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'documents' && styles.activeTab]}
          onPress={() => setActiveSection('documents')}
        >
          <Icon
            name="description"
            size={20}
            color={activeSection === 'documents' ? '#38bdf8' : '#64748b'}
          />
          <Text style={[styles.tabText, activeSection === 'documents' && styles.activeTabText]}>
            {t('documents')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Section */}
        {activeSection === 'personal' && renderSection(
          t('personalDetails'),
          <View>
            {renderField(t('fullName'), language === 'gu' ? userData?.nameGuj || userData?.name : userData?.name, 'name', false)}
            {renderField(t('dateOfBirth'), userData?.dateOfBirth, 'dateOfBirth', false)}
            {renderField(t('age'), userData?.age?.toString(), 'age', false)}
            {renderField(t('ageGroup'), userData?.ageGroup, 'ageGroup', false)}
            {renderField(t('gender'), language === 'gu' ? userData?.genderGuj || userData?.gender : userData?.gender, 'gender', false)}
            {renderField(t('bloodGroup'), userData?.bloodGroup, 'bloodGroup', editing)}
            {renderField(t('maritalStatus'), language === 'gu' ? userData?.maritalStatusGuj || userData?.maritalStatus : userData?.maritalStatus, 'maritalStatus', editing)}
            {renderField(t('education'), userData?.education, 'education', editing)}
            {renderField(t('occupation'), language === 'gu' ? userData?.occupationGuj || userData?.occupation : userData?.occupation, 'occupation', editing)}
          </View>
        )}

        {/* Contact Information Section */}
        {activeSection === 'contact' && renderSection(
          t('contactDetails'),
          <View>
            {renderField(t('address'), language === 'gu' ? userData?.addressGuj || userData?.address : userData?.address, 'address', editing, true)}
            {renderField(t('contactNumber'), userData?.contactNumber, 'contactNumber', editing)}
            {renderField(t('email'), userData?.email, 'email', editing)}
            {renderField(t('familyMembers'), userData?.familyMembers?.toString(), 'familyMembers', editing)}
          </View>
        )}

        {/* Documents Section */}
        {activeSection === 'documents' && renderSection(
          t('documentDetails'),
          <View>
            {renderField(t('aadharNumber'), userData?.aadharNumber, 'aadharNumber', false)}
            {renderField(t('voterId'), userData?.voterId, 'voterId', false)}
            {renderField(t('rationCardNumber'), userData?.rationCardNumber, 'rationCardNumber', false)}
            {renderField(t('disabilityDetails'), userData?.disabilityDetails || t('none'), 'disabilityDetails', false)}
          </View>
        )}

        {/* Action Buttons */}
        {editing ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.passwordChangeButton}
              onPress={() => setPasswordModal(true)}
            >
              <Icon name="lock" size={20} color="#38bdf8" />
              <Text style={styles.passwordChangeText}>{t('changePassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="logout" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Extra bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModal}
        onRequestClose={() => setPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('changePassword')}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setPasswordModal(false);
                  setPasswords({ current: '', new: '', confirm: '' });
                  setPasswordErrors({});
                }}
              >
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Current Password */}
              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>{t('currentPassword')}</Text>
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
                {passwordErrors.current && (
                  <Text style={styles.errorText}>{passwordErrors.current}</Text>
                )}
              </View>

              {/* New Password */}
              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>{t('newPassword')}</Text>
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
                {passwordErrors.new && (
                  <Text style={styles.errorText}>{passwordErrors.new}</Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>{t('confirmPassword')}</Text>
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
                {passwordErrors.confirm && (
                  <Text style={styles.errorText}>{passwordErrors.confirm}</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.changePasswordButtonText}>{t('updatePassword')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#38bdf8',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#ffffff',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#38bdf8',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 12,
    color: '#64748b',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 12,
    color: '#64748b',
  },
  activeTabText: {
    color: '#38bdf8',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  sectionContent: {
    gap: 12,
  },
  fieldContainer: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fieldInput: {
    fontSize: 14,
    color: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    backgroundColor: '#38bdf8',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  passwordChangeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    backgroundColor: '#eff6ff',
    borderColor: '#38bdf8',
  },
  passwordChangeText: {
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
  // Image Options Modal Styles
  imageOptionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  imageOptionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
  },
  imageOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  imageOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  imageOptionCancel: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  imageOptionCancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
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
    maxHeight: '80%',
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
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  passwordField: {
    marginBottom: 8,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
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
  inputError: {
    borderColor: '#ef4444',
  },
  passwordTextInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  changePasswordButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ProfileScreen;