import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { db } from '../config/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// Sample shops data based on your DB structure - Only approved shops
const SAMPLE_SHOPS = [
  {
    id: "shop001",
    name: "Ram Kirana Store",
    ownerName: "Ram Prasad",
    address: "Main Road, Near Post Office, Ramnagar Village",
    category: "grocery",
    subCategory: "kirana",
    description: "Daily grocery items, vegetables, and household essentials",
    email: "ram.kirana@example.com",
    phone: "9876543210",
    alternatePhone: "9876543211",
    coordinates: {
      lat: 23.0225,
      lng: 72.5714
    },
    businessProof: "GST Certificate",
    documents: {
      aadhaar: "uploaded",
      pan: "uploaded",
      license: "approved"
    },
    status: "approved",
    rating: 4.5,
    totalRatings: 128,
    openingTime: "8:00 AM",
    closingTime: "9:00 PM",
    deliveryAvailable: true,
    paymentMethods: ["cash", "upi", "card"],
    inventory: [
      { item: "Rice", price: 45, unit: "kg", available: true },
      { item: "Wheat", price: 35, unit: "kg", available: true },
      { item: "Sugar", price: 42, unit: "kg", available: true },
      { item: "Salt", price: 20, unit: "pack", available: true },
      { item: "Milk", price: 25, unit: "liter", available: true },
      { item: "Eggs", price: 6, unit: "piece", available: true },
      { item: "Bread", price: 30, unit: "pack", available: true },
      { item: "Oil", price: 120, unit: "liter", available: true },
    ],
    image: "https://via.placeholder.com/100",
    verified: true,
    createdAt: "2024-01-15",
  },
  {
    id: "shop002",
    name: "Sharma Medical Store",
    ownerName: "Rajesh Sharma",
    address: "Market Complex, Near Bus Stand, Ramnagar Village",
    category: "medical",
    subCategory: "pharmacy",
    description: "All types of medicines, surgical items, and health products",
    email: "sharma.medical@example.com",
    phone: "9876543212",
    coordinates: {
      lat: 23.0235,
      lng: 72.5724
    },
    businessProof: "Drug License",
    documents: {
      aadhaar: "uploaded",
      pan: "uploaded",
      license: "approved"
    },
    status: "approved",
    rating: 4.3,
    totalRatings: 89,
    openingTime: "9:00 AM",
    closingTime: "10:00 PM",
    deliveryAvailable: false,
    paymentMethods: ["cash", "upi", "card"],
    inventory: [
      { item: "Paracetamol", price: 10, unit: "strip", available: true },
      { item: "Cough Syrup", price: 85, unit: "bottle", available: true },
      { item: "Vitamin C", price: 120, unit: "strip", available: true },
      { item: "Band Aid", price: 25, unit: "pack", available: true },
      { item: "Thermometer", price: 150, unit: "piece", available: true },
    ],
    image: "https://via.placeholder.com/100",
    verified: true,
    createdAt: "2024-01-20",
  },
  {
    id: "shop003",
    name: "Patel Hardware",
    ownerName: "Mahesh Patel",
    address: "Station Road, Near Water Tank, Ramnagar Village",
    category: "hardware",
    subCategory: "tools",
    description: "Hardware tools, paints, plumbing and electrical supplies",
    email: "patel.hardware@example.com",
    phone: "9876543213",
    coordinates: {
      lat: 23.0215,
      lng: 72.5704
    },
    businessProof: "GST Certificate",
    documents: {
      aadhaar: "uploaded",
      pan: "uploaded",
      license: "approved"
    },
    status: "approved",
    rating: 4.2,
    totalRatings: 56,
    openingTime: "8:30 AM",
    closingTime: "8:30 PM",
    deliveryAvailable: false,
    paymentMethods: ["cash", "upi"],
    inventory: [
      { item: "Hammer", price: 250, unit: "piece", available: true },
      { item: "Screwdriver", price: 120, unit: "set", available: true },
      { item: "Paint", price: 350, unit: "liter", available: true },
      { item: "Pipe", price: 180, unit: "meter", available: true },
      { item: "Switch", price: 45, unit: "piece", available: true },
    ],
    image: "https://via.placeholder.com/100",
    verified: true,
    createdAt: "2024-02-01",
  },
  {
    id: "shop004",
    name: "Desai Electronics",
    ownerName: "Amit Desai",
    address: "Main Bazaar, Ramnagar Village",
    category: "electronics",
    subCategory: "repairs",
    description: "TV, Fridge, AC repairs and electronic accessories",
    email: "desai.electronics@example.com",
    phone: "9876543214",
    coordinates: {
      lat: 23.0245,
      lng: 72.5734
    },
    businessProof: "GST Certificate",
    documents: {
      aadhaar: "uploaded",
      pan: "uploaded",
      license: "approved"
    },
    status: "approved",
    rating: 4.0,
    totalRatings: 42,
    openingTime: "10:00 AM",
    closingTime: "8:00 PM",
    deliveryAvailable: true,
    paymentMethods: ["cash", "upi"],
    inventory: [
      { item: "Wire", price: 15, unit: "meter", available: true },
      { item: "Plug", price: 30, unit: "piece", available: true },
      { item: "Adapter", price: 250, unit: "piece", available: true },
      { item: "Remote", price: 180, unit: "piece", available: true },
    ],
    image: "https://via.placeholder.com/100",
    verified: true,
    createdAt: "2024-02-10",
  },
  {
    id: "shop005",
    name: "Gupta Sweet Mart",
    ownerName: "Ramesh Gupta",
    address: "Near Temple, Ramnagar Village",
    category: "food",
    subCategory: "sweets",
    description: "Fresh sweets, snacks and bakery items",
    email: "gupta.sweets@example.com",
    phone: "9876543215",
    coordinates: {
      lat: 23.0255,
      lng: 72.5744
    },
    businessProof: "Food License",
    documents: {
      aadhaar: "uploaded",
      pan: "uploaded",
      license: "approved"
    },
    status: "approved",
    rating: 4.7,
    totalRatings: 215,
    openingTime: "7:00 AM",
    closingTime: "10:00 PM",
    deliveryAvailable: true,
    paymentMethods: ["cash", "upi"],
    inventory: [
      { item: "Gulab Jamun", price: 200, unit: "kg", available: true },
      { item: "Samosa", price: 15, unit: "piece", available: true },
      { item: "Bread", price: 30, unit: "pack", available: true },
      { item: "Cake", price: 350, unit: "kg", available: true },
    ],
    image: "https://via.placeholder.com/100",
    verified: true,
    createdAt: "2024-01-25",
  },
  {
    id: "shop006",
    name: "Verma Stationery",
    ownerName: "Sunita Verma",
    address: "Near School, Ramnagar Village",
    category: "stationery",
    subCategory: "books",
    description: "School supplies, books, and office stationery",
    email: "verma.stationery@example.com",
    phone: "9876543216",
    coordinates: {
      lat: 23.0265,
      lng: 72.5754
    },
    businessProof: "Shop License",
    documents: {
      aadhaar: "uploaded",
      pan: "uploaded",
      license: "approved"
    },
    status: "approved",
    rating: 4.4,
    totalRatings: 78,
    openingTime: "9:00 AM",
    closingTime: "8:00 PM",
    deliveryAvailable: false,
    paymentMethods: ["cash", "upi"],
    inventory: [
      { item: "Notebook", price: 50, unit: "piece", available: true },
      { item: "Pen", price: 10, unit: "piece", available: true },
      { item: "Pencil", price: 5, unit: "piece", available: true },
      { item: "Eraser", price: 5, unit: "piece", available: true },
      { item: "Sharpener", price: 10, unit: "piece", available: true },
    ],
    image: "https://via.placeholder.com/100",
    verified: true,
    createdAt: "2024-02-15",
  },
  {
    id: "shop007",
    name: "Singh Dairy",
    ownerName: "Gurmeet Singh",
    address: "Gaushala Road, Ramnagar Village",
    category: "dairy",
    subCategory: "milk",
    description: "Fresh milk, curd, buttermilk and dairy products",
    email: "singh.dairy@example.com",
    phone: "9876543217",
    coordinates: {
      lat: 23.0275,
      lng: 72.5764
    },
    businessProof: "Food License",
    documents: {
      aadhaar: "uploaded",
      pan: "uploaded",
      license: "approved"
    },
    status: "approved",
    rating: 4.6,
    totalRatings: 156,
    openingTime: "6:00 AM",
    closingTime: "9:00 PM",
    deliveryAvailable: true,
    paymentMethods: ["cash", "upi"],
    inventory: [
      { item: "Milk", price: 25, unit: "liter", available: true },
      { item: "Curd", price: 30, unit: "kg", available: true },
      { item: "Butter", price: 50, unit: "pack", available: true },
      { item: "Paneer", price: 200, unit: "kg", available: true },
    ],
    image: "https://via.placeholder.com/100",
    verified: true,
    createdAt: "2024-01-18",
  },
  {
    id: "shop008",
    name: "Kumar Fertilizers",
    ownerName: "Anil Kumar",
    address: "Farmers Market, Ramnagar Village",
    category: "agriculture",
    subCategory: "fertilizers",
    description: "Fertilizers, seeds, and farming equipment",
    email: "kumar.agri@example.com",
    phone: "9876543218",
    coordinates: {
      lat: 23.0285,
      lng: 72.5774
    },
    businessProof: "GST Certificate",
    documents: {
      aadhaar: "uploaded",
      pan: "uploaded",
      license: "approved"
    },
    status: "approved",
    rating: 4.1,
    totalRatings: 67,
    openingTime: "8:00 AM",
    closingTime: "7:00 PM",
    deliveryAvailable: true,
    paymentMethods: ["cash", "upi"],
    inventory: [
      { item: "Urea", price: 300, unit: "bag", available: true },
      { item: "Seeds", price: 150, unit: "pack", available: true },
      { item: "Pesticide", price: 400, unit: "bottle", available: true },
      { item: "Tools", price: 500, unit: "set", available: true },
    ],
    image: "https://via.placeholder.com/100",
    verified: true,
    createdAt: "2024-02-05",
  }
];

const ShopsScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShop, setSelectedShop] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemSearchModal, setItemSearchModal] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'

  // Categories for filtering
  const categories = [
    { id: 'all', name: t('all'), icon: 'apps', color: '#64748b' },
    { id: 'grocery', name: t('grocery'), icon: 'shopping-cart', color: '#3b82f6' },
    { id: 'medical', name: t('medical'), icon: 'local-pharmacy', color: '#ef4444' },
    { id: 'hardware', name: t('hardware'), icon: 'hardware', color: '#f59e0b' },
    { id: 'electronics', name: t('electronics'), icon: 'devices', color: '#10b981' },
    { id: 'food', name: t('food'), icon: 'restaurant', color: '#8b5cf6' },
    { id: 'stationery', name: t('stationery'), icon: 'inventory', color: '#ec4899' },
    { id: 'dairy', name: t('dairy'), icon: 'local-cafe', color: '#14b8a6' },
    { id: 'agriculture', name: t('agriculture'), icon: 'agriculture', color: '#84cc16' },
  ];

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = () => {
    setLoading(true);

    const ref = db.ref("shops_list");

    ref.once("value").then(snapshot => {

      if (snapshot.exists()) {

        const data = snapshot.val();

        const shopArray = Object.keys(data).map(key => {

          const shop = data[key];

          return {
            id: key,
            name: shop.shopName || "Unnamed Shop",
            ownerName: shop.ownerName || "",
            address: shop.address || "",
            category: shop.category || "general",
            description: shop.description || "",
            phone: shop.phone || shop.mobile || "",
            email: shop.email || "",
            rating: shop.rating || 4,
            totalRatings: shop.totalRatings || 0,
            openingTime: shop.openingTime || "8:00 AM",
            closingTime: shop.closingTime || "8:00 PM",
            deliveryAvailable: shop.deliveryAvailable || false,
            verified: shop.status === "approved",

            coordinates: {
              lat: shop.coordinates?.lat || 0,
              lng: shop.coordinates?.lng || 0,
            },

            image: shop.shop_image?.profile?.url || null,

            // convert items → inventory array
            inventory: shop.items
              ? Object.values(shop.items)
              : [],

            status: shop.status
          };
        });

        const approvedShops = shopArray.filter(
          shop => shop.status === "approved"
        );

        setShops(approvedShops);
        setFilteredShops(approvedShops);

      } else {
        setShops([]);
        setFilteredShops([]);
      }

      setLoading(false);
      setRefreshing(false);

    }).catch(err => {
      console.log(err);
      setLoading(false);
      setRefreshing(false);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  // Handle search by shop name or item
  useEffect(() => {
    if (searchQuery.trim() === '') {
      filterByCategory();
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = shops.filter(shop =>
        shop.name.toLowerCase().includes(query) ||
        shop.category.toLowerCase().includes(query) ||
        shop.description.toLowerCase().includes(query) ||
        shop.inventory && shop.inventory.some(
          item => item.name?.toLowerCase().includes(query)
        )
      );

      if (selectedCategory === 'all') {
        setFilteredShops(filtered);
      } else {
        setFilteredShops(filtered.filter(shop => shop.category === selectedCategory));
      }
    }
  }, [searchQuery, shops]);

  const filterByCategory = () => {
    if (selectedCategory === 'all') {
      setFilteredShops(shops);
    } else {
      setFilteredShops(shops.filter(shop => shop.category === selectedCategory));
    }
  };

  useEffect(() => {
    filterByCategory();
  }, [selectedCategory]);

  // Search for items across all shops
  const searchItems = () => {
    if (!itemSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = itemSearchQuery.toLowerCase();
    const results = [];

    shops.forEach(shop => {
      const matchingItems = shop.inventory?.filter(item =>
        item.name?.toLowerCase().includes(query)
      ) || [];

      if (matchingItems.length > 0) {
        results.push({
          shop,
          items: matchingItems
        });
      }
    });

    setSearchResults(results);
  };

  useEffect(() => {
    searchItems();
  }, [itemSearchQuery]);

  const handleItemSearch = () => {
    setItemSearchModal(true);
    setItemSearchQuery('');
    setSearchResults([]);
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#64748b';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || 'store';
  };

  const handleNavigateToMap = (coordinates, shopName) => {
    navigation.navigate('Map', {
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      shopName: shopName,
      zoomIn: true
    });
  };

  const handleShopPress = (shop) => {
    setSelectedShop(shop);
    setModalVisible(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Icon key={i} name="star" size={14} color="#f59e0b" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Icon key={i} name="star-half" size={14} color="#f59e0b" />);
      } else {
        stars.push(<Icon key={i} name="star-border" size={14} color="#f59e0b" />);
      }
    }
    return stars;
  };

  const renderGridItem = ({ item }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => handleShopPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.gridIconContainer, { backgroundColor: categoryColor + '15' }]}>
          <Icon name={getCategoryIcon(item.category)} size={30} color={categoryColor} />
        </View>

        <Text style={styles.gridShopName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.gridTiming}>
          <Icon name="access-time" size={12} color="#64748b" />
          <Text style={styles.gridTimingText}>
            {item.openingTime} - {item.closingTime}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => handleShopPress(item)}
      >
        <View style={[styles.listIconContainer, { backgroundColor: categoryColor + '15' }]}>
          <Icon name={getCategoryIcon(item.category)} size={28} color={categoryColor} />
        </View>

        <View style={styles.listContent}>
          <Text style={styles.listShopName}>{item.name}</Text>

          <Text style={styles.listCategory}>
            {t(item.category)}
          </Text>

          <Text style={styles.listAddress}>
            {item.address}
          </Text>

          <TouchableOpacity
            style={styles.listNavigateButton}
            onPress={() => handleNavigateToMap(item.coordinates, item.name)}
          >
            <Icon name="navigation" size={16} color="#38bdf8" />
            <Text style={styles.listNavigateText}>{t('navigate')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultCard}
      onPress={() => {
        setItemSearchModal(false);
        setSelectedShop(item.shop);
        setModalVisible(true);
      }}
    >
      <View style={styles.searchResultHeader}>
        <View style={[styles.searchResultIcon, { backgroundColor: getCategoryColor(item.shop.category) + '15' }]}>
          <Icon name={getCategoryIcon(item.shop.category)} size={24} color={getCategoryColor(item.shop.category)} />
        </View>
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultShopName}>{item.shop.name}</Text>
          <Text style={styles.searchResultAddress} numberOfLines={1}>{item.shop.address}</Text>
        </View>
      </View>

      <View style={styles.searchResultItems}>
        <Text style={styles.searchResultItemsTitle}>{t('availableItems')}:</Text>
        {item.items.map((inv, idx) => (
          <View key={idx} style={styles.searchResultItem}>
            <Text style={styles.searchResultItemName}>{inv.name}</Text>
            <Text style={styles.searchResultItemPrice}>₹{inv.price}/{inv.unit}</Text>
            {inv.stock > 0 ? (
              <View style={styles.searchResultAvailable}>
                <Icon name="check-circle" size={12} color="#10b981" />
                <Text style={styles.searchResultAvailableText}>{t('inStock')}</Text>
              </View>
            ) : (
              <View style={styles.searchResultUnavailable}>
                <Icon name="cancel" size={12} color="#ef4444" />
                <Text style={styles.searchResultUnavailableText}>{t('outOfStock')}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('shops')}</Text>
          <TouchableOpacity
            style={styles.itemSearchButton}
            onPress={handleItemSearch}
          >
            <Icon name="search" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchShops')}
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
      </View>

      {/* Category Filter */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip,
                selectedCategory === category.id && { backgroundColor: category.color }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? '#ffffff' : category.color}
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.selectedCategoryChipText,
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggle, viewType === 'grid' && styles.viewToggleActive]}
            onPress={() => setViewType('grid')}
          >
            <Icon name="grid-view" size={20} color={viewType === 'grid' ? '#38bdf8' : '#94a3b8'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewType === 'list' && styles.viewToggleActive]}
            onPress={() => setViewType('list')}
          >
            <Icon name="view-list" size={20} color={viewType === 'list' ? '#38bdf8' : '#94a3b8'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Shops List/Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('loadingShops')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          renderItem={viewType === 'grid' ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          key={viewType}
          numColumns={viewType === 'grid' ? 2 : 1}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Shop Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            {selectedShop && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalShopHeader}>
                  <View style={[styles.modalIconContainer, { backgroundColor: getCategoryColor(selectedShop.category) + '15' }]}>
                    <Icon name={getCategoryIcon(selectedShop.category)} size={50} color={getCategoryColor(selectedShop.category)} />
                  </View>
                  <View style={styles.modalShopInfo}>
                    <Text style={styles.modalShopName}>{selectedShop.name}</Text>
                    <View style={styles.modalRating}>
                      <Icon name="star" size={16} color="#f59e0b" />
                      <Text style={styles.modalRatingText}>{selectedShop.rating}</Text>
                      <Text style={styles.modalTotalRatings}>({selectedShop.totalRatings})</Text>
                    </View>
                    <View style={styles.modalVerifiedBadge}>
                      <Icon name="verified" size={14} color="#38bdf8" />
                      <Text style={styles.modalVerifiedText}>{t('verifiedShop')}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Icon name="access-time" size={18} color="#38bdf8" />
                    <View style={styles.modalInfoContent}>
                      <Text style={styles.modalInfoLabel}>{t('timing')}</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedShop.openingTime} - {selectedShop.closingTime}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Icon name="phone" size={18} color="#38bdf8" />
                    <View style={styles.modalInfoContent}>
                      <Text style={styles.modalInfoLabel}>{t('phone')}</Text>
                      <Text style={styles.modalInfoValue}>{selectedShop.phone}</Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Icon name="email" size={18} color="#38bdf8" />
                    <View style={styles.modalInfoContent}>
                      <Text style={styles.modalInfoLabel}>{t('email')}</Text>
                      <Text style={styles.modalInfoValue}>{selectedShop.email}</Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Icon name="payment" size={18} color="#38bdf8" />
                    <View style={styles.modalInfoContent}>
                      <Text style={styles.modalInfoLabel}>{t('payment')}</Text>

                    </View>
                  </View>
                </View>

                <View style={styles.modalAddressCard}>
                  <Text style={styles.modalAddressLabel}>{t('address')}</Text>
                  <Text style={styles.modalAddressText}>{selectedShop.address}</Text>
                </View>

                <View style={styles.modalDescriptionCard}>
                  <Text style={styles.modalDescriptionLabel}>{t('description')}</Text>
                  <Text style={styles.modalDescriptionText}>{selectedShop.description}</Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.navigateModalButton]}
                    onPress={() => {
                      setModalVisible(false);
                      handleNavigateToMap(selectedShop.coordinates, selectedShop.name);
                    }}
                  >
                    <Icon name="navigation" size={20} color="#ffffff" />
                    <Text style={styles.modalActionText}>{t('navigateToShop')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.callModalButton]}
                    onPress={() => Alert.alert(t('call'), `${t('calling')} ${selectedShop.phone}`)}
                  >
                    <Icon name="phone" size={20} color="#ffffff" />
                    <Text style={styles.modalActionText}>{t('call')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Item Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={itemSearchModal}
        onRequestClose={() => setItemSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.searchModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>{t('searchItems')}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setItemSearchModal(false)}
              >
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <View style={styles.itemSearchContainer}>
              <Icon name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                style={styles.itemSearchInput}
                placeholder={t('searchForItem')}
                placeholderTextColor="#94a3b8"
                value={itemSearchQuery}
                onChangeText={setItemSearchQuery}
                autoFocus
              />
              {itemSearchQuery ? (
                <TouchableOpacity onPress={() => setItemSearchQuery('')}>
                  <Icon name="close" size={20} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <FlatList
              data={searchResults}
              renderItem={renderSearchResultItem}
              keyExtractor={(item, index) => item.shop.id + index}
              contentContainerStyle={styles.searchResultsContainer}
              ListEmptyComponent={
                itemSearchQuery ? (
                  <View style={styles.noResultsContainer}>
                    <Icon name="search-off" size={60} color="#e2e8f0" />
                    <Text style={styles.noResultsText}>{t('noItemsFound')}</Text>
                    <Text style={styles.noResultsSubText}>
                      {t('tryDifferentItem')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.searchPrompt}>
                    <Icon name="search" size={60} color="#e2e8f0" />
                    <Text style={styles.searchPromptText}>{t('searchForItemPrompt')}</Text>
                  </View>
                )
              }
              showsVerticalScrollIndicator={false}
            />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  itemSearchButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
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
  categorySection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    gap: 8,
    flex: 1,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
    color: '#1e293b',
  },
  selectedCategoryChipText: {
    color: '#ffffff',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
    marginLeft: 12,
  },
  viewToggle: {
    padding: 6,
    borderRadius: 6,
  },
  viewToggleActive: {
    backgroundColor: '#ffffff',
  },
  listContentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  resultHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#64748b',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  gridShopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
    height: 40,
  },
  gridRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 11,
    color: '#64748b',
  },
  gridTiming: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 4,
  },
  gridTimingText: {
    fontSize: 11,
    color: '#64748b',
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  gridBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  deliveryBadge: {
    backgroundColor: '#e6f7e6',
    borderRadius: 12,
    padding: 4,
  },
  verifiedBadge: {
    backgroundColor: '#e6f0ff',
    borderRadius: 12,
    padding: 4,
  },
  navigateSmallButton: {
    padding: 4,
  },
  listContainer: {
    gap: 12,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listShopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  listRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  listRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 2,
  },
  listCategory: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  listAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  listAddressText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTiming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listTimingText: {
    fontSize: 12,
    color: '#64748b',
  },
  listBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  deliveryChip: {
    backgroundColor: '#e6f7e6',
    borderRadius: 12,
    padding: 4,
  },
  verifiedChip: {
    backgroundColor: '#e6f0ff',
    borderRadius: 12,
    padding: 4,
  },
  listNavigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 4,
  },
  listNavigateText: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '500',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
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
    maxHeight: height * 0.9,
  },
  searchModal: {
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  modalShopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalShopInfo: {
    flex: 1,
  },
  modalShopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 4,
    marginRight: 4,
  },
  modalTotalRatings: {
    fontSize: 12,
    color: '#64748b',
  },
  modalVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  modalVerifiedText: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '500',
  },
  modalInfoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalInfoContent: {
    marginLeft: 12,
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  modalAddressCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  modalAddressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalAddressText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  modalDescriptionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  modalDescriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  navigateModalButton: {
    backgroundColor: '#38bdf8',
  },
  callModalButton: {
    backgroundColor: '#10b981',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  itemSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    padding: 0,
  },
  searchResultsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  searchResultCard: {
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
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchResultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultShopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 12,
    color: '#64748b',
  },
  searchResultItems: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  searchResultItemsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchResultItemName: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  searchResultItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginRight: 8,
  },
  searchResultAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7e6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  searchResultAvailableText: {
    fontSize: 10,
    color: '#10b981',
  },
  searchResultUnavailable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  searchResultUnavailableText: {
    fontSize: 10,
    color: '#ef4444',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  noResultsSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  searchPrompt: {
    alignItems: 'center',
    paddingTop: 40,
  },
  searchPromptText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default ShopsScreen;