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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const EditShopDetails = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { shopData, shopId } = route.params;
  
  // Initialize form data with all editable fields from your DB structure
  const [formData, setFormData] = useState({
    shopName: shopData.shopName || shopData.name || '',
    ownerName: shopData.ownerName || '',
    description: shopData.description || '',
    address: shopData.address || '',
    phone: shopData.phone || shopData.mobile || '',
    email: shopData.email || '',
    category: shopData.category || '',
    businessProof: shopData.businessProof || '',
    // Coordinates if available
    latitude: shopData.coordinates?.lat?.toString() || '',
    longitude: shopData.coordinates?.lng?.toString() || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [originalData] = useState(formData); // Store original data for comparison

  // Function to get only changed fields
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
    // Optional validation - only check if fields are provided
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

  // Mock location fetch function (to be implemented later)
  const handleFetchLocation = () => {
    setLocationLoading(true);
    
    // TODO: Implement actual location fetching using Geolocation API
    // This is just a mock for now
    setTimeout(() => {
      // Mock coordinates (will be replaced with actual GPS coordinates)
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
    
    // Check if any fields were changed
    if (Object.keys(changedFields).length === 0) {
      Alert.alert(t('info'), t('noChangesDetected'));
      navigation.goBack();
      return;
    }

    setLoading(true);

    try {
      // Prepare update object with proper field mapping
      const updateData = {};
      
      // Map form fields to database fields (only include changed fields)
      if (changedFields.shopName) updateData.shopName = changedFields.shopName;
      if (changedFields.ownerName) updateData.ownerName = changedFields.ownerName;
      if (changedFields.description) updateData.description = changedFields.description;
      if (changedFields.address) updateData.address = changedFields.address;
      if (changedFields.phone) updateData.phone = changedFields.phone;
      if (changedFields.email) updateData.email = changedFields.email;
      if (changedFields.category) updateData.category = changedFields.category;
      if (changedFields.businessProof) updateData.businessProof = changedFields.businessProof;
      
      // Handle coordinates update
      if (changedFields.latitude || changedFields.longitude) {
        updateData.coordinates = {
          lat: parseFloat(changedFields.latitude !== undefined ? changedFields.latitude : originalData.latitude) || 0,
          lng: parseFloat(changedFields.longitude !== undefined ? changedFields.longitude : originalData.longitude) || 0,
        };
      }
      
      // Always update lastUpdated timestamp
      updateData.lastUpdated = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

      console.log("Updating shop with data:", updateData);
      console.log("Shop ID:", shopId);

      // Update shop data in Firebase
      await db.ref(`shops_list/${shopId}`).update(updateData);

      Alert.alert(
        t('success'), 
        t('shopUpdated'),
        [
          {
            text: t('ok'),
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error saving details:', error);
      Alert.alert(t('error'), error.message || t('saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Categories for selection
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

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
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
          
          {/* Latitude and Longitude Inputs */}
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
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>{t('updating')}</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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