import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const ManageStock = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { shopData, shopId } = route.params;
  
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [priceInputs, setPriceInputs] = useState({});

  // Load items when component mounts
  useEffect(() => {
    loadItems();
  }, []);

  // Filter items based on search query and low stock filter
  useEffect(() => {
    filterItems();
  }, [items, searchQuery, filterLowStock]);

  // Initialize price inputs when items change
  useEffect(() => {
    const initialPriceInputs = {};
    items.forEach(item => {
      initialPriceInputs[item.id] = item.price?.toString() || '';
    });
    setPriceInputs(initialPriceInputs);
  }, [items]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const itemsRef = db.ref(`shops_list/${shopId}/items`);
      itemsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const itemsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setItems(itemsArray);
        } else {
          setItems([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert(t('error'), t('failedToLoadItems'));
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply low stock filter (items with stock less than 10)
    if (filterLowStock) {
      filtered = filtered.filter(item => (item.stock || 0) < 10);
    }
    
    setFilteredItems(filtered);
  };

  const updateStock = async (itemId, newStock) => {
    if (newStock < 0) {
      Alert.alert(t('error'), t('stockCannotBeNegative'));
      return;
    }

    setUpdating(true);
    try {
      const itemRef = db.ref(`shops_list/${shopId}/items/${itemId}`);
      await itemRef.update({
        stock: newStock,
        lastStockUpdate: new Date().toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0]
      });

      // Update shop's lastUpdated timestamp
      await db.ref(`shops_list/${shopId}`).update({
        lastUpdated: new Date().toISOString().split('T')[0]
      });

      Alert.alert(t('success'), t('stockUpdatedSuccessfully'));
    } catch (error) {
      console.error('Error updating stock:', error);
      Alert.alert(t('error'), t('failedToUpdateStock'));
    } finally {
      setUpdating(false);
    }
  };

  const updatePrice = async (itemId, newPrice) => {
    if (newPrice <= 0) {
      Alert.alert(t('error'), t('priceMustBePositive'));
      return;
    }

    setUpdating(true);
    try {
      const itemRef = db.ref(`shops_list/${shopId}/items/${itemId}`);
      await itemRef.update({
        price: newPrice,
        lastPriceUpdate: new Date().toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0]
      });

      // Update shop's lastUpdated timestamp
      await db.ref(`shops_list/${shopId}`).update({
        lastUpdated: new Date().toISOString().split('T')[0]
      });

      Alert.alert(t('success'), t('priceUpdatedSuccessfully'));
    } catch (error) {
      console.error('Error updating price:', error);
      Alert.alert(t('error'), t('failedToUpdatePrice'));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddStock = () => {
    if (!selectedItem) return;
    
    const quantity = parseInt(quantityToAdd);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert(t('error'), t('enterValidQuantity'));
      return;
    }

    const currentStock = selectedItem.stock || 0;
    const newStock = currentStock + quantity;
    
    updateStock(selectedItem.id, newStock);
    setStockModalVisible(false);
    setQuantityToAdd('');
    setSelectedItem(null);
  };

  const handleReduceStock = () => {
    if (!selectedItem) return;
    
    const quantity = parseInt(quantityToAdd);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert(t('error'), t('enterValidQuantity'));
      return;
    }

    const currentStock = selectedItem.stock || 0;
    const newStock = currentStock - quantity;
    
    if (newStock < 0) {
      Alert.alert(t('error'), t('insufficientStock'));
      return;
    }
    
    updateStock(selectedItem.id, newStock);
    setStockModalVisible(false);
    setQuantityToAdd('');
    setSelectedItem(null);
  };

  const handlePriceInputChange = (itemId, value) => {
    setPriceInputs(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handlePriceUpdate = (itemId) => {
    const newPrice = parseFloat(priceInputs[itemId]);
    if (isNaN(newPrice) || newPrice <= 0) {
      Alert.alert(t('error'), t('enterValidPrice'));
      return;
    }
    
    updatePrice(itemId, newPrice);
  };

  const handleManualStockUpdate = (itemId, value) => {
    const newStock = parseInt(value);
    if (!isNaN(newStock)) {
      updateStock(itemId, newStock);
    }
  };

  const openStockModal = (item, action) => {
    setSelectedItem({ ...item, action });
    setStockModalVisible(true);
    setQuantityToAdd('');
  };

  const getStockStatusColor = (stock) => {
    if (stock <= 0) return '#ef4444'; // Red - Out of stock
    if (stock < 10) return '#f59e0b'; // Orange - Low stock
    return '#10b981'; // Green - In stock
  };

  const getStockStatusText = (stock) => {
    if (stock <= 0) return t('outOfStock');
    if (stock < 10) return t('lowStock');
    return t('inStock');
  };

  const renderItem = ({ item }) => {
    const stockStatusColor = getStockStatusColor(item.stock || 0);
    const stockStatusText = getStockStatusText(item.stock || 0);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemDetails}>
              <View style={styles.priceContainer}>
                <Text style={styles.itemPrice}>₹{item.price} / {item.unit}</Text>
              </View>
              <View style={[styles.stockBadge, { backgroundColor: stockStatusColor + '20' }]}>
                <View style={[styles.stockIndicator, { backgroundColor: stockStatusColor }]} />
                <Text style={[styles.stockStatusText, { color: stockStatusColor }]}>
                  {stockStatusText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price Update Section */}
        <View style={styles.priceUpdateContainer}>
          <Text style={styles.priceUpdateLabel}>{t('updatePrice')}:</Text>
          <View style={styles.priceUpdateInput}>
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              value={priceInputs[item.id] || ''}
              onChangeText={(value) => handlePriceInputChange(item.id, value)}
              placeholder={`${t('enterPrice')} (${item.unit})`}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity 
              style={styles.priceUpdateButton}
              onPress={() => handlePriceUpdate(item.id)}
            >
              <Icon name="attach-money" size={18} color="#ffffff" />
              <Text style={styles.priceUpdateButtonText}>{t('update')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stockContainer}>
          <View style={styles.currentStock}>
            <Text style={styles.stockLabel}>{t('currentStock')}</Text>
            <Text style={[styles.stockValue, { color: stockStatusColor }]}>
              {item.stock || 0} {item.unit}
            </Text>
          </View>

          <View style={styles.stockActions}>
            <TouchableOpacity 
              style={[styles.stockButton, styles.reduceButton]}
              onPress={() => openStockModal(item, 'reduce')}
            >
              <Icon name="remove" size={20} color="#ef4444" />
              <Text style={styles.reduceButtonText}>{t('reduce')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.stockButton, styles.addButton]}
              onPress={() => openStockModal(item, 'add')}
            >
              <Icon name="add" size={20} color="#10b981" />
              <Text style={styles.addButtonText}>{t('add')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.manualUpdateContainer}>
          <Text style={styles.manualUpdateLabel}>{t('setStock')}:</Text>
          <View style={styles.manualUpdateInput}>
            <TextInput
              style={styles.manualInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
              onSubmitEditing={(e) => handleManualStockUpdate(item.id, e.nativeEvent.text)}
            />
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={(e) => {
                const input = e.currentTarget.previousSibling;
                if (input && input.value) {
                  handleManualStockUpdate(item.id, input.value);
                }
              }}
            >
              <Text style={styles.updateButtonText}>{t('update')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.lastUpdated}>
          <Icon name="access-time" size={14} color="#64748b" />
          <Text style={styles.lastUpdatedText}>
            {t('lastStockUpdate')}: {item.lastStockUpdate ? new Date(item.lastStockUpdate).toLocaleDateString() : t('never')}
          </Text>
        </View>
        {item.lastPriceUpdate && (
          <View style={styles.lastUpdated}>
            <Icon name="attach-money" size={14} color="#64748b" />
            <Text style={styles.lastUpdatedText}>
              {t('lastPriceUpdate')}: {new Date(item.lastPriceUpdate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('manageStock')}</Text>
        <TouchableOpacity onPress={loadItems}>
          <Icon name="refresh" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Shop Info */}
      <View style={styles.shopInfo}>
        <Icon name="store" size={20} color="#38bdf8" />
        <Text style={styles.shopName}>{shopData?.shopName}</Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchItems')}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterLowStock && styles.filterButtonActive]}
          onPress={() => setFilterLowStock(!filterLowStock)}
        >
          <Icon 
            name="filter-list" 
            size={20} 
            color={filterLowStock ? '#38bdf8' : '#64748b'} 
          />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>{t('totalItems')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {items.filter(item => (item.stock || 0) < 10).length}
          </Text>
          <Text style={styles.statLabel}>{t('lowStock')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {items.filter(item => (item.stock || 0) <= 0).length}
          </Text>
          <Text style={styles.statLabel}>{t('outOfStock')}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('loadingItems')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="inventory" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                {searchQuery ? t('noItemsFound') : t('noItemsInShop')}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.addItemButton}
                  onPress={() => navigation.navigate('AddShopItem', { shopData, shopId })}
                >
                  <Text style={styles.addItemButtonText}>{t('addItems')}</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Stock Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={stockModalVisible}
        onRequestClose={() => setStockModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedItem?.action === 'add' ? t('addStock') : t('reduceStock')}
              </Text>
              <TouchableOpacity onPress={() => setStockModalVisible(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <>
                <View style={styles.modalItemInfo}>
                  <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                  <Text style={styles.modalItemCurrent}>
                    {t('currentStock')}: {selectedItem.stock || 0} {selectedItem.unit}
                  </Text>
                  <Text style={styles.modalItemPrice}>
                    {t('currentPrice')}: ₹{selectedItem.price} / {selectedItem.unit}
                  </Text>
                </View>

                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>
                    {t('quantityTo')} {selectedItem.action === 'add' ? t('add') : t('reduce')}:
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    value={quantityToAdd}
                    onChangeText={setQuantityToAdd}
                    placeholder={`${t('enterQuantity')} (${selectedItem.unit})`}
                    placeholderTextColor="#94a3b8"
                    autoFocus
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setStockModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.modalButton, 
                      selectedItem.action === 'add' ? styles.confirmAddButton : styles.confirmReduceButton
                    ]}
                    onPress={selectedItem.action === 'add' ? handleAddStock : handleReduceStock}
                  >
                    <Text style={styles.confirmButtonText}>
                      {selectedItem.action === 'add' ? t('add') : t('reduce')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {updating && (
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
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#1e293b',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    borderColor: '#38bdf8',
    backgroundColor: '#eff6ff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38bdf8',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceUpdateContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  priceUpdateLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  priceUpdateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  priceUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  priceUpdateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  currentStock: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  stockActions: {
    flexDirection: 'row',
    gap: 8,
  },
  stockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  addButton: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  addButtonText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  reduceButton: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  reduceButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  manualUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  manualUpdateLabel: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 8,
  },
  manualUpdateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: '#94a3b8',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 12,
    marginBottom: 20,
  },
  addItemButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addItemButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalItemInfo: {
    marginBottom: 20,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalItemCurrent: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  modalItemPrice: {
    fontSize: 14,
    color: '#64748b',
  },
  modalInputContainer: {
    marginBottom: 24,
  },
  modalInputLabel: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmAddButton: {
    backgroundColor: '#10b981',
  },
  confirmReduceButton: {
    backgroundColor: '#ef4444',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ManageStock;