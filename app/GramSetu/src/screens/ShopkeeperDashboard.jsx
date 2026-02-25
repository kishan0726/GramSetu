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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

// Sample shop data - this would come from API after login
const SAMPLE_SHOP_DATA = {
  id: "SHOP001",
  name: "Ram Kirana Store",
  ownerName: "Ram Kumar",
  email: "ram.kirana@example.com",
  phone: "+91 9876543210",
  address: "Main Road, Near Post Office, Ramnagar Village",
  category: "grocery",
  description: "Daily grocery items, vegetables, and household essentials",
  businessProof: "GST Certificate",
  documents: {
    aadhaar: "uploaded",
    pan: "uploaded",
    license: "approved"
  },
  status: "approved",
  registrationDate: "2024-01-15",
  lastUpdated: "2026-02-21",
  coordinates: {
    lat: 23.0225,
    lng: 72.5714
  },
  inventory: [
    { id: 1, name: "Rice", price: 45, unit: "kg", stock: 100 },
    { id: 2, name: "Wheat", price: 35, unit: "kg", stock: 80 },
    { id: 3, name: "Sugar", price: 42, unit: "kg", stock: 60 },
    { id: 4, name: "Oil", price: 120, unit: "liter", stock: 40 },
    { id: 5, name: "Milk", price: 25, unit: "liter", stock: 30 },
    { id: 6, name: "Eggs", price: 6, unit: "piece", stock: 200 },
  ]
};

const ShopkeeperDashboard = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = () => {
    setLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      try {
        setShopData(SAMPLE_SHOP_DATA);
        setLoading(false);
      } catch (err) {
        setError(t('failedToLoad'));
        setLoading(false);
      }
    }, 1000);
  };

  const handleProfilePress = () => {
    try {
      navigation.navigate('ShopkeeperProfile', { shopData });
    } catch (err) {
      Alert.alert(t('error'), t('screenNotAvailable'));
    }
  };

  const handleEditShop = () => {
    try {
      navigation.navigate('EditShopDetails', { shopData });
    } catch (err) {
      Alert.alert(t('error'), t('featureComingSoon'));
    }
  };

  const handleAddItem = () => {
    try {
      navigation.navigate('AddShopItem', { shopData });
    } catch (err) {
      Alert.alert(t('error'), t('featureComingSoon'));
    }
  };

  const handleManageStock = () => {
    try {
      navigation.navigate('ManageStock', { shopData });
    } catch (err) {
      Alert.alert(t('error'), t('featureComingSoon'));
    }
  };

  const handleViewReports = () => {
    try {
      navigation.navigate('ShopReports', { shopData });
    } catch (err) {
      Alert.alert(t('info'), t('comingSoon'));
    }
  };

  const handleViewAllItems = () => {
    try {
      navigation.navigate('ShopInventory', { shopData });
    } catch (err) {
      Alert.alert(t('info'), t('comingSoon'));
    }
  };

  const handleItemPress = (item) => {
    try {
      navigation.navigate('ItemDetails', { item, shopId: shopData.id });
    } catch (err) {
      Alert.alert(t('info'), t('comingSoon'));
    }
  };

  const calculateTotalValue = () => {
    return shopData?.inventory?.reduce((sum, item) => sum + (item.price * item.stock), 0) || 0;
  };

  const calculateTotalStock = () => {
    return shopData?.inventory?.reduce((sum, item) => sum + item.stock, 0) || 0;
  };

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
          <Text style={styles.headerTitle}>{t('shopkeeperDashboard')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('loadingShop')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
          <Text style={styles.headerTitle}>{t('shopkeeperDashboard')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchShopData}>
            <Text style={styles.retryText}>{t('retry')}</Text>
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
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {shopData?.name || t('shopkeeperDashboard')}
        </Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <Icon name="person" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.welcomeTitle}>{t('welcomeBack')}</Text>
          <Text style={styles.welcomeName}>{shopData?.ownerName}</Text>
        </View>
        <View style={styles.shopBadge}>
          <Icon name="check-circle" size={16} color="#10b981" />
          <Text style={styles.shopBadgeText}>{t('active')}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="inventory" size={24} color="#38bdf8" />
            <Text style={styles.statNumber}>{shopData?.inventory?.length || 0}</Text>
            <Text style={styles.statLabel}>{t('totalItems')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="stacked-line-chart" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{calculateTotalStock()}</Text>
            <Text style={styles.statLabel}>{t('totalStock')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="currency-rupee" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>₹{calculateTotalValue()}</Text>
            <Text style={styles.statLabel}>{t('inventoryValue')}</Text>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleEditShop}>
            <View style={[styles.actionIcon, { backgroundColor: '#eff6ff' }]}>
              <Icon name="edit" size={30} color="#38bdf8" />
            </View>
            <Text style={styles.actionText}>{t('editShop')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleAddItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#e6f7e6' }]}>
              <Icon name="add-box" size={30} color="#10b981" />
            </View>
            <Text style={styles.actionText}>{t('addItem')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleManageStock}>
            <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
              <Icon name="inventory" size={30} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>{t('manageStock')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleViewReports}>
            <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
              <Icon name="assessment" size={30} color="#ef4444" />
            </View>
            <Text style={styles.actionText}>{t('reports')}</Text>
          </TouchableOpacity>
        </View>

        {/* Shop Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>{t('shopInformation')}</Text>
            <TouchableOpacity onPress={handleEditShop}>
              <Text style={styles.infoEdit}>{t('edit')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Icon name="category" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('category')}:</Text>
            <Text style={styles.infoValue}>{t(shopData?.category || '')}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="description" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('description')}:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{shopData?.description}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location-on" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('address')}:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{shopData?.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="phone" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('contact')}:</Text>
            <Text style={styles.infoValue}>{shopData?.phone}</Text>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  profileButton: {
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
  welcomeBanner: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 14,
    color: '#64748b',
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  shopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7e6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  shopBadgeText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoEdit: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    width: 70,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
  },
  inventorySection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  seeAllText: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '500',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 11,
    color: '#64748b',
  },
  itemDetails: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyInventory: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addFirstText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default ShopkeeperDashboard;