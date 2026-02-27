import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';
import * as ImagePicker from 'react-native-image-picker';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dmjwrm8sp';
const CLOUDINARY_UPLOAD_PRESET = 'Documents';

const EditShopDetails = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { shopData, shopId } = route.params;
  
  // Initialize form data
  const [formData, setFormData] = useState({
    shopName: shopData.shopName || shopData.name || '',
    ownerName: shopData.ownerName || '',
    description: shopData.description || '',
    address: shopData.address || '',
    phone: shopData.phone || shopData.mobile || '',
    email: shopData.email || '',
    category: shopData.category || '',
    businessProof: shopData.businessProof || '',
    latitude: shopData.coordinates?.lat?.toString() || '',
    longitude: shopData.coordinates?.lng?.toString() || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [profileImage, setProfileImage] = useState({
    uri: shopData.shop_image?.profile?.url || null,
    fileName: shopData.shop_image?.profile?.fileName || null
  });
  const [originalData] = useState(formData);

  // Generate custom filename
  const generateFileName = (shopId, type) => {
    const timestamp = Date.now();
    return `${shopId}_profile_${timestamp}`;
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    const fileName = generateFileName(shopId, 'profile');
    
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
      await db.ref(`shops_list/${shopId}/shop_image/profile`).set({
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        fileName: uploadResult.fileName,
        uploadedAt: new Date().toISOString(),
      });
      
      await db.ref(`shops_list/${shopId}/lastUpdated`).set(new Date().toISOString().split('T')[0]);
      
      return true;
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

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(imageUri);

        // Save to Firebase
        await saveImageToFirebase(uploadResult);

        // Update local state
        setProfileImage({
          uri: uploadResult.secure_url,
          fileName: uploadResult.fileName
        });

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

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(imageUri);

        // Save to Firebase
        await saveImageToFirebase(uploadResult);

        // Update local state
        setProfileImage({
          uri: uploadResult.secure_url,
          fileName: uploadResult.fileName
        });

        Alert.alert(t('success'), 'Profile image uploaded successfully');

      } catch (error) {
        console.log(error);
        Alert.alert('Upload Failed', error.message || 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    });
  };

  // Show image options modal
  const [imageOptionsVisible, setImageOptionsVisible] = useState(false);

  const getChangedFields = () => {
    const changes = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changes[key] = formData[key];
      }
    });
    return changes;
  };

  const validateForm = () => {
    const errors = [];

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push(t('validEmail'));
    }
    
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.push(t('validMobile'));
    }

    if (errors.length > 0) {
      Alert.alert(t('error'), errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleFetchLocation = () => {
    setLocationLoading(true);
    
    setTimeout(() => {
      const mockLat = '23.0225';
      const mockLng = '72.5714';
      
      setFormData({
        ...formData,
        latitude: mockLat,
        longitude: mockLng,
      });
      
      setLocationLoading(false);
      Alert.alert(t('success'), t('locationFetched'));
    }, 1500);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const changedFields = getChangedFields();
    
    if (Object.keys(changedFields).length === 0) {
      Alert.alert(t('info'), t('noChangesDetected'));
      navigation.goBack();
      return;
    }

    setLoading(true);

    try {
      const updateData = {};
      
      if (changedFields.shopName) updateData.shopName = changedFields.shopName;
      if (changedFields.ownerName) updateData.ownerName = changedFields.ownerName;
      if (changedFields.description) updateData.description = changedFields.description;
      if (changedFields.address) updateData.address = changedFields.address;
      if (changedFields.phone) updateData.phone = changedFields.phone;
      if (changedFields.email) updateData.email = changedFields.email;
      if (changedFields.category) updateData.category = changedFields.category;
      if (changedFields.businessProof) updateData.businessProof = changedFields.businessProof;
      
      if (changedFields.latitude || changedFields.longitude) {
        updateData.coordinates = {
          lat: parseFloat(changedFields.latitude !== undefined ? changedFields.latitude : originalData.latitude) || 0,
          lng: parseFloat(changedFields.longitude !== undefined ? changedFields.longitude : originalData.longitude) || 0,
        };
      }
      
      updateData.lastUpdated = new Date().toISOString().split('T')[0];

      await db.ref(`shops_list/${shopId}`).update(updateData);

      Alert.alert(
        t('success'), 
        t('shopUpdated'),
        [{ text: t('ok'), onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('Error saving details:', error);
      Alert.alert(t('error'), error.message || t('saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'grocery', name: t('grocery') },
    { id: 'medical', name: t('medical') },
    { id: 'hardware', name: t('hardware') },
    { id: 'electronics', name: t('electronics') },
    { id: 'food', name: t('food') },
    { id: 'stationery', name: t('stationery') },
    { id: 'dairy', name: t('dairy') },
    { id: 'agriculture', name: t('agriculture') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editShop')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveText, loading && styles.disabledText]}>
            {loading ? t('saving') : t('save')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>{t('shopImage')}</Text>
            
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={() => setImageOptionsVisible(true)}
            >
              {profileImage.uri ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="store" size={40} color="#94a3b8" />
                  <Text style={styles.imagePlaceholderText}>{t('addImage')}</Text>
                </View>
              )}
              
              <View style={styles.imageOverlay}>
                <Icon name="camera-alt" size={20} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {profileImage.fileName && (
              <Text style={styles.fileNameText} numberOfLines={1}>
                {profileImage.fileName}
              </Text>
            )}
          </View>

          {/* Image Options Modal */}
          {imageOptionsVisible && (
            <View style={styles.imageOptionsOverlay}>
              <View style={styles.imageOptionsContainer}>
                <Text style={styles.imageOptionsTitle}>{t('uploadImage')}</Text>
                
                <TouchableOpacity 
                  style={styles.imageOption}
                  onPress={() => {
                    setImageOptionsVisible(false);
                    handleTakePhoto();
                  }}
                >
                  <Icon name="camera-alt" size={24} color="#38bdf8" />
                  <Text style={styles.imageOptionText}>{t('takePhoto')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.imageOption}
                  onPress={() => {
                    setImageOptionsVisible(false);
                    handleSelectImage();
                  }}
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

          {/* Shop Name */}
          <Text style={styles.label}>{t('shopName')}</Text>
          <TextInput
            style={styles.input}
            value={formData.shopName}
            onChangeText={(text) => setFormData({ ...formData, shopName: text })}
            placeholder={t('enterShopName')}
            placeholderTextColor="#94a3b8"
          />

          {/* Owner Name */}
          <Text style={styles.label}>{t('ownerName')}</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerName}
            onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
            placeholder={t('enterOwnerName')}
            placeholderTextColor="#94a3b8"
          />

          {/* Category Selection */}
          <Text style={styles.label}>{t('category')}</Text>
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

          {/* Description */}
          <Text style={styles.label}>{t('description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder={t('enterDescription')}
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />

          {/* Address */}
          <Text style={styles.label}>{t('address')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder={t('enterAddress')}
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={2}
          />

          {/* Phone */}
          <Text style={styles.label}>{t('phone')}</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder={t('enterPhone')}
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            maxLength={10}
          />

          {/* Email */}
          <Text style={styles.label}>{t('email')}</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder={t('enterEmail')}
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Business Proof */}
          <Text style={styles.label}>{t('businessProof')}</Text>
          <TextInput
            style={styles.input}
            value={formData.businessProof}
            onChangeText={(text) => setFormData({ ...formData, businessProof: text })}
            placeholder={t('enterBusinessProof')}
            placeholderTextColor="#94a3b8"
          />

          {/* Location Section */}
          <Text style={styles.label}>{t('shopLocation')}</Text>
          
          <View style={styles.locationRow}>
            <View style={styles.locationInputContainer}>
              <Text style={styles.locationInputLabel}>Latitude</Text>
              <TextInput
                style={styles.locationInput}
                value={formData.latitude}
                onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                placeholder="23.0225"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.locationInputContainer}>
              <Text style={styles.locationInputLabel}>Longitude</Text>
              <TextInput
                style={styles.locationInput}
                value={formData.longitude}
                onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                placeholder="72.5714"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleFetchLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#38bdf8" />
            ) : (
              <>
                <Icon name="my-location" size={20} color="#38bdf8" />
                <Text style={styles.locationButtonText}>
                  {t('fetchCurrentLocation')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Note about partial updates */}
          <View style={styles.noteContainer}>
            <Icon name="info" size={16} color="#38bdf8" />
            <Text style={styles.noteText}>
              {t('partialUpdateNote')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {(loading || uploading) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>
              {uploading ? t('uploading') : t('updating')}
            </Text>
          </View>
        </View>
      )}
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
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledText: {
    opacity: 0.5,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#38bdf8',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#38bdf8',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  fileNameText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  imageOptionsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  imageOptionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedCategoryChip: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
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
    marginBottom: 12,
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
    color: '#1e293b',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#38bdf8',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 14,
    color: '#1e293b',
  },
});

export default EditShopDetails;