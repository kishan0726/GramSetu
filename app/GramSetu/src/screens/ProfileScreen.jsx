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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

// Sample user data based on your DB structure
const SAMPLE_USER_DATA = {
  id: "1771659441412",
  aadharNumber: "1234-5678-9012",
  address: "123, Main Street, Ramnagar Village, District Ahmedabad",
  addressGuj: "૧૨૩, મુખ્ય માર્ગ, રામનગર ગામ, જિલ્લો અમદાવાદ",
  age: 32,
  ageGroup: "Adult (25-40)",
  bloodGroup: "O+",
  contactNumber: "9876543210",
  dateOfBirth: "1994-05-15",
  disabilityDetails: "None",
  education: "Graduate",
  name: "Kishan Shingrakhiya",
  nameGuj: "કિશન શિંગરખિયા",
  email: "kishan.s@example.com",
  gender: "Male",
  genderGuj: "પુરુષ",
  maritalStatus: "Married",
  maritalStatusGuj: "પરિણીત",
  occupation: "Farmer",
  occupationGuj: "ખેડૂત",
  familyMembers: 5,
  rationCardNumber: "R123456789",
  voterId: "ABC1234567",
  profileImage: null,
};

const ProfileScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [passwordModal, setPasswordModal] = useState(false);
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
  const [activeSection, setActiveSection] = useState('personal'); // 'personal', 'contact', 'documents'

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUserData(SAMPLE_USER_DATA);
      setEditedData(SAMPLE_USER_DATA);
      setLoading(false);
    }, 1000);
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedData({ ...userData });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedData({ ...userData });
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

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setUserData({ ...editedData });
      setEditing(false);
      setSaving(false);
      Alert.alert(t('success'), t('profileUpdated'));
    }, 1500);
  };

  const handleChangePassword = () => {
    // Validate passwords
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
      // Simulate API call
      setTimeout(() => {
        Alert.alert(t('success'), t('passwordChanged'));
        setPasswordModal(false);
        setPasswords({ current: '', new: '', confirm: '' });
        setPasswordErrors({});
      }, 1500);
    }
  };

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

  const renderSection = (title, content) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {content}
      </View>
    </View>
  );

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

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.name?.charAt(0) || 'U'}
            </Text>
          </View>
        </View>
        <Text style={styles.profileName}>
          {language === 'gu' ? userData?.nameGuj || userData?.name : userData?.name}
        </Text>
        <Text style={styles.profileId}>ID: {userData?.id}</Text>
      </View>

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
            {renderField(t('fullName'), language === 'gu' ? userData?.nameGuj || userData?.name : userData?.name, 'name', editing)}
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
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
    marginTop: 16,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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