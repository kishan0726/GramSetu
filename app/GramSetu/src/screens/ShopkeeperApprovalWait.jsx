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
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const { width } = Dimensions.get('window');

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dmjwrm8sp';
const CLOUDINARY_UPLOAD_PRESET = 'Documents';

const ShopkeeperApprovalWait = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { shopData: initialData } = route.params || {};

  const [shopData, setShopData] = useState(initialData || null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [documentModal, setDocumentModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    description: '',
    businessProof: '',
    latitude: '',
    longitude: '',
  });
  const [originalFormData, setOriginalFormData] = useState({});
  const [documents, setDocuments] = useState({
    aadhaar: { status: 'pending', uri: null, cloudinaryUrl: null, fileName: null },
    pan: { status: 'pending', uri: null, cloudinaryUrl: null, fileName: null },
    license: { status: 'pending', uri: null, cloudinaryUrl: null, fileName: null },
    businessProof: { status: 'pending', uri: null, cloudinaryUrl: null, fileName: null },
  });
  const [formErrors, setFormErrors] = useState({});

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      case 'uploaded':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'check-circle';
      case 'pending':
        return 'hourglass-empty';
      case 'rejected':
        return 'cancel';
      case 'uploaded':
        return 'cloud-done';
      default:
        return 'cloud-upload';
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
      case 'uploaded':
        return t('uploaded');
      default:
        return t('pending');
    }
  };

  const categories = [
    { id: 'grocery', name: t('grocery'), icon: 'shopping-cart' },
    { id: 'medical', name: t('medical'), icon: 'local-pharmacy' },
    { id: 'hardware', name: t('hardware'), icon: 'hardware' },
    { id: 'electronics', name: t('electronics'), icon: 'devices' },
    { id: 'food', name: t('food'), icon: 'restaurant' },
    { id: 'stationery', name: t('stationery'), icon: 'inventory' },
    { id: 'dairy', name: t('dairy'), icon: 'local-cafe' },
    { id: 'agriculture', name: t('agriculture'), icon: 'agriculture' },
  ];

  useEffect(() => {
    const loadShopData = async () => {
      try {
        console.log("STEP 1: Starting load...");
        setLoading(true);

        const session = await AsyncStorage.getItem('shopSession');
        console.log("STEP 2: Session raw:", session);

        if (!session) {
          console.log("No session found!");
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(session);
        console.log("STEP 3: Parsed session:", parsed);

        const shopId = parsed.shopId;
        console.log("STEP 4: Shop ID:", shopId);

        if (!shopId) {
          console.log("Shop ID is undefined!");
          setLoading(false);
          return;
        }

        const snapshot = await db.ref(`shops_list/${shopId}`).once('value');
        console.log("STEP 5: Snapshot exists?", snapshot.exists());

        if (snapshot.exists()) {
          console.log("STEP 6: Data:", snapshot.val());
          const data = snapshot.val();
          setShopData(data);

          // Initialize form data with fetched data
          const newFormData = {
            shopName: data.name || data.shopName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            category: data.category || '',
            description: data.description || '',
            businessProof: data.businessProof || '',
            latitude: data.coordinates?.lat?.toString() || '',
            longitude: data.coordinates?.lng?.toString() || '',
          };

          setFormData(newFormData);
          setOriginalFormData(newFormData);

          // Initialize documents
          if (data.shop_image) {
            const updatedDocs = { ...documents };

            const docTypes = ['aadhaar', 'pan', 'license'];
            for (const docType of docTypes) {
              if (data.shop_image[docType]) {
                updatedDocs[docType] = {
                  status: 'uploaded',
                  uri: null,
                  cloudinaryUrl: data.shop_image[docType].url,
                  fileName: data.shop_image[docType].fileName || null
                };
              } else {
                updatedDocs[docType] = {
                  status: data.documents?.[docType] || 'pending',
                  uri: null,
                  cloudinaryUrl: null,
                  fileName: null
                };
              }
            }

            setDocuments(updatedDocs);
          } else if (data.documents) {
            setDocuments({
              aadhaar: { status: data.documents.aadhaar || 'pending', uri: null, cloudinaryUrl: null, fileName: null },
              pan: { status: data.documents.pan || 'pending', uri: null, cloudinaryUrl: null, fileName: null },
              license: { status: data.documents.license || 'pending', uri: null, cloudinaryUrl: null, fileName: null },
              businessProof: { status: data.businessProof ? 'uploaded' : 'pending', uri: null, cloudinaryUrl: null, fileName: null },
            });
          }
        } else {
          console.log("Shop not found in DB");
        }

        setLoading(false);

      } catch (error) {
        console.log("ERROR:", error);
        setLoading(false);
      }
    };

    loadShopData();
  }, []);

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      let permissionStatus;

      if (Platform.OS === 'ios') {
        permissionStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }

      return permissionStatus === RESULTS.GRANTED;
    } catch (error) {
      console.log('Permission request error:', error);
      return false;
    }
  };

  // Fetch Location with fallback
  const handleFetchLocation = () => {
    setLocationLoading(true);

    const requestLocation = (useHighAccuracy = true) => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => resolve(position),
          error => reject(error),
          {
            enableHighAccuracy: useHighAccuracy,
            timeout: 8000,
            maximumAge: 0
          }
        );
      });
    };

    const tryWithFallback = async () => {
      try {
        console.log('Trying high accuracy location...');
        const position = await requestLocation(true);
        return position;
      } catch (highAccuracyError) {
        console.log('High accuracy failed, trying low accuracy...', highAccuracyError);

        try {
          const position = await requestLocation(false);
          return position;
        } catch (lowAccuracyError) {
          console.log('Low accuracy also failed', lowAccuracyError);
          throw lowAccuracyError;
        }
      }
    };

    const overallTimeout = setTimeout(() => {
      setLocationLoading(false);
      showLocationError({ code: 3, message: 'Overall location request timed out' });
    }, 20000);

    const showLocationError = (error) => {
      let errorMessage = 'Failed to get location';

      switch (error.code) {
        case 1:
          errorMessage = 'Location permission denied';
          break;
        case 2:
          errorMessage = 'Unable to get location. Please check if GPS is enabled.';
          break;
        case 3:
          errorMessage = 'Location request timed out. You can enter coordinates manually.';
          break;
        default:
          errorMessage = error.message || 'Unknown error';
      }

      Alert.alert(
        'Location Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => handleFetchLocation()
          },
          {
            text: 'Enter Manually',
            onPress: () => {
              Alert.alert('Info', 'Please enter coordinates manually');
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    };

    // Request permission first
    const executeLocationRequest = async () => {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        clearTimeout(overallTimeout);
        setLocationLoading(false);
        Alert.alert(
          'Permission Required',
          'Location permission is needed to get your current location.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return;
      }

      try {
        const position = await tryWithFallback();
        clearTimeout(overallTimeout);

        const { latitude, longitude } = position.coords;

        setFormData({
          ...formData,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });

        Alert.alert("Success", "Location captured successfully");
        setLocationLoading(false);

      } catch (error) {
        clearTimeout(overallTimeout);
        console.log('All location attempts failed:', error);
        showLocationError(error);
        setLocationLoading(false);
      }
    };

    executeLocationRequest();
  };

  // Function to generate custom filename
  const generateFileName = (shopId, docType) => {
    const timestamp = Date.now();
    return `${shopId}${docType}_${timestamp}`;
  };

  // Function to upload image to Cloudinary with custom filename
  const uploadToCloudinary = async (imageUri, shopId, docType) => {
    console.log("🔥 uploadToCloudinary CALLED");
    console.log("Cloud Name:", CLOUDINARY_CLOUD_NAME);
    console.log("Upload Preset:", CLOUDINARY_UPLOAD_PRESET);

    const fileName = generateFileName(shopId, docType);
    console.log("Generated filename:", fileName);

    const data = new FormData();

    // Get file extension and set proper mime type
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

    // Optional: Add custom filename as public_id
    data.append("public_id", fileName);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    console.log("Upload URL:", uploadUrl);

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
      console.log("Cloudinary response:", result);

      if (!response.ok) {
        console.log("Cloudinary error details:", result);
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

  // Function to save image URL to Firebase under shops_list/shop_image
  const saveImageUrlToFirebase = async (shopId, docType, uploadResult) => {
    console.log('Saving to Firebase shops_list/shop_image:', { shopId, docType, uploadResult });

    try {
      // Save to shops_list/shop_image path
      await db.ref(`shops_list/${shopId}/shop_image/${docType}`).set({
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        fileName: uploadResult.fileName,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        documentType: docType
      });

      // Also update the document status in shops_list/documents for backward compatibility
      await db.ref(`shops_list/${shopId}/documents/${docType}`).set('uploaded');

      // Update lastUpdated timestamp
      await db.ref(`shops_list/${shopId}/lastUpdated`).set(new Date().toISOString());

      return true;
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      throw error;
    }
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

  // Select Documents
  const handleSelectDocument = (docType) => {
    setSelectedDocType(docType);
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled');
        return;
      }

      if (response.errorCode) {
        console.log('ImagePicker Error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Image picker error');
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        Alert.alert('Error', 'No image selected');
        return;
      }

      const imageUri = response.assets[0].uri;
      console.log("Selected Image URI:", imageUri);

      try {
        setUploading(true);
        setDocumentModal(false);

        // Upload to Cloudinary with custom filename
        const uploadResult = await uploadToCloudinary(imageUri, shopData.id, docType);
        console.log("Upload result:", uploadResult);

        // Save to Firebase under shops_list/shop_image
        await saveImageUrlToFirebase(shopData.id, docType, uploadResult);

        // Update local state
        setDocuments((prev) => ({
          ...prev,
          [docType]: {
            status: 'uploaded',
            uri: imageUri,
            cloudinaryUrl: uploadResult.secure_url,
            fileName: uploadResult.fileName
          },
        }));

        Alert.alert('Success', `${docType} document uploaded successfully as ${uploadResult.fileName}`);

      } catch (error) {
        console.log(error);
        Alert.alert(
          'Upload Failed',
          error.message || 'Failed to upload document. Please try again.'
        );
      } finally {
        setUploading(false);
      }
    });
  };

  // Take Photo
  const handleTakePhoto = (docType) => {
    setSelectedDocType(docType);
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
      includeBase64: false,
    };

    ImagePicker.launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled');
        return;
      }

      if (response.errorCode) {
        console.log('ImagePicker Error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Camera error');
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        Alert.alert('Error', 'No image captured');
        return;
      }

      const imageUri = response.assets[0].uri;
      console.log("Captured Image URI:", imageUri);

      try {
        setUploading(true);
        setDocumentModal(false);

        // Upload to Cloudinary with custom filename
        const uploadResult = await uploadToCloudinary(imageUri, shopData.id, docType);
        console.log("Upload result:", uploadResult);

        // Save to Firebase under shops_list/shop_image
        await saveImageUrlToFirebase(shopData.id, docType, uploadResult);

        // Update local state
        setDocuments((prev) => ({
          ...prev,
          [docType]: {
            status: 'uploaded',
            uri: imageUri,
            cloudinaryUrl: uploadResult.secure_url,
            fileName: uploadResult.fileName
          },
        }));

        Alert.alert('Success', `${docType} document uploaded successfully as ${uploadResult.fileName}`);

      } catch (error) {
        console.log(error);
        Alert.alert(
          'Upload Failed',
          error.message || 'Failed to upload document. Please try again.'
        );
      } finally {
        setUploading(false);
      }
    });
  };

  // Simplified validation - only check if fields are not empty when they are provided
  const validateForm = () => {
    const errors = {};

    if (formData.shopName && !formData.shopName.trim()) {
      errors.shopName = t('shopNameRequired');
    }
    if (formData.email && !formData.email.trim()) {
      errors.email = t('emailRequired');
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('validEmail');
    }
    if (formData.phone && !formData.phone.trim()) {
      errors.phone = t('mobileRequired');
    } else if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = t('validMobile');
    }
    if (formData.address && !formData.address.trim()) {
      errors.address = t('addressRequired');
    }
    if (formData.description && !formData.description.trim()) {
      errors.description = t('descriptionRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to get only changed fields
  const getChangedFields = () => {
    const changes = {};

    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalFormData[key]) {
        changes[key] = formData[key];
      }
    });

    return changes;
  };

  // Save Details
  const handleSaveDetails = async () => {
    if (!validateForm()) {
      Alert.alert(t('error'), t('pleaseFixErrors'));
      return;
    }

    const changedFields = getChangedFields();

    if (Object.keys(changedFields).length === 0) {
      Alert.alert(t('info'), t('noChangesDetected'));
      setUpdateModal(false);
      return;
    }

    setLoading(true);

    try {
      const updateData = {};

      if (changedFields.shopName) updateData.name = changedFields.shopName;
      if (changedFields.email) updateData.email = changedFields.email;
      if (changedFields.phone) updateData.phone = changedFields.phone;
      if (changedFields.address) updateData.address = changedFields.address;
      if (changedFields.category) updateData.category = changedFields.category;
      if (changedFields.description) updateData.description = changedFields.description;
      if (changedFields.businessProof) updateData.businessProof = changedFields.businessProof;

      if (changedFields.latitude || changedFields.longitude) {
        updateData.coordinates = {
          lat: parseFloat(changedFields.latitude !== undefined ? changedFields.latitude : originalFormData.latitude) || 0,
          lng: parseFloat(changedFields.longitude !== undefined ? changedFields.longitude : originalFormData.longitude) || 0,
        };
      }

      updateData.lastUpdated = new Date().toISOString();

      console.log("Updating with changed fields:", updateData);

      await db.ref(`shops_list/${shopData.id}`).update(updateData);

      setShopData({
        ...shopData,
        ...updateData,
        coordinates: {
          ...shopData.coordinates,
          ...(updateData.coordinates || {}),
        }
      });

      setOriginalFormData({
        ...originalFormData,
        ...formData
      });

      setUpdateModal(false);
      Alert.alert(t('success'), t('detailsUpdated'));

    } catch (error) {
      console.error('Error saving details:', error);
      Alert.alert(t('error'), t('saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
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
          <Text style={styles.headerTitle}>{t('applicationStatus')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('loadingData')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if no shop data
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
          <Text style={styles.headerTitle}>{t('applicationStatus')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#ef4444" />
          <Text style={styles.errorText}>{t('noShopData')}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.replace('ShopkeeperLogin')}
          >
            <Text style={styles.retryText}>{t('goToLogin')}</Text>
          </TouchableOpacity>
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
        >
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('applicationStatus')}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => setUpdateModal(true)}
        >
          <Icon name="edit" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(shopData?.status) + '15' }]}>
            <Icon
              name={getStatusIcon(shopData?.status)}
              size={60}
              color={getStatusColor(shopData?.status)}
            />
          </View>

          <Text style={styles.statusTitle}>
            {shopData?.status === 'pending' ? t('applicationPending') : t('applicationRejected')}
          </Text>

          <Text style={styles.statusMessage}>
            {shopData?.status === 'pending'
              ? t('pendingMessage')
              : t('rejectedMessage')}
          </Text>

          {/* Progress Timeline */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]}>
                <Icon name="check" size={12} color="#ffffff" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{t('registrationSubmitted')}</Text>
                <Text style={styles.timelineDate}>
                  {shopData?.createdAt
                    ? new Date(shopData.createdAt).toLocaleDateString('en-GB')
                    : '-'}
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, {
                backgroundColor: shopData?.status === 'pending' ? '#f59e0b' :
                  shopData?.status === 'approved' ? '#10b981' : '#ef4444'
              }]}>
                <Icon
                  name={shopData?.status === 'pending' ? 'hourglass-empty' :
                    shopData?.status === 'approved' ? 'check' : 'close'}
                  size={12}
                  color="#ffffff"
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{t('adminReview')}</Text>
                <Text style={styles.timelineDate}>
                  {shopData?.status === 'pending' ? t('inProgress') : t('rejected')}
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, {
                backgroundColor: shopData?.status === 'approved' ? '#10b981' : '#e2e8f0'
              }]}>
                <Icon name="check" size={12} color="#ffffff" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, shopData?.status !== 'approved' && styles.timelineInactive]}>
                  {t('finalApproval')}
                </Text>
                <Text style={styles.timelineDate}>
                  {shopData?.status === 'rejected' ? t('rejected') : t('pending')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shop Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('shopInformation')}</Text>
            <TouchableOpacity onPress={() => setUpdateModal(true)}>
              <Text style={styles.editText}>{t('edit')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Icon name="store" size={16} color="#64748b" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('shopName')}</Text>
                <Text style={styles.detailValue}>{shopData?.name || shopData?.shopName || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="email" size={16} color="#64748b" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('email')}</Text>
                <Text style={styles.detailValue}>{shopData?.email || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="phone" size={16} color="#64748b" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('mobile')}</Text>
                <Text style={styles.detailValue}>{shopData?.phone || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="category" size={16} color="#64748b" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('category')}</Text>
                <Text style={styles.detailValue}>{shopData?.category ? t(shopData.category) : 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="description" size={16} color="#64748b" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('description')}</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{shopData?.description || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.addressSection}>
            <Icon name="location-on" size={16} color="#64748b" />
            <Text style={styles.addressText}>{shopData?.address || 'N/A'}</Text>
          </View>
        </View>

        {/* Documents Status Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('documentStatus')}</Text>
            <TouchableOpacity onPress={() => setDocumentModal(true)}>
              <Text style={styles.editText}>{t('upload')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.documentList}>
            <View style={styles.documentRow}>
              <View style={styles.documentInfo}>
                <Icon name="badge" size={20} color="#64748b" />
                <Text style={styles.documentName}>{t('aadhaarCard')}</Text>
              </View>
              <View style={styles.documentRight}>
                {documents.aadhaar.fileName && (
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {documents.aadhaar.fileName}
                  </Text>
                )}
                <View style={[styles.documentBadge, { backgroundColor: getStatusColor(documents.aadhaar.status) + '15' }]}>
                  <Icon name={getStatusIcon(documents.aadhaar.status)} size={14} color={getStatusColor(documents.aadhaar.status)} />
                  <Text style={[styles.documentStatus, { color: getStatusColor(documents.aadhaar.status) }]}>
                    {getStatusText(documents.aadhaar.status)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.documentRow}>
              <View style={styles.documentInfo}>
                <Icon name="credit-card" size={20} color="#64748b" />
                <Text style={styles.documentName}>{t('panCard')}</Text>
              </View>
              <View style={styles.documentRight}>
                {documents.pan.fileName && (
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {documents.pan.fileName}
                  </Text>
                )}
                <View style={[styles.documentBadge, { backgroundColor: getStatusColor(documents.pan.status) + '15' }]}>
                  <Icon name={getStatusIcon(documents.pan.status)} size={14} color={getStatusColor(documents.pan.status)} />
                  <Text style={[styles.documentStatus, { color: getStatusColor(documents.pan.status) }]}>
                    {getStatusText(documents.pan.status)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.documentRow}>
              <View style={styles.documentInfo}>
                <Icon name="receipt" size={20} color="#64748b" />
                <Text style={styles.documentName}>{t('shopLicense')}</Text>
              </View>
              <View style={styles.documentRight}>
                {documents.license.fileName && (
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    {documents.license.fileName}
                  </Text>
                )}
                <View style={[styles.documentBadge, { backgroundColor: getStatusColor(documents.license.status) + '15' }]}>
                  <Icon name={getStatusIcon(documents.license.status)} size={14} color={getStatusColor(documents.license.status)} />
                  <Text style={[styles.documentStatus, { color: getStatusColor(documents.license.status) }]}>
                    {getStatusText(documents.license.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={styles.updateMainButton}
          onPress={() => setUpdateModal(true)}
        >
          <Icon name="edit" size={20} color="#ffffff" />
          <Text style={styles.updateMainButtonText}>{t('updateInformation')}</Text>
        </TouchableOpacity>

        {/* Note */}
        <View style={styles.noteCard}>
          <Icon name="info" size={20} color="#38bdf8" />
          <Text style={styles.noteText}>
            {t('approvalNote')}
          </Text>
        </View>


        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#ef4444" />
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* Language Switcher */}
        <View>
          <LanguageSwitcher />
        </View>
      </ScrollView>

      {/* Update Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={updateModal}
        onRequestClose={() => setUpdateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('updateShopDetails')}</Text>
              <TouchableOpacity onPress={() => setUpdateModal(false)}>
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Shop Name - Optional now */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('shopName')} (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.shopName && styles.inputError]}
                  value={formData.shopName}
                  onChangeText={(text) => setFormData({ ...formData, shopName: text })}
                  placeholder={t('enterShopName')}
                />
                {formErrors.shopName && <Text style={styles.errorText}>{formErrors.shopName}</Text>}
              </View>

              {/* Email - Optional now */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('email')} (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder={t('enterEmail')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
              </View>

              {/* Phone - Optional now */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('mobileNumber')} (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, formErrors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder={t('enterMobileNumber')}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}
              </View>

              {/* Category - Optional now */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('category')} (Optional)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          formData.category === cat.id && styles.selectedCategoryChip,
                        ]}
                        onPress={() => setFormData({ ...formData, category: cat.id })}
                      >
                        <Icon
                          name={cat.icon}
                          size={16}
                          color={formData.category === cat.id ? '#ffffff' : '#64748b'}
                        />
                        <Text style={[
                          styles.categoryChipText,
                          formData.category === cat.id && styles.selectedCategoryChipText,
                        ]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {formErrors.category && <Text style={styles.errorText}>{formErrors.category}</Text>}
              </View>

              {/* Address - Optional now */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('address')} (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, formErrors.address && styles.inputError]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder={t('enterAddress')}
                  multiline
                  numberOfLines={3}
                />
                {formErrors.address && <Text style={styles.errorText}>{formErrors.address}</Text>}
              </View>

              {/* Description - Optional now */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('description')} (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, formErrors.description && styles.inputError]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder={t('enterDescription')}
                  multiline
                  numberOfLines={3}
                />
                {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
              </View>

              {/* Location Section - Optional */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('shopLocation')} (Optional)</Text>

                {/* Latitude and Longitude Row */}
                <View style={styles.locationRow}>
                  <View style={styles.locationInputContainer}>
                    <Text style={styles.locationInputLabel}>Latitude</Text>
                    <TextInput
                      style={[styles.locationInput, styles.halfInput]}
                      value={formData.latitude}
                      onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                      placeholder="23.0225"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.locationInputContainer}>
                    <Text style={styles.locationInputLabel}>Longitude</Text>
                    <TextInput
                      style={[styles.locationInput, styles.halfInput]}
                      value={formData.longitude}
                      onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                      placeholder="72.5714"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Fetch Location Button - Updated with working location */}
                <TouchableOpacity
                  style={styles.fetchLocationButton}
                  onPress={handleFetchLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color="#38bdf8" />
                  ) : (
                    <>
                      <Icon name="my-location" size={20} color="#38bdf8" />
                      <Text style={styles.fetchLocationText}>{t('fetchCurrentLocation')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Business Proof - Optional */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('businessProof')} (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={formData.businessProof}
                  onChangeText={(text) => setFormData({ ...formData, businessProof: text })}
                  placeholder={t('enterBusinessProof')}
                />
              </View>

              {/* Document Upload Section */}
              <View style={styles.modalDocumentSection}>
                <Text style={styles.modalSectionTitle}>{t('uploadDocuments')}</Text>

                <TouchableOpacity
                  style={styles.modalDocumentButton}
                  onPress={() => {
                    setSelectedDocType('aadhaar');
                    setDocumentModal(true);
                  }}
                >
                  <View style={styles.modalDocumentInfo}>
                    <Icon name="badge" size={20} color="#38bdf8" />
                    <Text style={styles.modalDocumentText}>{t('aadhaarCard')}</Text>
                  </View>
                  <View style={[styles.modalDocumentBadge, { backgroundColor: getStatusColor(documents.aadhaar.status) + '15' }]}>
                    <Text style={[styles.modalDocumentStatus, { color: getStatusColor(documents.aadhaar.status) }]}>
                      {getStatusText(documents.aadhaar.status)}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalDocumentButton}
                  onPress={() => {
                    setSelectedDocType('pan');
                    setDocumentModal(true);
                  }}
                >
                  <View style={styles.modalDocumentInfo}>
                    <Icon name="credit-card" size={20} color="#38bdf8" />
                    <Text style={styles.modalDocumentText}>{t('panCard')}</Text>
                  </View>
                  <View style={[styles.modalDocumentBadge, { backgroundColor: getStatusColor(documents.pan.status) + '15' }]}>
                    <Text style={[styles.modalDocumentStatus, { color: getStatusColor(documents.pan.status) }]}>
                      {getStatusText(documents.pan.status)}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalDocumentButton}
                  onPress={() => {
                    setSelectedDocType('license');
                    setDocumentModal(true);
                  }}
                >
                  <View style={styles.modalDocumentInfo}>
                    <Icon name="receipt" size={20} color="#38bdf8" />
                    <Text style={styles.modalDocumentText}>{t('shopLicense')}</Text>
                  </View>
                  <View style={[styles.modalDocumentBadge, { backgroundColor: getStatusColor(documents.license.status) + '15' }]}>
                    <Text style={[styles.modalDocumentStatus, { color: getStatusColor(documents.license.status) }]}>
                      {getStatusText(documents.license.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveDetails}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>{t('saveChanges')}</Text>
                )}
              </TouchableOpacity>

              {/* Note about partial updates */}
              <Text style={styles.partialUpdateNote}>
                {t('partialUpdateNote')}
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Document Upload Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={documentModal}
        onRequestClose={() => setDocumentModal(false)}
      >
        <View style={styles.simpleModalOverlay}>
          <View style={styles.simpleModalContent}>
            <Text style={styles.simpleModalTitle}>{t('uploadDocument')}</Text>

            <TouchableOpacity
              style={styles.simpleModalOption}
              onPress={() => handleTakePhoto(selectedDocType)}
            >
              <Icon name="camera-alt" size={24} color="#38bdf8" />
              <Text style={styles.simpleModalOptionText}>{t('takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simpleModalOption}
              onPress={() => handleSelectDocument(selectedDocType)}
            >
              <Icon name="photo-library" size={24} color="#38bdf8" />
              <Text style={styles.simpleModalOptionText}>{t('chooseFromGallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simpleModalCancel}
              onPress={() => setDocumentModal(false)}
            >
              <Text style={styles.simpleModalCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Uploading Overlay */}
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.uploadingText}>{t('uploading')}</Text>
          </View>
        </View>
      )}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  refreshButton: {
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
  },
  retryButton: {
    marginTop: 20,
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
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  timelineContainer: {
    width: '100%',
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#64748b',
  },
  timelineInactive: {
    color: '#94a3b8',
  },
  detailsCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  editText: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '500',
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  addressSection: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
  },
  documentList: {
    gap: 12,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    color: '#1e293b',
  },
  documentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '60%',
  },
  fileNameText: {
    fontSize: 10,
    color: '#64748b',
    maxWidth: 100,
  },
  documentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  documentStatus: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  updateMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38bdf8',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  updateMainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
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
  categoryScroll: {
    flexGrow: 0,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  selectedCategoryChip: {
    backgroundColor: '#38bdf8',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#1e293b',
  },
  selectedCategoryChipText: {
    color: '#ffffff',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationInputContainer: {
    flex: 0.48,
  },
  locationInputLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  locationInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  halfInput: {
    width: '100%',
  },
  fetchLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  fetchLocationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#38bdf8',
  },
  modalDocumentSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalDocumentButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalDocumentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalDocumentText: {
    fontSize: 14,
    color: '#1e293b',
  },
  modalDocumentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalDocumentStatus: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
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
  partialUpdateNote: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  simpleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
  },
  simpleModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  simpleModalOption: {
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
  simpleModalOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  simpleModalCancel: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  simpleModalCancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  uploadingText: {
    fontSize: 14,
    color: '#1e293b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
});

export default ShopkeeperApprovalWait;