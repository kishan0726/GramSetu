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
  TextInput,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const ShopInventory = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { shopData, shopId, items: initialItems } = route.params;
  
  const [items, setItems] = useState(initialItems || []);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });

  const calculateStats = () => {
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + (item.price * (item.stock || 0)), 0);
    const lowStockItems = items.filter(item => (item.stock || 0) < 10 && (item.stock || 0) > 0).length;
    const outOfStockItems = items.filter(item => (item.stock || 0) === 0).length;

    setStats({
      totalItems,
      totalStock,
      totalValue,
      lowStockItems,
      outOfStockItems,
    });
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: t('outOfStock'), color: '#ef4444', bgColor: '#fee2e2' };
    if (stock < 10) return { label: t('lowStock'), color: '#f59e0b', bgColor: '#fef3c7' };
    return { label: t('inStock'), color: '#10b981', bgColor: '#e6f7e6' };
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getSortIcon = (type) => {
    if (sortBy !== type) return 'unfold-more';
    return sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward';
  };

  useEffect(() => {
    if (items.length > 0) {
      calculateStats();
      filterAndSortItems();
    }
  }, [items, searchQuery, sortBy, sortOrder, filterLowStock]);

  // Filter Item
  const filterAndSortItems = () => {
    let filtered = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.unit?.toLowerCase().includes(query)
      );
    }

    if (filterLowStock) {
      filtered = filtered.filter(item => (item.stock || 0) < 10);
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'price':
          aVal = a.price || 0;
          bVal = b.price || 0;
          break;
        case 'stock':
          aVal = a.stock || 0;
          bVal = b.stock || 0;
          break;
        case 'value':
          aVal = (a.price || 0) * (a.stock || 0);
          bVal = (b.price || 0) * (b.stock || 0);
          break;
        default:
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  };

  // Navigate Item Details
  const handleItemPress = (item) => {
    navigation.navigate('ItemDetails', { item, shopId });
  };

  // Navigate Add Shop Item
  const handleAddItem = () => {
    navigation.navigate('AddShopItem', { shopData, shopId });
  };

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

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
        <Text style={styles.headerTitle}>{t('inventory')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
        >
          <Icon name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>{t('totalItems')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalStock}</Text>
          <Text style={styles.statLabel}>{t('totalStock')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{stats.totalValue}</Text>
          <Text style={styles.statLabel}>{t('totalValue')}</Text>
        </View>
      </View>

      {/* Warning Stats */}
      <View style={styles.warningStats}>
        <View style={[styles.warningCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.warningValue, { color: '#f59e0b' }]}>{stats.lowStockItems}</Text>
          <Text style={[styles.warningLabel, { color: '#92400e' }]}>{t('lowStock')}</Text>
        </View>
        <View style={[styles.warningCard, { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.warningValue, { color: '#ef4444' }]}>{stats.outOfStockItems}</Text>
          <Text style={[styles.warningLabel, { color: '#991b1b' }]}>{t('outOfStock')}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchItems')}
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterLowStock && styles.filterChipActive]}
          onPress={() => setFilterLowStock(!filterLowStock)}
        >
          <Icon 
            name="warning" 
            size={16} 
            color={filterLowStock ? '#ffffff' : '#f59e0b'} 
          />
          <Text style={[styles.filterChipText, filterLowStock && styles.filterChipTextActive]}>
            {t('showLowStock')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.resultCount}>
          {filteredItems.length} {t('items')}
        </Text>
      </View>

      {/* Sort Header */}
      <View style={styles.sortHeader}>
        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('name')}>
          <Text style={styles.sortOptionText}>{t('item')}</Text>
          <Icon name={getSortIcon('name')} size={16} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('price')}>
          <Text style={styles.sortOptionText}>{t('price')}</Text>
          <Icon name={getSortIcon('price')} size={16} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('stock')}>
          <Text style={styles.sortOptionText}>{t('stock')}</Text>
          <Icon name={getSortIcon('stock')} size={16} color="#64748b" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sortOption} onPress={() => handleSort('value')}>
          <Text style={styles.sortOptionText}>{t('value')}</Text>
          <Icon name={getSortIcon('value')} size={16} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Inventory List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const stockStatus = getStockStatus(item.stock);
              const itemValue = (item.price || 0) * (item.stock || 0);
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleContainer}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemUnit}>{item.unit}</Text>
                    </View>
                    <View style={[styles.stockBadge, { backgroundColor: stockStatus.bgColor }]}>
                      <Text style={[styles.stockText, { color: stockStatus.color }]}>
                        {stockStatus.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemDetails}>
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>{t('price')}</Text>
                      <Text style={styles.detailValue}>{formatCurrency(item.price)}</Text>
                    </View>
                    
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>{t('stock')}</Text>
                      <Text style={[styles.detailValue, { color: stockStatus.color }]}>
                        {item.stock || 0}
                      </Text>
                    </View>
                    
                    <View style={styles.detailColumn}>
                      <Text style={styles.detailLabel}>{t('value')}</Text>
                      <Text style={styles.detailValue}>{formatCurrency(itemValue)}</Text>
                    </View>
                  </View>

                  {item.category && (
                    <View style={styles.itemFooter}>
                      <Icon name="category" size={12} color="#94a3b8" />
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="inventory" size={80} color="#e2e8f0" />
              <Text style={styles.emptyText}>{t('noItemsFound')}</Text>
              {searchQuery || filterLowStock ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery('');
                    setFilterLowStock(false);
                  }}
                >
                  <Text style={styles.clearButtonText}>{t('clearFilters')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addButtonLarge}
                  onPress={handleAddItem}
                >
                  <Icon name="add" size={20} color="#ffffff" />
                  <Text style={styles.addButtonText}>{t('addFirstItem')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
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
  addButton: {
    padding: 8,
    marginRight: -8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  warningStats: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  warningCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  warningValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#f59e0b',
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  resultCount: {
    fontSize: 12,
    color: '#64748b',
  },
  sortHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitleContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 11,
    color: '#64748b',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemDetails: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  detailColumn: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCategory: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38bdf8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ShopInventory;