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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const ShopkeeperDashboard = ({ navigation }) => {
  const { t } = useLanguage();

  const [shopData, setShopData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopId, setShopId] = useState(null);

  const calculateTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.price * (item.stock || 0)), 0) || 0;
  };

  const calculateTotalStock = () => {
    return items.reduce((sum, item) => sum + (item.stock || 0), 0) || 0;
  };

  const getStockStatusColor = (stock) => {
    if (stock <= 0) return '#ef4444';
    if (stock < 10) return '#f59e0b';
    return '#10b981';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'check-circle';
      case 'pending':
        return 'hourglass-empty';
      case 'rejected':
        return 'cancel';
      default:
        return 'info';
    }
  };

  useEffect(() => {
    loadShopData();
  }, []);

  // Fetch Data from Database
  const loadShopData = async () => {
    try {
      console.log("STEP 1: Loading shop data...");
      setLoading(true);

      const session = await AsyncStorage.getItem('shopSession');
      console.log("STEP 2: Session raw:", session);

      if (!session) {
        console.log("No session found!");
        setError(t('noSessionFound'));
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(session);
      console.log("STEP 3: Parsed session:", parsed);

      const shopId = parsed.shopId;
      console.log("STEP 4: Shop ID:", shopId);

      if (!shopId) {
        console.log("Shop ID is undefined!");
        setError(t('noShopId'));
        setLoading(false);
        return;
      }

      setShopId(shopId);

      // Set up real-time listener for shop data
      const shopRef = db.ref(`shops_list/${shopId}`);
      
      shopRef.on('value', (snapshot) => {
        console.log("STEP 5: Snapshot exists?", snapshot.exists());

        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("STEP 6: Data loaded:", data);
          setShopData(data);
          
          // Extract items from the items object
          if (data.items) {
            const itemsArray = Object.keys(data.items).map(key => ({
              id: key,
              ...data.items[key]
            }));
            setItems(itemsArray);
          } else {
            setItems([]);
          }
          
          setError(null);
        } else {
          console.log("Shop not found in DB");
          setError(t('shopNotFound'));
        }
        setLoading(false);
      }, (error) => {
        console.log("STEP 5 Error:", error);
        setError(t('failedToLoad'));
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => shopRef.off();

    } catch (error) {
      console.log("ERROR:", error);
      setError(t('failedToLoad'));
      setLoading(false);
    }
  };

  // Navigate to Shopkeeper Profile
  const handleProfilePress = () => {
    if (shopData) {
      navigation.navigate('ShopkeeperProfile', { shopData, shopId });
    }
  };

  // Navigate to Add Item Screen
  const handleAddItem = () => {
    if (shopData) {
      navigation.navigate('AddShopItem', { shopData, shopId });
    }
  };

  // Navigate to Manage Stock
  const handleManageStock = () => {
    if (shopData) {
      navigation.navigate('ManageStock', { shopData, shopId });
    }
  };

  // Navigate to Shop Inventory
  const handleViewAllItems = () => {
    if (shopData) {
      navigation.navigate('ShopInventory', { shopData, shopId, items });
    }
  };

  // Navigate Item Details
  const handleItemPress = (item) => {
    if (shopData) {
      navigation.navigate('ItemDetails', { item, shopId });
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
                routes: [{ name: 'ShopkeeperLogin' }],
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

  // Error Screen
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
          <TouchableOpacity style={styles.retryButton} onPress={loadShopData}>
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If shop is not approved, show appropriate message and redirect
  if (shopData?.status !== 'approved') {
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
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Icon name="person" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusMessageContainer}>
          <View style={[styles.statusIconLarge, { backgroundColor: getStatusColor(shopData?.status) + '15' }]}>
            <Icon
              name={getStatusIcon(shopData?.status)}
              size={60}
              color={getStatusColor(shopData?.status)}
            />
          </View>
          
          <Text style={styles.statusTitle}>
            {shopData?.status === 'pending' ? t('applicationPending') : t('applicationRejected')}
          </Text>
          
          <Text style={styles.statusDescription}>
            {shopData?.status === 'pending' 
              ? t('pendingDashboardMessage') 
              : t('rejectedDashboardMessage')}
          </Text>

          <TouchableOpacity 
            style={styles.goToApprovalButton}
            onPress={() => navigation.navigate('ShopkeeperApprovalWait', { shopData })}
          >
            <Text style={styles.goToApprovalButtonText}>{t('viewApplicationStatus')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Approved Shop Dashboard
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
          {shopData?.shopName || shopData?.name || t('shopkeeperDashboard')}
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
          <Text style={styles.welcomeName}>{shopData?.ownerName || 'Shop Owner'}</Text>
        </View>
        <View style={[styles.approvedBadge, { backgroundColor: getStatusColor('approved') + '15' }]}>
          <Icon name="check-circle" size={16} color={getStatusColor('approved')} />
          <Text style={[styles.approvedBadgeText, { color: getStatusColor('approved') }]}>
            {t('approved')}
          </Text>
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
            <Text style={styles.statNumber}>{items.length}</Text>
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

        {/* Action Grid - Only 2 items now */}
        <View style={styles.actionGrid}>
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
        </View>

        {/* Shop Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>{t('shopInformation')}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="category" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('category')}:</Text>
            <Text style={styles.infoValue}>{shopData?.category ? t(shopData.category) : 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="description" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('description')}:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{shopData?.description || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="location-on" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('address')}:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{shopData?.address || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="phone" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('contact')}:</Text>
            <Text style={styles.infoValue}>{shopData?.mobileNumber || shopData?.phone || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="email" size={16} color="#64748b" />
            <Text style={styles.infoLabel}>{t('email')}:</Text>
            <Text style={styles.infoValue}>{shopData?.email || 'N/A'}</Text>
          </View>
        </View>

        {/* Inventory Section - Now fills the bottom space */}
        <View style={styles.inventorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('inventory')}</Text>
            {items.length > 0 && (
              <TouchableOpacity onPress={handleViewAllItems}>
                <Text style={styles.seeAllText}>{t('viewAll')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {items.length > 0 ? (
            items.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.inventoryItem}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemUnit}>{item.unit}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                  <View style={[styles.stockBadge, { backgroundColor: getStockStatusColor(item.stock) + '20' }]}>
                    <Text style={[styles.stockText, { color: getStockStatusColor(item.stock) }]}>
                      {item.stock || 0} {t('inStock')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyInventory}>
              <Icon name="inventory" size={60} color="#e2e8f0" />
              <Text style={styles.emptyText}>{t('noItems')}</Text>
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={handleAddItem}
              >
                <Text style={styles.addFirstText}>{t('addFirstItem')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  goToApprovalButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  goToApprovalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  approvedBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 30,
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
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
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
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyInventory: {
    alignItems: 'center',
    paddingVertical: 40,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});

export default ShopkeeperDashboard;